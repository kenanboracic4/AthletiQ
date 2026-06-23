import { Heart, UserPlus, UserCheck, MessageCircle, Flag, Check, X, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";
import styles from "./NotificationItem.module.css";

const AVATAR_COLORS = [
    { bg: "#E1F5EE", color: "#085041" },
    { bg: "#EEEDFE", color: "#3C3489" },
    { bg: "#FAECE7", color: "#712B13" },
    { bg: "#F1EFE8", color: "#444441" },
    { bg: "#EAF3DE", color: "#27500A" },
    { bg: "#FBEAF0", color: "#72243E" },
];

function formatTime(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
}

function NotifIcon({ type }) {
    if (type === "follow") return <UserPlus size={13} />;
    if (type === "like") return <Heart size={13} />;
    if (type === "comment") return <MessageCircle size={13} />;
    if (type === "report") return <Flag size={13} />;
    if (type === "friend_request") return <UserPlus size={13} />;
    if (type === "friend_accept") return <UserCheck size={13} />;
    return null;
}

function getNotifText(notif) {
    const name = notif.sender?.nickname || "Korisnik";
    const fullName = notif.sender?.full_name || name;

    switch (notif.notification_type) {
        case "follow": return <><span className={styles.bold}>{fullName}</span> počeo/la te pratiti</>;
        case "like": return <><span className={styles.bold}>{fullName}</span> lajkovao/la tvoj post</>;
        case "comment": return <><span className={styles.bold}>{fullName}</span> komentarisao/la tvoj post</>;
        case "report": return <><span className={styles.bold}>{fullName}</span> prijavio/la sadržaj za moderaciju</>;
        case "friend_request": return <><span className={styles.bold}>{fullName}</span> ti je poslao/la zahtjev za prijateljstvo</>;
        case "friend_accept": return <><span className={styles.bold}>{fullName}</span> je prihvatio/la tvoj zahtjev za prijateljstvo</>;
        default: return <span className={styles.bold}>{fullName}</span>;
    }
}

export default function NotificationItem({
    notification,
    onMarkAsRead,
    onDelete,
    onAcceptFriend,
    onDeclineFriend,
    isMarkingOne,
    isDeleting,
    isAccepting,
    isDeclining,
}) {
    const idx = notification.id?.charCodeAt(0) % AVATAR_COLORS.length || 0;
    const colors = AVATAR_COLORS[idx];
    const name = notification.sender?.full_name || notification.sender?.nickname || "?";
    const hasPostLink = notification.post_id &&
        (notification.notification_type === "like" || notification.notification_type === "comment");
    const isReport = notification.notification_type === "report";

    const isFollow = notification.notification_type === "follow";
    const isFriendRequest = notification.notification_type === "friend_request";
    const isFriendAccept = notification.notification_type === "friend_accept";
    const senderNickname = notification.sender?.nickname;
    const profileHref = `/profile/${senderNickname}`;

    const content = (
        <>
            <div className={styles.avatar} style={{ background: colors.bg, color: colors.color }}>
                <img src={notification.sender?.image ?? "/no-profile-picture.png"} alt={name} className={styles.avatarImg} />
            </div>
            <div className={styles.iconWrap} style={{ background: colors.bg, color: colors.color }}>
                <NotifIcon type={notification.notification_type} />
            </div>
            <div className={styles.content}>
                <p className={styles.text}>{getNotifText(notification)}</p>
                <span className={styles.time}>{formatTime(notification.created_at)}</span>
            </div>
            {hasPostLink && (
                <ChevronRight size={16} className={styles.chevron} />
            )}
            {isReport && (
                <ChevronRight size={16} className={styles.chevron} />
            )}
        </>
    );

    return (
        <div className={`${styles.item} ${!notification.is_read ? styles.unread : ""}`}>
            {hasPostLink ? (
                <Link href={`/post/${notification.post_id}`} className={styles.itemLink}>
                    {content}
                </Link>
            ) : isReport ? (
                <Link href="/admin/reports" className={styles.itemLink}>
                    {content}
                </Link>
            ) : (isFollow || isFriendAccept) ? (
                <Link href={profileHref} className={styles.itemLink}>
                    {content}
                </Link>
            ) : (
                <div className={styles.itemContent}>
                    {content}
                </div>
            )}

            <div className={`${styles.actions} ${isFriendRequest ? styles.actionsVisible : ""}`}>
                {isFriendRequest && (
                    <>
                        <button
                            className={styles.acceptBtn}
                            onClick={() => onAcceptFriend?.(senderNickname, notification.id)}
                            disabled={isAccepting || isDeclining}
                            title="Prihvati"
                        >
                            <Check size={14} />
                        </button>
                        <button
                            className={styles.declineBtn}
                            onClick={() => onDeclineFriend?.(senderNickname, notification.id)}
                            disabled={isAccepting || isDeclining}
                            title="Odbij"
                        >
                            <X size={14} />
                        </button>
                    </>
                )}
                {!notification.is_read && (
                    <button
                        className={styles.readBtn}
                        onClick={() => onMarkAsRead(notification.id)}
                        disabled={isMarkingOne}
                        title="Označi kao pročitano"
                    >
                        <Check size={14} />
                    </button>
                )}
                <button
                    className={styles.deleteBtn}
                    onClick={() => onDelete(notification.id)}
                    disabled={isDeleting}
                    title="Obriši"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {!notification.is_read && <div className={styles.dot} />}
        </div>
    );
}