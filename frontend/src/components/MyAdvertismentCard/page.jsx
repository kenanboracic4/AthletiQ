'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2, Eye, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import styles from './MyAdCard.module.css';

function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('bs-BA', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
}

function timeAgo(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (min < 1) return 'upravo sad';
    if (min < 60) return `${min}m`;
    if (hr < 24) return `${hr}h`;
    if (day < 7) return `${day}d`;
    return formatDate(iso);
}

function ConfirmDeleteDialog({ onConfirm, onCancel }) {
    return (
        <div className={styles.confirmOverlay} onClick={onCancel}>
            <div className={styles.confirmDialog} onClick={e => e.stopPropagation()}>
                <div>
                    <h3 className={styles.confirmTitle}>Obriši oglas</h3>
                    <p className={styles.confirmText}>
                        Jeste li sigurni da želite obrisati ovaj oglas? Ova akcija se ne može poništiti.
                    </p>
                </div>
                <div className={styles.confirmActions}>
                    <button className={styles.confirmCancel} onClick={onCancel}>Odustani</button>
                    <button className={styles.confirmDelete} onClick={onConfirm}>Obriši oglas</button>
                </div>
            </div>
        </div>
    );
}

export default function MyAdCard({ ad, onEdit, onDelete }) {
    const [expanded, setExpanded] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    return (
        <>
            <div className={styles.card}>
                <div className={styles.cardMain}>
                    <div className={styles.cardLeft}>
                        <div className={styles.cardTitleRow}>
                            <Link
                                href={`/market-place/advertisment/${ad?.id}`}
                                className={styles.cardTitle}
                            >
                                {ad?.title}
                            </Link>
                            <span className={styles.sportTag}>{ad?.sport}</span>
                        </div>
                        <div className={styles.cardMeta}>
                            <span><Eye size={11} />{ad?.view_count ?? 0} pregleda</span>
                            <span className={styles.metaSep}>·</span>
                            <span><Users size={11} />{ad?.application_count ?? 0} prijava</span>
                            <span className={styles.metaSep}>·</span>
                            <span>{timeAgo(ad?.created_at)}</span>
                        </div>
                    </div>

                    <div className={styles.cardActions}>
                        <button
                            className={styles.actionIcon}
                            onClick={() => onEdit?.(ad)}
                            title="Uredi oglas"
                        >
                            <Pencil size={13} />
                        </button>
                        <button
                            className={`${styles.actionIcon} ${styles.actionIconDanger}`}
                            onClick={() => setDeleteOpen(true)}
                            title="Obriši oglas"
                        >
                            <Trash2 size={13} />
                        </button>
                        <button
                            className={styles.expandBtn}
                            onClick={() => setExpanded(e => !e)}
                            title={expanded ? 'Zatvori' : 'Proširi'}
                        >
                            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                    </div>
                </div>

                {expanded && (
                    <>
                        <div className={styles.expandDivider} />
                        <div className={styles.cardExpanded}>
                            <p className={styles.expandLabel}>Opis oglasa</p>
                            <p className={styles.expandText}>{ad?.description}</p>

                            <div className={styles.expandFooter}>
                                <span className={styles.expandDate}>
                                    Objavljeno: {formatDate(ad?.created_at)}
                                </span>
                                <Link
                                    href={`/market-place/advertisment/${ad?.id}`}
                                    className={styles.linkBtn}
                                >
                                    Pogledaj oglas <ArrowRight size={13} />
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {deleteOpen && (
                <ConfirmDeleteDialog
                    onConfirm={() => {
                        onDelete?.(ad?.id);
                        setDeleteOpen(false);
                    }}
                    onCancel={() => setDeleteOpen(false)}
                />
            )}
        </>
    );
}