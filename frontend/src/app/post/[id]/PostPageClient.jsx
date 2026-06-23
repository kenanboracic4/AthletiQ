"use client";
import { useQuery } from "@tanstack/react-query";
import SocialPostCard from "@/components/PostCard/PostCard";
import { usePostMutations } from "@/hooks/usePostMutations";
import { getPostById } from "@/api/posts";
import { queryKeys } from "@/lib/queryKeys";

export default function PostCardWrapper({ post: initialPost }) {
    const queryKey = queryKeys.post(initialPost.id);

    const { data: post = initialPost } = useQuery({
        queryKey,
        queryFn: () => getPostById(initialPost.id),
        initialData: initialPost,
        staleTime: 30_000,
    });

    const {
        submitComment,
        removeComment,
        submitCommentReply,
        deleteCommentReply,
        deletePostFn,
        editPostFn,
    } = usePostMutations(queryKey);

    return (
        <SocialPostCard
            post={post}
            onCommentSubmit={submitComment}
            onDeleteComment={removeComment}
            onCommentReplySubmit={submitCommentReply}
            onDeleteCommentReply={deleteCommentReply}
            onDeletePost={deletePostFn}
            onEditPost={editPostFn}
        />
    );
}