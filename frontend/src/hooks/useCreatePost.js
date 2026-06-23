import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPost } from "@/api/posts";
import toast from "react-hot-toast";
import { queryKeys } from "@/lib/queryKeys";

export function useCreatePost({ onSuccess } = {}) {
    const queryClient = useQueryClient();

    const { mutate: createPost, isPending } = useMutation({
        mutationFn: addPost,
        onSuccess: (data) => {
            toast.success("Objava uspješno kreirana!", {
                position: "bottom-center",
                autoClose: 3000,
            });
            queryClient.invalidateQueries({ queryKey: queryKeys.posts });
            queryClient.invalidateQueries({ queryKey: queryKeys.feed });
            queryClient.invalidateQueries({ queryKey: queryKeys.friendsFeed });
            onSuccess?.(data);
        },
        onError: (error) => {
            const detail = error?.response?.data?.detail;
            let message = "Greška prilikom kreiranja objave.";

            if (typeof detail === "string") {
                message = detail;
            } else if (Array.isArray(detail)) {
                message = detail[0]?.msg || message;
            }

            toast.error(message);
        },
    });

    return { createPost, isPending };
}
