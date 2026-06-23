"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PropagateLoader } from "react-spinners";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
    getAdminUsers,
    createAdminUser,
    updateAdminUser,
    deleteAdminUser,
} from "@/api/admin";
import ConfirmDeleteModal from "@/components/ConfrimDeleteModal/ConfrimDeleteModa";
import { formatApiError } from "@/lib/formatApiError";
import styles from "../admin.module.css";

const ROLES = [
    { value: "ATHLETE", label: "Sportista" },
    { value: "RECREATIONAL_ATHLETE", label: "Rekreativni sportista" },
    { value: "COACH", label: "Trener" },
    { value: "SCOUT", label: "Skaut" },
    { value: "CLUB", label: "Klub" },
    { value: "ADMIN", label: "Administrator" },
];

const ROLE_API_TO_KEY = {
    "Sportista": "ATHLETE",
    "Rekreativni sportista": "RECREATIONAL_ATHLETE",
    "Trener": "COACH",
    "Skaut": "SCOUT",
    "Klub": "CLUB",
    "Administrator": "ADMIN",
};

const ROLE_LABELS = Object.fromEntries(ROLES.map((r) => [r.value, r.label]));
Object.entries(ROLE_API_TO_KEY).forEach(([apiVal, key]) => {
    ROLE_LABELS[apiVal] = ROLE_LABELS[key];
});

const getRoleKey = (role) => ROLE_API_TO_KEY[role] || role;

const EMPTY_FORM = {
    email: "",
    nickname: "",
    password: "",
    role: "ATHLETE",
    is_verified: false,
    is_admin: false,
};

export default function AdminUsersPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["adminUsers", page, search],
        queryFn: () => getAdminUsers(page, 20, search),
    });

    const createMutation = useMutation({
        mutationFn: createAdminUser,
        onSuccess: () => {
            toast.success("Korisnik kreiran");
            queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
            queryClient.invalidateQueries({ queryKey: ["adminStats"] });
            closeModal();
        },
        onError: (e) => toast.error(formatApiError(e) || "Greška"),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateAdminUser(id, data),
        onSuccess: () => {
            toast.success("Korisnik ažuriran");
            queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
            closeModal();
        },
        onError: (e) => toast.error(formatApiError(e) || "Greška"),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAdminUser,
        onSuccess: () => {
            toast.success("Korisnik obrisan");
            queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
            queryClient.invalidateQueries({ queryKey: ["adminStats"] });
            setDeleteTarget(null);
        },
        onError: (e) => toast.error(formatApiError(e) || "Greška"),
    });

    const openCreate = () => {
        setEditUser(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    };

    const openEdit = (user) => {
        setEditUser(user);
        setForm({
            email: user.email,
            nickname: user.nickname,
            password: "",
            role: getRoleKey(user.role),
            is_verified: user.is_verified,
            is_admin: user.is_admin,
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditUser(null);
        setForm(EMPTY_FORM);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editUser) {
            const payload = {
                email: form.email,
                nickname: form.nickname,
                role: form.role,
                is_verified: form.is_verified,
                is_admin: form.is_admin,
            };
            if (form.password) payload.password = form.password;
            updateMutation.mutate({ id: editUser.id, data: payload });
        } else {
            createMutation.mutate(form);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    return (
        <>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Korisnici</h1>
                <p className={styles.pageSubtitle}>Upravljanje korisnicima sistema</p>
            </div>

            <div className={styles.toolbar}>
                <form onSubmit={handleSearch} style={{ display: "flex", flex: 1, gap: 12 }}>
                    <input
                        className={styles.searchInput}
                        placeholder="Pretraži po nadimku ili emailu..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <button type="submit" className={styles.btnGhost}>Pretraži</button>
                </form>
                <button className={styles.btnPrimary} onClick={openCreate}>
                    <Plus size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
                    Novi korisnik
                </button>
            </div>

            <div className={styles.card}>
                {isLoading ? (
                    <div className={styles.loading}><PropagateLoader color="#111827" /></div>
                ) : isError ? (
                    <p className={styles.empty}>{formatApiError(error) || "Greška pri učitavanju korisnika"}</p>
                ) : !data?.items?.length ? (
                    <p className={styles.empty}>Nema korisnika</p>
                ) : (
                    <>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Nadimak</th>
                                    <th>Email</th>
                                    <th>Rola</th>
                                    <th>Status</th>
                                    <th>Datum</th>
                                    <th>Akcije</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.items.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.nickname}</td>
                                        <td>{user.email}</td>
                                        <td>{ROLE_LABELS[user.role] || user.role}</td>
                                        <td>
                                            {user.is_admin && <span className={`${styles.badge} ${styles.badgeAdmin}`}>Admin</span>}
                                            {user.is_verified && <span className={`${styles.badge} ${styles.badgeVerified}`}>Verificiran</span>}
                                        </td>
                                        <td>{new Date(user.created_at).toLocaleDateString("bs-BA")}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <button className={styles.btnGhost} onClick={() => openEdit(user)}>
                                                    <Pencil size={14} />
                                                </button>
                                                <button className={styles.btnDanger} onClick={() => setDeleteTarget(user)}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className={styles.pagination}>
                            <span className={styles.paginationInfo}>
                                Ukupno: {data.total} korisnika
                            </span>
                            <div className={styles.paginationBtns}>
                                <button
                                    className={styles.btnGhost}
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    Prethodna
                                </button>
                                <button
                                    className={styles.btnGhost}
                                    disabled={!data.has_more}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Sljedeća
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {modalOpen && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <h2 className={styles.modalTitle}>
                            {editUser ? "Uredi korisnika" : "Novi korisnik"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Email</label>
                                <input
                                    className={styles.formInput}
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Nadimak</label>
                                <input
                                    className={styles.formInput}
                                    required
                                    value={form.nickname}
                                    onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>
                                    {editUser ? "Nova lozinka (opcionalno)" : "Lozinka"}
                                </label>
                                <input
                                    className={styles.formInput}
                                    type="password"
                                    required={!editUser}
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Rola</label>
                                <select
                                    className={styles.formSelect}
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                >
                                    {ROLES.map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.checkboxRow}>
                                <input
                                    type="checkbox"
                                    id="verified"
                                    checked={form.is_verified}
                                    onChange={(e) => setForm({ ...form, is_verified: e.target.checked })}
                                />
                                <label htmlFor="verified">Verificiran</label>
                            </div>
                            <div className={styles.checkboxRow}>
                                <input
                                    type="checkbox"
                                    id="admin"
                                    checked={form.is_admin}
                                    onChange={(e) => setForm({ ...form, is_admin: e.target.checked })}
                                />
                                <label htmlFor="admin">Administrator</label>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.btnGhost} onClick={closeModal}>Odustani</button>
                                <button type="submit" className={styles.btnPrimary} disabled={createMutation.isPending || updateMutation.isPending}>
                                    {editUser ? "Sačuvaj" : "Kreiraj"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <ConfirmDeleteModal
                    onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </>
    );
}
