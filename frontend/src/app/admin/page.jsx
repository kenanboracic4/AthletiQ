"use client";

import { useQuery } from "@tanstack/react-query";
import { PropagateLoader } from "react-spinners";
import { Users, FileText, Briefcase, Flag, ClipboardList } from "lucide-react";
import { getAdminStats } from "@/api/admin";
import { formatApiError } from "@/lib/formatApiError";
import styles from "./admin.module.css";

export default function AdminDashboard() {
    const { data: stats, isLoading, isError, error } = useQuery({
        queryKey: ["adminStats"],
        queryFn: getAdminStats,
    });

    if (isLoading) {
        return (
            <div className={styles.loading}>
                <PropagateLoader color="#111827" />
            </div>
        );
    }

    if (isError) {
        return (
            <p className={styles.empty}>{formatApiError(error) || "Greška pri učitavanju statistike"}</p>
        );
    }

    const statCards = [
        { label: "Ukupno korisnika", value: stats?.total_users, icon: Users },
        { label: "Ukupno objava", value: stats?.total_posts, icon: FileText },
        { label: "Ukupno oglasa", value: stats?.total_advertisements, icon: Briefcase },
        { label: "Ukupno prijava", value: stats?.total_applications, icon: ClipboardList },
        { label: "Nepregledane prijave", value: stats?.pending_reports, icon: Flag, warn: true },
    ];

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Dashboard</h1>
                <p className={styles.pageSubtitle}>Pregled statistike sistema</p>
            </div>

            <div className={styles.statsGrid}>
                {statCards.map(({ label, value, warn }) => (
                    <div key={label} className={styles.statCard}>
                        <p className={styles.statLabel}>{label}</p>
                        <p className={`${styles.statValue} ${warn && value > 0 ? styles.statValueWarn : ""}`}>
                            {value ?? 0}
                        </p>
                    </div>
                ))}
            </div>

            {stats?.users_by_role && Object.keys(stats.users_by_role).length > 0 && (
                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>Korisnici po ulogama</h2>
                    <div className={styles.roleGrid}>
                        {Object.entries(stats.users_by_role).map(([role, count]) => (
                            <div key={role} className={styles.roleItem}>
                                <span className={styles.roleName}>{role}</span>
                                <span className={styles.roleCount}>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
