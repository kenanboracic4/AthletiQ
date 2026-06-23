'use client';

import Navbar from "@/components/NavBar/NavBar";
import SideNav from "@/components/SideNav/SideNav";
import styles from "./page.module.css";
import layout from "@/styles/pageLayout.module.css";
import { Bell, CheckCheck } from "lucide-react"
import { useNotifications } from "@/hooks/Notification";
import { useFriendRequest } from "@/hooks/FriendRequest";
import NotificationItem from "@/components/NotificationItem/NotificationItem";

export default function NotificationsPage() {
    const {
        notifications,
        unreadCount,
        isNotificationsLoading,
        markAllAsReadFn,
        markOneAsReadFn,
        deleteNotificationFn,
        isMarkingAll,
        isMarkingOne,
        isDeleting,
    } = useNotifications();

    const {
        acceptRequestFn,
        declineRequestFn,
        isAccepting,
        isDeclining,
    } = useFriendRequest();

    const handleAcceptFriend = (nickname, notificationId) => {
        acceptRequestFn(nickname, { onSuccess: () => deleteNotificationFn(notificationId) });
    };

    const handleDeclineFriend = (nickname, notificationId) => {
        declineRequestFn(nickname, { onSuccess: () => deleteNotificationFn(notificationId) });
    };

    return (
        <main>
            <Navbar />
            <div className={layout.mainContainer}>
                <aside className={layout.leftColumn}>
                    <SideNav />
                </aside>

                <section className={layout.centerColumn}>
                    <div className={styles.card}>
                        <div className={styles.header}>
                            <div className={styles.headerLeft}>
                                <Bell size={18} />
                                <span className={styles.title}>Notifikacije</span>
                                {unreadCount > 0 && (
                                    <span className={styles.badge}>{unreadCount} nove</span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    className={styles.markAllBtn}
                                    onClick={() => markAllAsReadFn()}
                                    disabled={isMarkingAll}
                                >
                                    <CheckCheck size={14} />
                                    {isMarkingAll ? "Označavanje..." : "Označi sve kao pročitano"}
                                </button>
                            )}
                        </div>

                        <div className={styles.list}>
                            {isNotificationsLoading ? (
                                <div className={styles.stateWrap}>
                                    <div className={styles.spinnerRing} />
                                    <p className={styles.stateText}>Učitavanje notifikacija...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className={styles.stateWrap}>
                                    <div className={styles.emptyIcon}>
                                        <Bell size={32} strokeWidth={1.5} />
                                    </div>
                                    <p className={styles.stateTitle}>Nema notifikacija</p>
                                    <p className={styles.stateSubtitle}>Kada neko počne da te prati ili lajkuje tvoj post, vidjet ćeš to ovdje.</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <NotificationItem
                                        key={notif.id}
                                        notification={notif}
                                        onMarkAsRead={markOneAsReadFn}
                                        onDelete={deleteNotificationFn}
                                        onAcceptFriend={handleAcceptFriend}
                                        onDeclineFriend={handleDeclineFriend}
                                        isMarkingOne={isMarkingOne}
                                        isDeleting={isDeleting}
                                        isAccepting={isAccepting}
                                        isDeclining={isDeclining}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </section>

                <aside className={layout.rightColumn} />
            </div>
        </main>
    );
}