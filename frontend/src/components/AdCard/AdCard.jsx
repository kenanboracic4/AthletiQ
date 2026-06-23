'use client';

import { useState } from 'react';
import { MapPin, Clock, ChevronDown, ChevronUp, ArrowRight, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useApplication } from '@/hooks/Application';
import { resolveAssetUrl } from '@/lib/utils';
import styles from './AdCard.module.css';

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

const STATUS_LABEL = {
    pending: 'Na čekanju',
    accepted: 'Prihvaćena',
    rejected: 'Odbijena',
};

function ConfirmDeleteDialog({ onConfirm, onCancel }) {
    return (
        <div className={styles.confirmOverlay} onClick={onCancel}>
            <div className={styles.confirmDialog} onClick={e => e.stopPropagation()}>
                <div>
                    <h3 className={styles.confirmTitle}>Povuci prijavu</h3>
                    <p className={styles.confirmText}>
                        Jeste li sigurni da želite povući ovu prijavu? Ova akcija se ne može poništiti.
                    </p>
                </div>
                <div className={styles.confirmActions}>
                    <button className={styles.confirmCancel} onClick={onCancel}>Odustani</button>
                    <button className={styles.confirmDelete} onClick={onConfirm}>Povuci prijavu</button>
                </div>
            </div>
        </div>
    );
}

export default function ApplicationCard({ app }) {
    const [expanded, setExpanded] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const { deleteMyApplicationFn } = useApplication();

    const ad = app?.advertisement;
    const statusLabel = STATUS_LABEL[app.status] ?? STATUS_LABEL['pending'];

    return (
        <>
            <div className={styles.card}>
                <div className={styles.cardMain}>
                    <div className={styles.cardLeft}>
                        <div className={styles.cardTitleRow}>
                            <Link
                                href={`/market-place/advertisment/${ad.id}`}
                                className={styles.cardTitle}
                            >
                                {ad.title}
                            </Link>
                            <span className={`${styles.statusBadge} ${styles[app.status] ?? ''}`}>
                                {statusLabel}
                            </span>
                        </div>
                        <div className={styles.cardMeta}>
                            <span>{ad.sport}</span>
                            {ad.location && (
                                <>
                                    <span className={styles.metaSep}>·</span>
                                    <span><MapPin size={11} />{ad.location}</span>
                                </>
                            )}
                            <span className={styles.metaSep}>·</span>
                            <span><Clock size={11} />Prijava: {timeAgo(app.created_at)}</span>
                        </div>
                    </div>

                    <div className={styles.cardActions}>
                        {app.status !== 'accepted' && (
                            <button
                                className={`${styles.actionIcon} ${styles.actionIconDanger}`}
                                onClick={() => setDeleteOpen(true)}
                                title="Povuci prijavu"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
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
                            <div className={styles.expandGrid}>
                                <div className={styles.expandSection}>
                                    <p className={styles.expandLabel}>Propratno pismo</p>
                                    <p className={styles.expandText}>
                                        {app.cover_letter || (
                                            <span className={styles.expandEmpty}>Nije priloženo.</span>
                                        )}
                                    </p>
                                </div>
                                <div className={styles.expandSection}>
                                    <p className={styles.expandLabel}>O oglasu</p>
                                    <p className={styles.expandText}>{ad.description}</p>
                                </div>
                            </div>

                            {(app.cv_url || app.youtube_url) && (
                                <div className={styles.expandAttachments}>
                                    <span className={styles.attachLabel}>Prilozi</span>
                                    {app.cv_url && (
                                        <a
                                            href={resolveAssetUrl(app.cv_url)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.attachPlain}
                                        >
                                            CV dokument
                                        </a>
                                    )}
                                    {app.cv_url && app.youtube_url && (
                                        <span className={styles.attachSep}>·</span>
                                    )}
                                    {app.youtube_url && (
                                        <a
                                            href={app.youtube_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.attachPlain}
                                        >
                                            YouTube video
                                        </a>
                                    )}
                                </div>
                            )}

                            <div className={styles.expandFooter}>
                                <span className={styles.expandDate}>
                                    Prijavljeno: {formatDate(app.created_at)}
                                </span>
                                <Link
                                    href={`/market-place/advertisment/${ad.id}`}
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
                        deleteMyApplicationFn(app.id);
                        setDeleteOpen(false);
                    }}
                    onCancel={() => setDeleteOpen(false)}
                />
            )}
        </>
    );
}