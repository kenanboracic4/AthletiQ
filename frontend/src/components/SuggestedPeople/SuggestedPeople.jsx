"use client";

import { ChevronRight, PlusCircle, MinusCircle } from "lucide-react";
import styles from "./SuggestedPeople.module.css";
import { useUser } from "@/hooks/User";
import Link from "next/link";
import { useState, useEffect } from "react";

const ROLE_LABELS = {
    ATHLETE: "Sportista",
    RECREATIONAL_ATHLETE: "Rekreativni sportista",
    SCOUT: "Skaut",
    CLUB: "Klub",
    COACH: "Trener",
    ADMIN: "Administrator",
};

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

export default function SuggestedPeople() {
    const { suggestedPeople, isLoadingSuggestedPeople, submitFollowSuggested } = useUser();
    const [localFollow, setLocalFollow] = useState({});

    useEffect(() => {
        if (!suggestedPeople) return;
        const initial = {};
        suggestedPeople.forEach((person) => {
            initial[person.id] = person.is_following;
        });
        setLocalFollow(initial);
    }, [suggestedPeople]);

    const isFollowing = (personId) => localFollow[personId] ?? false;

    const handleFollow = (person) => {
        submitFollowSuggested(person.nickname, {}, () => {
            setLocalFollow((prev) => ({
                ...prev,
                [person.id]: !prev[person.id],
            }));
        });
    };

    return (
        <div className={styles.widget}>
            <h2 className={styles.title}>Profili za tebe</h2>

            <ul className={styles.list}>
                {isLoadingSuggestedPeople
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                    : suggestedPeople?.map((person) => (
                        <li key={person.id} className={styles.row}>
                            <div className={styles.avatar}>
                                <img
                                    src={person.image ?? "/no-profile-picture.png"}
                                    alt={person.nickname}
                                    className={styles.avatarImg}
                                />
                            </div>
                            <div className={styles.info}>
                                <div className={styles.nameLine}>
                                    <Link className={styles.name} href={`/profile/${person.nickname}`}>
                                        {person.nickname}
                                    </Link>
                                </div>
                                <p className={styles.sub}>{ROLE_LABELS[person.role] ?? person.role}</p>
                                <button
                                    className={isFollowing(person.id) ? styles.msgBtnActive : styles.msgBtn}
                                    onClick={() => handleFollow(person)}
                                >
                                    {isFollowing(person.id)
                                        ? <><MinusCircle size={12} /> Otprati</>
                                        : <><PlusCircle size={12} /> Zaprati</>
                                    }
                                </button>
                            </div>
                        </li>
                    ))
                }
            </ul>

            <Link href="/people" className={styles.showAll}>
                Prikaži sve <ChevronRight size={14} />
            </Link>
        </div>
    );
}