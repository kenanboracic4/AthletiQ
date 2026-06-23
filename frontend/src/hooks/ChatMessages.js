import { useEffect, useRef, useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { queryKeys } from "@/lib/queryKeys";
import { getAccessToken } from "@/api/api";
import {
    getMessagesByChat,
    deleteMessage,
    markMessagesAsRead,
} from "@/api/chatMessages";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";
const MARK_READ_DEBOUNCE_MS = 500;

export const useChatMessages = (chatId) => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const queryClient = useQueryClient();
    const wsRef = useRef(null);
    const [wsMessages, setWsMessages] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    const markReadTimeoutRef = useRef(null);

    const { data: messageHistory = [], isLoading: isHistoryLoading } = useQuery({
        queryKey: queryKeys.messages(chatId),
        queryFn: () => getMessagesByChat(chatId),
        enabled: !!chatId && !isAuthLoading,
    });

    const markAndUpdateMessages = useCallback(async (id) => {
        await markMessagesAsRead(id);

        setWsMessages((prev) =>
            prev.map((m) =>
                m.sender_id !== user?.id ? { ...m, is_read: true } : m
            )
        );

        queryClient.invalidateQueries({ queryKey: queryKeys.messages(id) });
    }, [user?.id, queryClient]);

    useEffect(() => {
        if (!chatId || isHistoryLoading) return;
        markAndUpdateMessages(chatId);
    }, [chatId, isHistoryLoading, markAndUpdateMessages]);

    const scheduleMarkAsRead = useCallback((id) => {
        if (markReadTimeoutRef.current) clearTimeout(markReadTimeoutRef.current);
        markReadTimeoutRef.current = setTimeout(() => {
            markAndUpdateMessages(id);
        }, MARK_READ_DEBOUNCE_MS);
    }, [markAndUpdateMessages]);

    useEffect(() => {
        if (!chatId || isAuthLoading) return;

        const token = getAccessToken();
        if (!token) return;

        const ws = new WebSocket(
            `${WS_URL}/chat-messages/ws/${chatId}?token=${encodeURIComponent(token)}`
        );
        wsRef.current = ws;

        ws.onopen = () => setIsConnected(true);

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setWsMessages((prev) => [...prev, message]);

            if (message.sender_id !== user?.id) {
                scheduleMarkAsRead(chatId);
            }
            queryClient.invalidateQueries({ queryKey: queryKeys.chats });
        };

        ws.onclose = (event) => {
            console.log("WS closed:", event.code, event.reason);
            setIsConnected(false);
        };

        ws.onerror = () => {
            setIsConnected(false);

        };

        return () => {
            ws.close();
            setWsMessages([]);
            if (markReadTimeoutRef.current) clearTimeout(markReadTimeoutRef.current);
        };
    }, [chatId, isAuthLoading, user?.id, scheduleMarkAsRead]);

    const sendMessage = (content) => {
        if (!content.trim()) return;
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(content);
        } else {
            toast.error("Veza nije uspostavljena, pokušaj ponovo!");
        }
    };

    const { mutate: deleteMessageFn, isPending: isDeleting } = useMutation({
        mutationFn: (messageId) => deleteMessage(messageId),
        onSuccess: (_, messageId) => {
            setWsMessages((prev) => prev.filter((m) => m.id !== messageId));
            queryClient.invalidateQueries({ queryKey: queryKeys.messages(chatId) });
            toast.success("Poruka obrisana!");
        },
        onError: (error) => {
            const serverMessage =
                error.response?.data?.detail || "Greška prilikom brisanja poruke!";
            toast.error(serverMessage);
        },
    });

    const merged = new Map();
    [...messageHistory, ...wsMessages].forEach((m) => merged.set(m.id, m));
    const allMessages = Array.from(merged.values()).sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    return {
        allMessages,
        isHistoryLoading,
        isConnected,
        sendMessage,
        deleteMessageFn,
        isDeleting,
    };
};