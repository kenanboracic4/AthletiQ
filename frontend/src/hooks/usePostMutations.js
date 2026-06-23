
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addComment, deleteComment as deleteCommentApi, addCommentReply, deleteReplyComment as deleteReplyCommentApi, deletePost, editPost } from "@/api/posts";
import { createAdvertisment } from "@/api/adverisment";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { queryKeys } from "@/lib/queryKeys";

export function usePostMutations(targetQueryKey) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { mutate: submitComment } = useMutation({
        mutationFn: ({ postId, content }) => addComment(postId, content),
        onSuccess: (newComment, { postId }) => {
            toast.success("Komentar je uspješno dodan!");
            queryClient.setQueryData(targetQueryKey, (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        items: (page.items ?? page).map((post) =>
                            post.id === postId
                                ? {
                                    ...post,
                                    comments: [
                                        ...(post.comments ?? []),
                                        {
                                            ...newComment,
                                            user: {
                                                id: user.id,
                                                nickname: user.nickname,
                                                image: user.image ?? null,
                                            },
                                        },
                                    ],
                                }
                                : post
                        ),
                    })),
                };
            });
        },
        onError: () => toast.error("Greška prilikom dodavanja komentara!"),
    });

    const { mutate: removeComment } = useMutation({
        mutationFn: (commentId) => deleteCommentApi(commentId),
        onSuccess: (_, commentId) => {
            toast.success("Komentar je uspješno obrisan!");
            queryClient.setQueryData(targetQueryKey, (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        items: (page.items ?? page).map((post) => ({
                            ...post,
                            comments: (post.comments ?? []).filter((c) => c.id !== commentId),
                        })),
                    })),
                };
            });
        },
        onError: () => toast.error("Greška prilikom brisanja komentara!"),
    });

    const { mutate: submitCommentReply } = useMutation({
        mutationFn: ({ commentId, postId, content }) => addCommentReply(commentId, postId, content),
        onSuccess: (newComment, { commentId, postId }) => {
            toast.success("Odgovor je uspješno dodan!");
            queryClient.setQueryData(targetQueryKey, (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    pages: oldData.pages.map((page) => ({
                        ...page,
                        items: (page.items ?? page).map((post) =>
                            post.id === postId
                                ? {
                                    ...post,
                                    comments: (post.comments ?? []).map((c) =>
                                        c.id === commentId
                                            ? { ...c, reply_count: (c.reply_count ?? 0) + 1 }
                                            : c
                                    ),
                                }
                                : post
                        ),
                    })),
                };
            });
        },
        onError: () => toast.error("Greška prilikom dodavanja odgovora!"),
    });

    const { mutate: deleteCommentReply } = useMutation({
        mutationFn: (commentId) => deleteReplyCommentApi(commentId),
        onSuccess: (_, commentId) => {
            toast.success("Odgovor je obrisan!");
            queryClient.invalidateQueries(queryKeys.replies(commentId));
        },
        onError: () => toast.error("Greška pri brisanju odgovora!"),
    });

    const { mutate: deletePostFn } = useMutation({
        mutationFn: (postId) => deletePost(postId),
        onSuccess: () => {
            toast.success("Objava je obrisana!");
            queryClient.invalidateQueries({ queryKey: targetQueryKey });
        },
        onError: () => toast.error("Greška pri brisanju objave!"),
    });

    const { mutate: editPostFn } = useMutation({
        mutationFn: ({ postId, content, newFiles, deletedImageIds }) => editPost(postId, content, newFiles, deletedImageIds),
        onSuccess: () => {
            toast.success("Objava je uređena!");
            queryClient.invalidateQueries({ queryKey: targetQueryKey });
        },
        onError: (error) => {
            const serverMessage = error.response?.data?.detail || "Greška prilikom uređivanja objave!";
            toast.error(serverMessage);
        },
    });

    return {
        submitComment,
        removeComment,
        submitCommentReply,
        deleteCommentReply,
        deletePostFn,
        editPostFn,

    };

}

