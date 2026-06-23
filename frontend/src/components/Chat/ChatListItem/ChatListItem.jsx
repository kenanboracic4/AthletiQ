import styles from "./ChatListItem.module.css";
import { getOtherParticipant, getAvatarUrl, formatMessageTime } from "@/lib/chatHelpers";

export default function ChatListItem({ chat, currentUserId, isActive, onClick }) {
    const otherUser = getOtherParticipant(chat, currentUserId);
    const name = otherUser?.nickname ?? "Nepoznat korisnik";

    return (
        <button
            type="button"
            className={`${styles.item} ${isActive ? styles.active : ""}`}
            onClick={onClick}
        >
            <div className={styles.avatarWrap}>
                <img src={getAvatarUrl(otherUser)} alt={name} className={styles.avatar} />
                {chat.unread_count > 0 && <span className={styles.unreadCount}>{chat.unread_count}</span>}
            </div>
            <div className={styles.info}>
                <div className={styles.top}>
                    <span className={styles.name}>{name}</span>
                    <span className={styles.time}>{formatMessageTime(chat.created_at)}</span>
                </div>
                <p className={styles.preview}>Otvori razgovor</p>
            </div>
        </button>
    );
}