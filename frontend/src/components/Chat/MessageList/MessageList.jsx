import Message from "../Message/Message";
import styles from "./MessageList.module.css";

export default function MessageList({ messages, isLoading, currentUserId, otherUser }) {
    return (
        <div className={styles.area}>
            <div className={styles.messages}>
                <div className={styles.dayDivider}>
                    <span>{isLoading ? "Učitavanje..." : "Danas"}</span>
                </div>
                {messages.map((message) => (
                    <Message
                        key={message.id}
                        message={message}
                        isMine={message.sender_id === currentUserId}
                        otherUser={otherUser}
                        isRead={message.is_read}
                    />
                ))}
            </div>
        </div>
    );
}