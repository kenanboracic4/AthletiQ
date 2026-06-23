"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PropagateLoader } from "react-spinners";
import toast from "react-hot-toast";
import { Trash2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import {
    getAdminReports,
    updateAdminReportStatus,
    deleteAdminReport,
    deleteAdminPost,
    deleteAdminAdvertisement,
} from "@/api/admin";
import ConfirmDeleteModal from "@/components/ConfrimDeleteModal/ConfrimDeleteModa";
import { formatApiError } from "@/lib/formatApiError";
import styles from "../admin.module.css";

const STATUS_FILTERS = [
    { value: "", label: "Sve" },
    { value: "pending", label: "Na čekanju" },
    { value: "resolved", label: "Riješeno" },
    { value: "dismissed", label: "Odbijeno" },
];

const STATUS_BADGE = {
    pending: styles.badgePending,
    resolved: styles.badgeResolved,
    dismissed: styles.badgeDismissed,
};

const STATUS_LABELS = {
    pending: "Na čekanju",
    resolved: "Riješeno",
    dismissed: "Odbijeno",
};

export default function AdminReportsPage() {
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["adminReports", statusFilter],
        queryFn: () => getAdminReports(statusFilter, null, 50),
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => updateAdminReportStatus(id, status),
        onSuccess: () => {
            toast.success("Status ažuriran");
            queryClient.invalidateQueries({ queryKey: ["adminReports"] });
            queryClient.invalidateQueries({ queryKey: ["adminStats"] });
        },
        onError: (e) => toast.error(formatApiError(e) || "Greška"),
    });

    const deleteReportMutation = useMutation({
        mutationFn: deleteAdminReport,
        onSuccess: () => {
            toast.success("Prijava obrisana");
            queryClient.invalidateQueries({ queryKey: ["adminReports"] });
            queryClient.invalidateQueries({ queryKey: ["adminStats"] });
            setDeleteTarget(null);
        },
        onError: (e) => toast.error(formatApiError(e) || "Greška"),
    });

    const deleteContentMutation = useMutation({
        mutationFn: async (report) => {
            if (report.target_type === "post" && report.post_id) {
                await deleteAdminPost(report.post_id);
            } else if (report.target_type === "advertisement" && report.advertisement_id) {
                await deleteAdminAdvertisement(report.advertisement_id);
            } else {
                throw new Error("Prijava nema povezan sadržaj");
            }
        },
        onSuccess: () => {
            toast.success("Sadržaj obrisan");
            queryClient.invalidateQueries({ queryKey: ["adminReports"] });
            queryClient.invalidateQueries({ queryKey: ["adminPosts"] });
            queryClient.invalidateQueries({ queryKey: ["adminAdvertisements"] });
            queryClient.invalidateQueries({ queryKey: ["adminStats"] });
        },
        onError: (e) => toast.error(formatApiError(e) || "Greška"),
    });

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Prijave</h1>
                <p className={styles.pageSubtitle}>Prijave korisnika na objave i oglase</p>
            </div>

            <div className={styles.filterTabs}>
                {STATUS_FILTERS.map(({ value, label }) => (
                    <button
                        key={value}
                        className={`${styles.filterTab} ${statusFilter === value ? styles.active : ""}`}
                        onClick={() => setStatusFilter(value)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className={styles.card}>
                {isLoading ? (
                    <div className={styles.loading}><PropagateLoader color="#111827" /></div>
                ) : isError ? (
                    <p className={styles.empty}>{formatApiError(error) || "Greška pri učitavanju prijava"}</p>
                ) : !data?.items?.length ? (
                    <p className={styles.empty}>Nema prijava</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Prijavio</th>
                                <th>Tip</th>
                                <th>Razlog</th>
                                <th>Opis</th>
                                <th>Status</th>
                                <th>Datum</th>
                                <th>Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.items.map((report) => (
                                <tr key={report.id}>
                                    <td>{report.reporter?.nickname || "—"}</td>
                                    <td>
                                        {report.target_type === "post" ? "Objava" : "Oglas"}
                                        {report.post_id && (
                                            <Link href={`/post/${report.post_id}`} style={{ marginLeft: 6, fontSize: "0.8rem" }}>
                                                (link)
                                            </Link>
                                        )}
                                        {report.advertisement_id && (
                                            <Link href={`/market-place/advertisment/${report.advertisement_id}`} style={{ marginLeft: 6, fontSize: "0.8rem" }}>
                                                (link)
                                            </Link>
                                        )}
                                    </td>
                                    <td>{report.reason}</td>
                                    <td>
                                        <span className={styles.contentPreview} title={report.description}>
                                            {report.description || "—"}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.badge} ${STATUS_BADGE[report.status]}`}>
                                            {STATUS_LABELS[report.status]}
                                        </span>
                                    </td>
                                    <td>{new Date(report.created_at).toLocaleDateString("bs-BA")}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            {report.status === "pending" && (
                                                <>
                                                    <button
                                                        className={styles.btnSuccess}
                                                        title="Riješi bez brisanja"
                                                        onClick={() => statusMutation.mutate({ id: report.id, status: "resolved" })}
                                                    >
                                                        <CheckCircle size={14} />
                                                    </button>
                                                    <button
                                                        className={styles.btnGhost}
                                                        title="Odbij prijavu"
                                                        onClick={() => statusMutation.mutate({ id: report.id, status: "dismissed" })}
                                                    >
                                                        <XCircle size={14} />
                                                    </button>
                                                    <button
                                                        className={styles.btnDanger}
                                                        title="Obriši sadržaj"
                                                        onClick={() => deleteContentMutation.mutate(report)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                className={styles.btnDanger}
                                                onClick={() => setDeleteTarget(report)}
                                            >
                                                Obriši
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {deleteTarget && (
                <ConfirmDeleteModal
                    onConfirm={() => deleteReportMutation.mutate(deleteTarget.id)}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </>
    );
}
