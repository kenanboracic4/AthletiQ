import styles from "./Message.module.css";
import { getAvatarUrl, formatMessageTime } from "@/lib/chatHelpers";

export default function Message({ message, isMine, otherUser, isRead }) {
    return (
        <div className={`${styles.row} ${isMine ? styles.mine : styles.theirs}`}>
            {!isMine && (
                <img src={getAvatarUrl(otherUser)} alt={otherUser?.nickname} className={styles.avatar} />
            )}
            <div className={styles.bubbleWrap}>
                <div className={styles.bubble}>{message.content}</div>
                <div className={styles.meta}>
                    <span className={styles.time}>{formatMessageTime(message.created_at)}</span>
                    {isMine && isRead && (
                        <img
                            src={getAvatarUrl(otherUser)}
                            alt="seen"
                            className={styles.seenAvatar}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}