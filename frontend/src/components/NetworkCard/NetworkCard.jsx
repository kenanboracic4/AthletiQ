"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    UserPlus, UserCheck, UserX, Clock, Plus, MinusCircle, ArrowRight,
} from "lucide-react";

import styles from "./NetworkCard.module.css";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/hooks/User";
import { useFriendRequest } from "@/hooks/FriendRequest";

export default function NetworkCard({
    id,
    nickname,
    image,
    title,
    subtitle,
    isPrivate = false,
    friendshipStatus = "none",
    isFollowing = false,
}) {
    const { user: loggedInUser } = useAuth();
    const router = useRouter();
    const { submitFollowSuggested } = useUser();
    const {
        sendRequestFn, acceptRequestFn, declineRequestFn, cancelRequestFn, removeFriendFn,
        isSending, isAccepting, isDeclining, isCancelling, isRemoving,
    } = useFriendRequest();

    const [friendStatus, setFriendStatus] = useState(friendshipStatus);
    const [following, setFollowing] = useState(isFollowing);

    useEffect(() => setFriendStatus(friendshipStatus), [friendshipStatus]);
    useEffect(() => setFollowing(isFollowing), [isFollowing]);

    const isOwnProfile = loggedInUser?.nickname === nickname;
    const friendActionInProgress = isSending || isAccepting || isDeclining || isCancelling || isRemoving;

    const handleFollowClick = () => {
        submitFollowSuggested(nickname, {}, () => setFollowing((prev) => !prev));
    };

    const handleFriendAction = () => {
        if (!loggedInUser) {
            router.push("/login");
            return;
        }
        if (friendStatus === "none") {
            sendRequestFn(nickname, { onSuccess: () => setFriendStatus("request_sent") });
        } else if (friendStatus === "request_sent") {
            cancelRequestFn(nickname, { onSuccess: () => setFriendStatus("none") });
        } else if (friendStatus === "request_received") {
            acceptRequestFn(nickname, { onSuccess: () => setFriendStatus("friends") });
        } else if (friendStatus === "friends") {
            removeFriendFn(nickname, { onSuccess: () => setFriendStatus("none") });
        }
    };

    const handleDeclineFriend = () => {
        declineRequestFn(nickname, { onSuccess: () => setFriendStatus("none") });
    };

    const renderAction = () => {
        if (isOwnProfile) {
            return (
                <Link href={`/profile/${nickname}`} className={styles.btnOutline}>
                    Tvoj profil
                </Link>
            );
        }

        if (isPrivate) {
            if (friendStatus === "friends") {
                return (
                    <button onClick={handleFriendAction} className={styles.btnOutline} disabled={friendActionInProgress}>
                        <UserCheck size={14} strokeWidth={2.5} /> Prijatelji
                    </button>
                );
            }
            if (friendStatus === "request_sent") {
                return (
                    <button onClick={handleFriendAction} className={styles.btnOutline} disabled={friendActionInProgress}>
                        <Clock size={14} strokeWidth={2.5} /> Zahtjev poslan
                    </button>
                );
            }
            if (friendStatus === "request_received") {
                return (
                    <div className={styles.actionGroup}>
                        <button onClick={handleFriendAction} className={styles.btnPrimary} disabled={friendActionInProgress}>
                            <UserCheck size={14} strokeWidth={2.5} /> Prihvati
                        </button>
                        <button onClick={handleDeclineFriend} className={styles.btnOutline} disabled={friendActionInProgress}>
                            <UserX size={14} strokeWidth={2.5} /> Odbij
                        </button>
                    </div>
                );
            }
            return (
                <button onClick={handleFriendAction} className={styles.btnPrimary} disabled={friendActionInProgress}>
                    <UserPlus size={14} strokeWidth={2.5} /> Dodaj prijatelja
                </button>
            );
        }

        return following ? (
            <button onClick={handleFollowClick} className={styles.btnOutline}>
                <MinusCircle size={14} strokeWidth={2.5} /> Otprati
            </button>
        ) : (
            <button onClick={handleFollowClick} className={styles.btnPrimary}>
                <Plus size={14} strokeWidth={2.5} /> Zaprati
            </button>
        );
    };

    return (
        <div className={styles.card}>
            <Link href={`/profile/${nickname}`} className={styles.identity}>
                <div className={styles.avatar}>
                    <img
                        src={image ?? "/no-profile-picture.png"}
                        alt={title ?? nickname}
                        className={styles.avatarImg}
                    />
                </div>
                <div className={styles.meta}>
                    <span className={styles.name}>{title ?? nickname}</span>
                    {subtitle && <span className={styles.sub}>{subtitle}</span>}
                </div>
            </Link>

            <div className={styles.actions}>
                {renderAction()}
                <Link href={`/profile/${nickname}`} className={styles.profileLink}>
                    Profil <ArrowRight size={13} />
                </Link>
            </div>
        </div>
    );
}
