"use client";
import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";
import ChatHeader from "../ChatHeader/ChatHeader";
import MessageList from "../MessageList/MessageList";
import MessageInput from "../MessageInput/MessageInput";
import styles from "./ChatWindow.module.css";
import { useChat } from "@/hooks/Chat";
import { useChatMessages } from "@/hooks/ChatMessages";
import { getOtherParticipant } from "@/lib/chatHelpers";

export default function ChatWindow({ chatId, currentUserId, onBack, showBackButton = false }) {
    const scrollRef = useRef(null);
    const { chat, isChatLoading } = useChat(chatId);
    const { allMessages, isHistoryLoading, isConnected, sendMessage } = useChatMessages(chatId);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatId, allMessages.length]);

    if (!chatId) {
        return (
            <div className={styles.window}>
                <div className={styles.emptyState}>
                    <MessageCircle size={42} strokeWidth={1.5} />
                    <p>Odaberi razgovor da započneš poruku</p>
                </div>
            </div>
        );
    }

    if (isChatLoading || !chat) {
        return (
            <div className={styles.window}>
                <div className={styles.emptyState}>
                    <p>Učitavanje razgovora...</p>
                </div>
            </div>
        );
    }

    const otherUser = getOtherParticipant(chat, currentUserId);

    return (
        <div className={styles.window}>
            <div className={styles.headerSlot}>
                <ChatHeader
                    otherUser={otherUser}
                    isConnected={isConnected}
                    advertismentId={chat?.advertisment_id}
                    advertismentTitle={chat?.advertisment?.title}
                    onBack={onBack}
                    showBackButton={showBackButton}
                />
            </div>
            <div className={styles.bodyWrap}>
                <div className={styles.messagesPane} ref={scrollRef}>
                    <MessageList
                        messages={allMessages}
                        isLoading={isHistoryLoading}
                        currentUserId={currentUserId}
                        otherUser={otherUser}
                    />
                </div>
                <div className={styles.composer}>
                    <MessageInput onSend={sendMessage} />
                </div>
            </div>
        </div>
    );
}