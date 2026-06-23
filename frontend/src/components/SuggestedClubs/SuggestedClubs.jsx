"use client";

import { ChevronRight, PlusCircle, MinusCircle } from "lucide-react";
import styles from "./SuggestedClubs.module.css";
import { useUser } from "@/hooks/User";
import Link from "next/link";
import { useState, useEffect } from "react";

function SkeletonRow() {
    return (
        <li className={styles.row}>
            <div className={styles.avatarSkeleton} />
            <div className={styles.info}>
                <div className={styles.skeletonLine} style={{ width: "60%", height: 12 }} />
                <div className={styles.skeletonLine} style={{ width: "40%", height: 10, marginTop: 6 }} />
                <div className={styles.skeletonLine} style={{ width: "50%", height: 24, marginTop: 6, borderRadius: 6 }} />
            </div>
        </li>
    );
}

export default function SuggestedClubs() {
    const { suggestedClubs, isLoadingSuggestedClubs, submitFollowSuggested } = useUser();
    const [localFollow, setLocalFollow] = useState({});

    useEffect(() => {
        if (!suggestedClubs) return;
        const initial = {};
        suggestedClubs.forEach((club) => {
            initial[club.id] = club.is_following;
        });
        setLocalFollow(initial);
    }, [suggestedClubs]);

    const isFollowing = (clubId) => localFollow[clubId] ?? false;

    const handleFollow = (club) => {
        submitFollowSuggested(club.nickname, {}, () => {
            setLocalFollow((prev) => ({
                ...prev,
                [club.id]: !prev[club.id],
            }));
        });
    };

    const buildSub = (club) => {
        return [club.sport, club.location].filter(Boolean).join(" · ") || "Klub";
    };

    return (
        <div className={styles.widget}>
            <h2 className={styles.title}>Predloženi klubovi</h2>

            <ul className={styles.list}>
                {isLoadingSuggestedClubs
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                    : suggestedClubs?.map((club) => (
                        <li key={club.id} className={styles.row}>
                            <div className={styles.avatar}>
                                <img
                                    src={club.image ?? "/no-profile-picture.png"}
                                    alt={club.club_name ?? club.nickname}
                                    className={styles.avatarImg}
                                />
                            </div>
                            <div className={styles.info}>
                                <div className={styles.nameLine}>
                                    <Link className={styles.name} href={`/profile/${club.nickname}`}>
                                        {club.club_name ?? club.nickname}
                                    </Link>
                                </div>
                                <p className={styles.sub}>{buildSub(club)}</p>
                                <button
                                    className={isFollowing(club.id) ? styles.msgBtnActive : styles.msgBtn}
                                    onClick={() => handleFollow(club)}
                                >
                                    {isFollowing(club.id)
                                        ? <><MinusCircle size={12} /> Otprati</>
                                        : <><PlusCircle size={12} /> Zaprati</>
                                    }
                                </button>
                            </div>
                        </li>
                    ))
                }
            </ul>

            {!isLoadingSuggestedClubs && suggestedClubs?.length === 0 && (
                <p className={styles.empty}>Trenutno nema predloženih klubova.</p>
            )}

            <Link href="/clubs" className={styles.showAll}>
                Prikaži sve <ChevronRight size={14} />
            </Link>
        </div>
    );
}
