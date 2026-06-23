"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PropagateLoader } from "react-spinners";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { getAdminAdvertisements, deleteAdminAdvertisement } from "@/api/admin";
import ConfirmDeleteModal from "@/components/ConfrimDeleteModal/ConfrimDeleteModa";
import { formatApiError } from "@/lib/formatApiError";
import styles from "../admin.module.css";

export default function AdminAdvertisementsPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["adminAdvertisements", page, search],
        queryFn: () => getAdminAdvertisements(page, 20, search),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAdminAdvertisement,
        onSuccess: () => {
            toast.success("Oglas obrisan");
            queryClient.invalidateQueries({ queryKey: ["adminAdvertisements"] });
            queryClient.invalidateQueries({ queryKey: ["adminStats"] });
            setDeleteTarget(null);
        },
        onError: (e) => toast.error(formatApiError(e) || "Greška"),
    });

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Oglasi</h1>
                <p className={styles.pageSubtitle}>Pregled i brisanje svih oglasa</p>
            </div>

            <div className={styles.toolbar}>
                <form onSubmit={handleSearch} style={{ display: "flex", flex: 1, gap: 12 }}>
                    <input
                        className={styles.searchInput}
                        placeholder="Pretraži po naslovu ili opisu..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <button type="submit" className={styles.btnGhost}>Pretraži</button>
                </form>
            </div>

            <div className={styles.card}>
                {isLoading ? (
                    <div className={styles.loading}><PropagateLoader color="#111827" /></div>
                ) : isError ? (
                    <p className={styles.empty}>{formatApiError(error) || "Greška pri učitavanju oglasa"}</p>
                ) : !data?.items?.length ? (
                    <p className={styles.empty}>Nema oglasa</p>
                ) : (
                    <>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Naslov</th>
                                        <th>Autor</th>
                                        <th>Sport</th>
                                        <th>Pregledi</th>
                                        <th>Prijave</th>
                                        <th>Datum</th>
                                        <th>Akcije</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.map((ad) => (
                                        <tr key={ad.id}>
                                            <td>
                                                <span className={styles.contentPreview} title={ad.title}>
                                                    {ad.title}
                                                </span>
                                            </td>
                                            <td>
                                                {ad.creator ? (
                                                    <Link href={`/profile/${ad.creator.nickname}`}>
                                                        {ad.creator.nickname}
                                                    </Link>
                                                ) : "—"}
                                            </td>
                                            <td>{ad.sport}</td>
                                            <td>{ad.view_count}</td>
                                            <td>{ad.application_count}</td>
                                            <td>{new Date(ad.created_at).toLocaleDateString("bs-BA")}</td>
                                            <td>
                                                <div className={styles.actions}>
                                                    <Link href={`/market-place/advertisment/${ad.id}`} className={styles.btnGhost}>
                                                        Pogledaj
                                                    </Link>
                                                    <button
                                                        className={styles.btnDanger}
                                                        onClick={() => setDeleteTarget(ad)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.pagination}>
                            <span className={styles.paginationInfo}>Ukupno: {data.total} oglasa</span>
                            <div className={styles.paginationBtns}>
                                <button className={styles.btnGhost} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                                    Prethodna
                                </button>
                                <button className={styles.btnGhost} disabled={!data.has_more} onClick={() => setPage((p) => p + 1)}>
                                    Sljedeća
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {deleteTarget && (
                <ConfirmDeleteModal
                    onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </>
    );
}
