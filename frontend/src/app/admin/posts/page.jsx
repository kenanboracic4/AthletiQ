"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PropagateLoader } from "react-spinners";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { getAdminPosts, deleteAdminPost } from "@/api/admin";
import ConfirmDeleteModal from "@/components/ConfrimDeleteModal/ConfrimDeleteModa";
import { formatApiError } from "@/lib/formatApiError";
import styles from "../admin.module.css";

export default function AdminPostsPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["adminPosts", page, search],
        queryFn: () => getAdminPosts(page, 20, search),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAdminPost,
        onSuccess: () => {
            toast.success("Post obrisan");
            queryClient.invalidateQueries({ queryKey: ["adminPosts"] });
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
                <h1 className={styles.pageTitle}>Objave</h1>
                <p className={styles.pageSubtitle}>Pregled i brisanje svih objava</p>
            </div>

            <div className={styles.toolbar}>
                <form onSubmit={handleSearch} style={{ display: "flex", flex: 1, gap: 12 }}>
                    <input
                        className={styles.searchInput}
                        placeholder="Pretraži po sadržaju..."
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
                    <p className={styles.empty}>{formatApiError(error) || "Greška pri učitavanju objava"}</p>
                ) : !data?.items?.length ? (
                    <p className={styles.empty}>Nema objava</p>
                ) : (
                    <>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Autor</th>
                                    <th>Sadržaj</th>
                                    <th>Lajkovi</th>
                                    <th>Datum</th>
                                    <th>Akcije</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((post) => (
                                    <tr key={post.id}>
                                        <td>
                                            {post.user ? (
                                                <Link href={`/profile/${post.user.nickname}`}>
                                                    {post.user.nickname}
                                                </Link>
                                            ) : "—"}
                                        </td>
                                        <td>
                                            <span className={styles.contentPreview} title={post.content}>
                                                {post.content}
                                            </span>
                                        </td>
                                        <td>{post.likes_count}</td>
                                        <td>{new Date(post.created_at).toLocaleDateString("bs-BA")}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <Link href={`/post/${post.id}`} className={styles.btnGhost}>
                                                    Pogledaj
                                                </Link>
                                                <button
                                                    className={styles.btnDanger}
                                                    onClick={() => setDeleteTarget(post)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className={styles.pagination}>
                            <span className={styles.paginationInfo}>Ukupno: {data.total} objava</span>
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
