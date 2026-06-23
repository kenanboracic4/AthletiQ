"use client";
import { useState } from "react";
import { Search, SquarePen } from "lucide-react";
import ChatListItem from "../ChatListItem/ChatListItem";
import styles from "./ChatList.module.css";
import { getOtherParticipant } from "@/lib/chatHelpers";

export default function ChatList({ chats = [], isLoading, activeChatId, currentUserId, onSelectChat }) {
    const [query, setQuery] = useState("");

    const filteredChats = chats.filter((chat) => {
        const otherUser = getOtherParticipant(chat, currentUserId);
        return (otherUser?.nickname ?? "").toLowerCase().includes(query.toLowerCase());
    });

    return (
        <aside className={styles.sidebar}>
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <h2 className={styles.title}>Poruke</h2>
                    <button type="button" className={styles.newChatBtn} aria-label="Nova poruka">
                        <SquarePen size={20} />
                    </button>
                </div>
                <div className={styles.searchBox}>
                    <Search size={16} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Pretraži razgovore"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
            </div>
            <div className={styles.list}>
                {isLoading ? (
                    <p className={styles.empty}>Učitavanje razgovora...</p>
                ) : filteredChats.length > 0 ? (
                    filteredChats.map((chat) => (
                        <ChatListItem
                            key={chat.id}
                            chat={chat}
                            currentUserId={currentUserId}
                            isActive={chat.id === activeChatId}
                            onClick={() => onSelectChat(chat.id)}
                        />
                    ))
                ) : (
                    <p className={styles.empty}>
                        {query
                            ? `Nema rezultata za "${query}"`
                            : "Još nemaš razgovora. Pošalji poruku s profila ili oglasa."}
                    </p>
                )}
            </div>
        </aside>
    );
}