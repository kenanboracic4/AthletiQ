'use client';

import { useState } from 'react';
import {
    MapPin, Clock, ChevronDown, ChevronUp,
    FileText, Video, ArrowRight, Trophy,
    Trash2, CheckCircle, XCircle, Timer,
} from 'lucide-react';
import Link from 'next/link';
import { useApplication } from '@/hooks/Application';
import { resolveAssetUrl } from '@/lib/utils';

const STATUS_CONFIG = {
    pending: { label: 'Na čekanju', icon: Timer, color: '#92400e', bg: '#fef9c3' },
    accepted: { label: 'Prihvaćena', icon: CheckCircle, color: '#166534', bg: '#dcfce7' },
    rejected: { label: 'Odbijena', icon: XCircle, color: '#991b1b', bg: '#fee2e2' },
};

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

function ConfirmDeleteDialog({ onConfirm, onCancel, styles }) {
    return (
        <div className={styles.confirmOverlay} onClick={onCancel}>
            <div className={styles.confirmDialog} onClick={e => e.stopPropagation()}>
                <div className={styles.confirmContent}>
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

export default function ApplicationCard({ app, styles }) {
    const [expanded, setExpanded] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const { deleteMyApplicationFn } = useApplication();

    const ad = app.advertisement;
    const status = STATUS_CONFIG[app.status] ?? STATUS_CONFIG['pending'];
    const StatusIcon = status.icon;

    return (
        <>
            <div className={styles.card}>
                <div className={styles.cardMain}>
                    <div className={styles.cardLeft}>
                        <div className={styles.sportIcon}>
                            <Trophy size={18} />
                        </div>
                        <div className={styles.cardInfo}>
                            <div className={styles.cardTitleRow}>
                                <Link
                                    href={`/market-place/advertisment/${ad.id}`}
                                    className={styles.cardTitle}
                                >
                                    {ad.title}
                                </Link>
                                <span
                                    className={styles.statusBadge}
                                    style={{ color: status.color, background: status.bg }}
                                >
                                    <StatusIcon size={12} />
                                    {status.label}
                                </span>
                            </div>
                            <div className={styles.cardMeta}>
                                <span><Trophy size={12} />{ad.sport}</span>
                                {ad.location && <span><MapPin size={12} />{ad.location}</span>}
                                <span><Clock size={12} />Prijava: {timeAgo(app.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.cardRight}>
                        <div className={styles.cardActions}>
                            {app.status !== 'accepted' && (
                                <button
                                    className={`${styles.actionIcon} ${styles.actionIconDanger}`}
                                    onClick={() => setDeleteOpen(true)}
                                    title="Povuci prijavu"
                                >
                                    <Trash2 size={15} />
                                </button>
                            )}
                            <button className={styles.expandBtn} onClick={() => setExpanded(e => !e)}>
                                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                {expanded && (
                    <div className={styles.cardExpanded}>
                        <div className={styles.expandDivider} />

                        <div className={styles.expandGrid}>
                            <div className={styles.expandSection}>
                                <p className={styles.expandLabel}>
                                    <FileText size={13} />
                                    Propratno pismo
                                </p>
                                <p className={styles.expandText}>
                                    {app.cover_letter || <span className={styles.empty}>Nije priloženo.</span>}
                                </p>
                            </div>

                            <div className={styles.expandSection}>
                                <p className={styles.expandLabel}>
                                    <FileText size={13} />
                                    O oglasu
                                </p>
                                <p className={styles.expandText}>{ad.description}</p>
                            </div>
                        </div>

                        <div className={styles.expandLinks}>
                            {app.cv_url && (
                                <a
                                    href={resolveAssetUrl(app.cv_url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.attachLink}
                                >
                                    <FileText size={13} />
                                    Otvori CV
                                </a>
                            )}
                            {app.youtube_url && (
                                <a
                                    href={app.youtube_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.attachLink}
                                >
                                    <Video size={13} />
                                    YouTube video
                                </a>
                            )}
                        </div>

                        <div className={styles.expandFooter}>
                            <span className={styles.expandDate}>Prijavljeno: {formatDate(app.created_at)}</span>
                            <Link href={`/market-place/advertisment/${ad.id}`} className={styles.linkBtn}>
                                Pogledaj oglas <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {deleteOpen && (
                <ConfirmDeleteDialog
                    styles={styles}
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