import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryKeys } from "@/lib/queryKeys";
import {
    getNotifications,
    getUnreadCount,
    markAllAsRead,
    markOneAsRead,
    deleteNotification,
} from "@/api/notifications";

export const useNotifications = () => {
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading: isNotificationsLoading } = useQuery({
        queryKey: queryKeys.notifications,
        queryFn: () => getNotifications(),
    });

    const { data: unreadData, isLoading: isUnreadLoading } = useQuery({
        queryKey: queryKeys.notificationsUnread,
        queryFn: () => getUnreadCount(),
    });

    const { mutate: markAllAsReadFn, isPending: isMarkingAll } = useMutation({
        mutationFn: () => markAllAsRead(),
        onSuccess: () => {
            toast.success("Sve notifikacije označene kao pročitane!");
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
            queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnread });
        },
        onError: (error) => {
            const serverMessage = error.response?.data?.detail || "Greška prilikom označavanja!";
            toast.error(serverMessage);
        },
    });

    const { mutate: markOneAsReadFn, isPending: isMarkingOne } = useMutation({
        mutationFn: (notificationId) => markOneAsRead(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
            queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnread });
        },
        onError: (error) => {
            const serverMessage = error.response?.data?.detail || "Greška prilikom označavanja!";
            toast.error(serverMessage);
        },
    });

    const { mutate: deleteNotificationFn, isPending: isDeleting } = useMutation({
        mutationFn: (notificationId) => deleteNotification(notificationId),
        onSuccess: () => {
            toast.success("Notifikacija obrisana!");
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
            queryClient.invalidateQueries({ queryKey: queryKeys.notificationsUnread });
        },
        onError: (error) => {
            const serverMessage = error.response?.data?.detail || "Greška prilikom brisanja!";
            toast.error(serverMessage);
        },
    });

    return {
        notifications,
        unreadCount: unreadData?.unread_count ?? 0,
        isNotificationsLoading,
        isUnreadLoading,
        markAllAsReadFn,
        markOneAsReadFn,
        deleteNotificationFn,
        isMarkingAll,
        isMarkingOne,
        isDeleting,
    };
};