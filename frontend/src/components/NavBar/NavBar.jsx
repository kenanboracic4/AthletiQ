"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
    Home,
    Users,
    Briefcase,
    MessageSquare,
    Bell,
    User,
    LogOut,
    ChevronDown,
    Shield,
    FileText,
    ClipboardList,
} from "lucide-react";
import styles from "./Navbar.module.css";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/hooks/Notification";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    { id: "home", label: "Početna", icon: Home, path: "/feed" },
    { id: "network", label: "Mreža", icon: Users, path: "/network-feed" },
    { id: "marketplace", label: "Berza", icon: Briefcase, path: "/market-place" },
    { id: "messaging", label: "Chat", icon: MessageSquare, path: "/chat" },
    { id: "notifications", label: "Obavijesti", icon: Bell, path: "/notifications" },
];

function isNavActive(pathname, path) {
    if (path === "/feed") {
        return pathname === "/feed";
    }
    return pathname === path || pathname.startsWith(`${path}/`);
}

export default function Navbar() {
    const auth = useAuth() || {};
    const { user = null, isLoading = false, logout = () => { } } = auth;
    const { unreadCount } = useNotifications();
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const dropRef = useRef(null);

    useEffect(() => {
        function handleClick(e) {
            if (dropRef.current && !dropRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        const sync = () => {
            document.body.classList.toggle("has-mobile-nav", mq.matches && !!user);
        };
        sync();
        mq.addEventListener("change", sync);
        return () => {
            mq.removeEventListener("change", sync);
            document.body.classList.remove("has-mobile-nav");
        };
    }, [user]);

    const renderNavLink = (item, variant = "desktop") => {
        const { id, label, icon: Icon, path } = item;
        const active = isNavActive(pathname, path);
        const badgeCount = id === "notifications" ? unreadCount : 0;
        const className =
            variant === "mobile"
                ? `${styles.mobileNavItem} ${active ? styles.mobileNavItemActive : ""}`
                : `${styles.navItem} ${active ? styles.active : ""}`;

        return (
            <Link
                key={`${variant}-${id}`}
                href={path}
                className={className}
                aria-current={active ? "page" : undefined}
            >
                <span className={styles.navIcon}>
                    <Icon size={variant === "mobile" ? 22 : 20} strokeWidth={active ? 2 : 1.6} />
                    {badgeCount > 0 && (
                        <span className={styles.badge}>
                            {badgeCount > 99 ? "99+" : badgeCount}
                        </span>
                    )}
                </span>
                <span className={styles.navLabel}>{label}</span>
            </Link>
        );
    };

    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.inner}>
                    <Link href="/feed" className={styles.logo}>
                        <Image
                            src="/AthletiQ_logo.jpg"
                            alt="AthletiQ"
                            width={120}
                            height={36}
                            className={styles.logoImg}
                            priority
                        />
                    </Link>

                    <div className={styles.nav}>
                        {NAV_ITEMS.map((item) => renderNavLink(item, "desktop"))}
                    </div>

                    <div className={styles.right} ref={dropRef}>
                        {isLoading ? (
                            <div className={styles.skeleton} />
                        ) : user ? (
                            <>
                                <button
                                    type="button"
                                    className={styles.profileBtn}
                                    onClick={() => setOpen((v) => !v)}
                                    aria-expanded={open}
                                    aria-label="Meni profila"
                                >
                                    <div className={styles.avatarWrap}>
                                        <img
                                            src={user?.image ?? "/no-profile-picture.png"}
                                            alt="Profile"
                                            width={34}
                                            height={34}
                                            className={styles.avatarImg}
                                        />
                                    </div>
                                    <div className={styles.profileMeta}>
                                        <span className={styles.profileName}>{user?.nickname}</span>
                                        <span className={styles.profileSub}>Više detalja</span>
                                    </div>
                                    <ChevronDown
                                        size={14}
                                        className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
                                    />
                                </button>

                                {open && (
                                    <div className={styles.dropdown}>
                                        <div className={styles.dropdownHeader}>
                                            <div className={styles.dropdownName}>{user?.nickname}</div>
                                            <div className={styles.dropdownEmail}>{user?.email}</div>
                                        </div>
                                        <Link
                                            href={`/profile/${user?.nickname}`}
                                            className={styles.dropdownItem}
                                            onClick={() => setOpen(false)}
                                        >
                                            <User size={14} />
                                            Moj profil
                                        </Link>
                                        <Link
                                            href="/my/advertisments"
                                            className={styles.dropdownItem}
                                            onClick={() => setOpen(false)}
                                        >
                                            <FileText size={14} />
                                            Moji oglasi
                                        </Link>
                                        <Link
                                            href="/my/applications"
                                            className={styles.dropdownItem}
                                            onClick={() => setOpen(false)}
                                        >
                                            <ClipboardList size={14} />
                                            Moje prijave
                                        </Link>
                                        {(user?.is_admin || user?.role === "Administrator" || user?.role === "ADMIN") && (
                                            <Link href="/admin" className={styles.dropdownItem} onClick={() => setOpen(false)}>
                                                <Shield size={14} />
                                                Admin panel
                                            </Link>
                                        )}
                                        <div className={styles.dropdownDivider} />
                                        <button
                                            type="button"
                                            className={`${styles.dropdownItem} ${styles.danger}`}
                                            onClick={() => {
                                                setOpen(false);
                                                logout();
                                                router.push("/login");
                                            }}
                                        >
                                            <LogOut size={14} />
                                            Odjava
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className={styles.authButtons}>
                                <Link href="/login" className={styles.btnGhost}>
                                    Prijavi se
                                </Link>
                                <Link href="/register" className={styles.btnPrimary}>
                                    Registruj se
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {user && (
                <div className={styles.mobileNav} aria-label="Glavna navigacija">
                    {NAV_ITEMS.map((item) => renderNavLink(item, "mobile"))}
                </div>
            )}
        </>
    );
}
