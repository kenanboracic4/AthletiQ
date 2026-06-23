'use client';

import Link from 'next/link';
import { UserRound } from 'lucide-react';
import styles from './UserCard.module.css';

const DEFAULT_AVATAR = '/no-profile-picture.png';

const ROLE_LABELS = {
    'Rekreativni sportista': 'Rekreativni sportista',
    'Sportista': 'Sportista',
    'Trener': 'Trener',
    'Skaut': 'Skaut',
    'Klub': 'Klub',
    'Mediji': 'Mediji',
    ATHLETE: 'Sportista',
    RECREATIONAL_ATHLETE: 'Rekreativni sportista',
    COACH: 'Trener',
    SCOUT: 'Skaut',
    CLUB: 'Klub',
};

export default function UserCard({ user }) {
    const avatarSrc = user?.image || DEFAULT_AVATAR;

    return (
        <Link href={`/profile/${user.nickname}`} className={styles.card}>
            <div className={styles.avatarWrap}>
                <img
                    src={avatarSrc}
                    alt={user.nickname}
                    width={44}
                    height={44}
                    className={styles.avatarImg}
                    onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = DEFAULT_AVATAR;
                    }}
                />
            </div>

            <div className={styles.meta}>
                <span className={styles.nickname}>@{user.nickname}</span>
                <span className={styles.role}>{ROLE_LABELS[user.role] ?? user.role}</span>
            </div>

            <div className={styles.arrow}>
                <UserRound size={15} />
            </div>
        </Link>
    );
}