"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { PropagateLoader } from "react-spinners";
import Navbar from "@/components/NavBar/NavBar";
import AdminSidebar from "@/components/Admin/AdminSidebar/AdminSidebar";
import { getAdminStats } from "@/api/admin";
import styles from "./admin.module.css";

export default function AdminLayout({ children }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const { data: stats } = useQuery({
        queryKey: ["adminStats"],
        queryFn: getAdminStats,
        enabled: !!(user?.is_admin || user?.role === "Administrator" || user?.role === "ADMIN"),
        staleTime: 30000,
    });

    useEffect(() => {
        if (!isLoading && user && !user.is_admin && user.role !== "Administrator" && user.role !== "ADMIN") {
            router.replace("/");
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className={styles.page}>
                <Navbar />
                <div className={styles.loading}>
                    <PropagateLoader color="#111827" />
                </div>
            </div>
        );
    }

    if (!user?.is_admin && user?.role !== "Administrator" && user?.role !== "ADMIN") {
        return (
            <div className={styles.page}>
                <Navbar />
                <div className={styles.denied}>
                    <p className={styles.deniedTitle}>Pristup odbijen</p>
                    <p>Nemate administratorske ovlasti.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <Navbar />
            <div className={styles.layout}>
                <AdminSidebar pendingReports={stats?.pending_reports || 0} />
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}
