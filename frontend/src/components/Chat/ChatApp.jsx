"use client";
import { useEffect, useState } from "react";
import ChatList from "./ChatList/Chatlist";
import ChatWindow from "./ChatWindow/ChatWindow";
import styles from "./Chatapp.module.css";
import { useChat } from "@/hooks/Chat";
import { useAuth } from "@/context/AuthContext";
import Navbar from "../NavBar/NavBar";

export default function ChatApp({ initialChatId = null }) {
    const { user } = useAuth();
    const { userChats = [], isChatsLoading } = useChat();
    const [activeChatId, setActiveChatId] = useState(initialChatId);
    const [mobileShowChat, setMobileShowChat] = useState(!!initialChatId);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        const sync = () => setIsMobile(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    useEffect(() => {
        if (initialChatId) {
            setActiveChatId(initialChatId);
            setMobileShowChat(true);
        }
    }, [initialChatId]);

    useEffect(() => {
        if (!activeChatId && userChats.length > 0 && !isMobile) {
            setActiveChatId(userChats[0].id);
        }
    }, [userChats, activeChatId, isMobile]);

    const handleSelectChat = (chatId) => {
        setActiveChatId(chatId);
        setMobileShowChat(true);
    };

    const handleBackToList = () => {
        setMobileShowChat(false);
    };

    return (
        <div className={styles.page} data-chat-page>
            <Navbar />
            <div className={styles.shell}>
                <div className={styles.app}>
                    <div className={`${styles.listPane} ${mobileShowChat ? styles.hiddenMobile : ""}`}>
                        <ChatList
                            chats={userChats}
                            isLoading={isChatsLoading}
                            activeChatId={activeChatId}
                            currentUserId={user?.id}
                            onSelectChat={handleSelectChat}
                        />
                    </div>
                    <div className={`${styles.chatPane} ${!mobileShowChat ? styles.hiddenMobile : ""}`}>
                        <ChatWindow
                            chatId={activeChatId}
                            currentUserId={user?.id}
                            onBack={handleBackToList}
                            showBackButton={isMobile && mobileShowChat}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
