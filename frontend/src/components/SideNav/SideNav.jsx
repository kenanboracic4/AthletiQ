'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Users, FileText, ClipboardList } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './SideNav.module.css';

const NAV_ITEMS = [

    { label: 'Moji oglasi', icon: FileText, href: '/my/advertisments' },
    { label: 'Moje prijave', icon: ClipboardList, href: '/my/applications' },
];

export default function SideNav() {
    const { user } = useAuth();
    const pathname = usePathname();

    return (
        <nav className={styles.nav}>
            <Link
                href={`/profile/${user?.nickname}`}
                className={`${styles.item} ${styles.profileItem}`}
            >
                {user?.avatar_url ? (
                    <img
                        src={user.avatar_url}
                        alt={user?.full_name}
                        className={styles.avatar}
                    />
                ) : (
                    <div className={styles.avatarFallback}>
                        <User size={18} />
                    </div>
                )}
                <span className={styles.label}>
                    {user?.full_name ?? user?.username ?? 'Profil'}
                </span>
            </Link>

            <div className={styles.divider} />

            {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
                const active = pathname === href;
                return (
                    <div key={href}>
                        <Link
                            href={href}
                            className={`${styles.item} ${active ? styles.active : ''}`}
                        >
                            <div className={styles.iconWrap}>
                                <Icon size={18} />
                            </div>
                            <span className={styles.label}>{label}</span>
                        </Link>
                        <div className={styles.divider} />
                    </div>
                );
            })}
        </nav>
    );
}