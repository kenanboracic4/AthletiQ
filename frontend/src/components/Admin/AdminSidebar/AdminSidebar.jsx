"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FileText,
    Briefcase,
    Flag,
    ArrowLeft,
} from "lucide-react";
import styles from "./AdminSidebar.module.css";

const NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Korisnici", icon: Users, path: "/admin/users" },
    { label: "Objave", icon: FileText, path: "/admin/posts" },
    { label: "Oglasi", icon: Briefcase, path: "/admin/advertisements" },
    { label: "Prijave", icon: Flag, path: "/admin/reports" },
];

export default function AdminSidebar({ pendingReports = 0 }) {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <p className={styles.sidebarTitle}>Admin Panel</p>

            {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
                const isActive = pathname === path;
                const showBadge = path === "/admin/reports" && pendingReports > 0;

                return (
                    <Link
                        key={path}
                        href={path}
                        className={`${styles.navItem} ${isActive ? styles.active : ""}`}
                    >
                        <Icon size={18} strokeWidth={isActive ? 2 : 1.6} />
                        {label}
                        {showBadge && (
                            <span className={styles.badge}>
                                {pendingReports > 99 ? "99+" : pendingReports}
                            </span>
                        )}
                    </Link>
                );
            })}

            <Link href="/feed" className={styles.backLink}>
                <ArrowLeft size={16} />
                Nazad na aplikaciju
            </Link>
        </aside>
    );
}
