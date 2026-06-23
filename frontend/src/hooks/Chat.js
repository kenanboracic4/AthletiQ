import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { queryKeys } from "@/lib/queryKeys";
import { createChat, getChatById, deleteChat, getUserChats } from "@/api/chat";

export const useChat = (chatId = null) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: chat, isLoading: isChatLoading } = useQuery({
        queryKey: queryKeys.chat(chatId),
        queryFn: () => getChatById(chatId),
        enabled: !!chatId,
    });

    const { data: userChats, isLoading: isChatsLoading } = useQuery({
        queryKey: queryKeys.chats,
        queryFn: () => getUserChats(),
    });

    const { mutateAsync: createChatAsync, isPending: isCreating } = useMutation({
        mutationFn: (data) => createChat(data),
        onSuccess: () => {

            queryClient.invalidateQueries({ queryKey: queryKeys.chats });
        },
        onError: (error) => {
            const serverMessage = error.response?.data?.detail || "Greška prilikom kreiranja chata!";
            toast.error(serverMessage);
        },
    });

    const { mutate: deleteChatFn, isPending: isDeleting } = useMutation({
        mutationFn: (chatId) => deleteChat(chatId),
        onSuccess: () => {
            toast.success('Chat obrisan!');
            queryClient.invalidateQueries({ queryKey: queryKeys.chats });
        },
        onError: (error) => {
            const serverMessage = error.response?.data?.detail || "Greška prilikom brisanja chata!";
            toast.error(serverMessage);
        },
    });

    return {
        chat,
        userChats,
        createChatAsync,
        deleteChatFn,
        isCreating,
        isDeleting,
        isChatLoading,
        isChatsLoading,
    };
};