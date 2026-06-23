import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { queryKeys } from "@/lib/queryKeys";
import {
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
    removeFriend,
    getIncomingFriendRequests,
} from "@/api/friendRequests";

export const useFriendRequest = (profileNickname = "") => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const invalidateFriendData = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
        queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnread });
        queryClient.invalidateQueries({ queryKey: queryKeys.friendRequestsIncoming });
        if (profileNickname) {
            queryClient.invalidateQueries({ queryKey: queryKeys.userProfile(profileNickname) });
        }
    };

    const { data: incomingRequests = [], isLoading: isLoadingIncoming } = useQuery({
        queryKey: queryKeys.friendRequestsIncoming,
        queryFn: () => getIncomingFriendRequests(),
        enabled: !!user?.id,
    });

    const onError = (error) => {
        const message = error?.response?.data?.detail || "Greška prilikom obrade zahtjeva!";
        toast.error(message);
    };

    const { mutate: sendRequestFn, isPending: isSending } = useMutation({
        mutationFn: (nickname) => sendFriendRequest(nickname),
        onSuccess: (data) => {
            toast.success(data.detail);
            invalidateFriendData();
        },
        onError,
    });

    const { mutate: acceptRequestFn, isPending: isAccepting } = useMutation({
        mutationFn: (nickname) => acceptFriendRequest(nickname),
        onSuccess: (data) => {
            toast.success(data.detail);
            invalidateFriendData();
        },
        onError,
    });

    const { mutate: declineRequestFn, isPending: isDeclining } = useMutation({
        mutationFn: (nickname) => declineFriendRequest(nickname),
        onSuccess: (data) => {
            toast.success(data.detail);
            invalidateFriendData();
        },
        onError,
    });

    const { mutate: cancelRequestFn, isPending: isCancelling } = useMutation({
        mutationFn: (nickname) => cancelFriendRequest(nickname),
        onSuccess: (data) => {
            toast.success(data.detail);
            invalidateFriendData();
        },
        onError,
    });

    const { mutate: removeFriendFn, isPending: isRemoving } = useMutation({
        mutationFn: (nickname) => removeFriend(nickname),
        onSuccess: (data) => {
            toast.success(data.detail);
            invalidateFriendData();
        },
        onError,
    });

    return {
        incomingRequests,
        isLoadingIncoming,
        sendRequestFn,
        acceptRequestFn,
        declineRequestFn,
        cancelRequestFn,
        removeFriendFn,
        isSending,
        isAccepting,
        isDeclining,
        isCancelling,
        isRemoving,
    };
};
