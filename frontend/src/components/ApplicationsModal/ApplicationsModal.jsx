'use client';

import { useState, useEffect } from 'react';
import {
    X,
    FileText,
    Upload,
    Video,
    User,
    CheckCircle,
    Clock,
    XCircle,
    ChevronRight,
    Mail,
    ShieldCheck,
    ExternalLink,
    MessageSquareShare,
    Trash2,
} from 'lucide-react';
import styles from './Applications.module.css';
import { useApplication } from '@/hooks/Application';
import { resolveAssetUrl } from '@/lib/utils';

const STATUS_CONFIG = {
    pending: {
        label: 'Na čekanju',
        icon: <Clock size={13} />,
        className: styles.statusPending,
    },
    accepted: {
        label: 'Prihvaćena',
        icon: <CheckCircle size={13} />,
        className: styles.statusAccepted,
    },
    rejected: {
        label: 'Odbijena',
        icon: <XCircle size={13} />,
        className: styles.statusRejected,
    },
};

function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('bs-BA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function ConfirmDialog({ title, message, confirmLabel, confirmClassName, onConfirm, onCancel }) {
    return (
        <div className={styles.confirmOverlay} onClick={onCancel}>
            <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.confirmContent}>
                    <h3 className={styles.confirmTitle}>{title}</h3>
                    <p className={styles.confirmText}>{message}</p>
                </div>
                <div className={styles.confirmActions}>
                    <button className={styles.confirmCancel} onClick={onCancel}>
                        Odustani
                    </button>
                    <button className={styles.btnDelete} onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ApplicationsModal({
    isOpen,
    onClose,
    advertisementTitle,
    advertisementId
}) {
    const { acceptApplicationStatusFn, rejectApplicationStatusFn, applications = [], deleteApplicationFn } = useApplication(advertisementId);

    const [selected, setSelected] = useState(applications[0] ?? null);
    const [confirmRejectId, setConfirmRejectId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    useEffect(() => {
        if (selected) {
            const updatedVersion = applications.find(app => app.id === selected.id);
            if (updatedVersion) {
                setSelected(updatedVersion);
            }
        } else if (applications.length > 0) {
            setSelected(applications[0]);
        }
    }, [applications, selected]);

    if (!isOpen) return null;

    const status = selected
        ? (STATUS_CONFIG[selected.status] ?? STATUS_CONFIG['pending'])
        : null;

    const handleRejectConfirm = () => {
        rejectApplicationStatusFn(confirmRejectId);
        setConfirmRejectId(null);
    };

    const handleDeleteConfirm = () => {
        const idToDelete = confirmDeleteId;
        deleteApplicationFn(idToDelete);
        setConfirmDeleteId(null);
        if (selected?.id === idToDelete) {
            setSelected(applications.find(a => a.id !== idToDelete) ?? null);
        }
    };

    const confirmingApp = confirmRejectId
        ? applications.find(a => a.id === confirmRejectId)
        : null;

    const deletingApp = confirmDeleteId
        ? applications.find(a => a.id === confirmDeleteId)
        : null;

    const cvHref = selected?.cv_url ? resolveAssetUrl(selected.cv_url) : null;
    const cvFileName = selected?.cv_url
        ? selected.cv_url.split("/").pop() || "cv-dokument"
        : null;

    return (
        <>
            <div className={styles.overlay} onClick={onClose}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.header}>
                        <div>
                            <h2 className={styles.title}>Prijave</h2>
                            <p className={styles.subtitle}>{advertisementTitle}</p>
                        </div>
                        <button className={styles.closeBtn} onClick={onClose}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className={styles.body}>
                        <aside className={styles.sidebar}>
                            <p className={styles.sidebarLabel}>
                                {applications.length} prijava
                            </p>
                            <ul className={styles.list}>
                                {applications.map((app) => {
                                    const cfg =
                                        STATUS_CONFIG[app.status] ?? STATUS_CONFIG['pending'];
                                    return (
                                        <li
                                            key={app.id}
                                            className={`${styles.listItem} ${selected?.id === app.id ? styles.listItemActive : ''}`}
                                            onClick={() => setSelected(app)}
                                        >
                                            <div className={styles.avatar}>
                                                {app.user?.image ? (
                                                    <img src={app.user.image} alt={app.user.nickname} />
                                                ) : (
                                                    <User size={16} />
                                                )}
                                            </div>
                                            <div className={styles.listItemInfo}>
                                                <span className={styles.nickname}>
                                                    {app.user?.nickname}
                                                </span>
                                                <span className={`${styles.badge} ${cfg.className}`}>
                                                    {cfg.icon}
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <ChevronRight size={14} className={styles.chevron} />
                                        </li>
                                    );
                                })}
                            </ul>
                        </aside>

                        <section className={styles.detail}>
                            {selected && status ? (
                                <>
                                    <div className={styles.detailHeader}>
                                        <div className={styles.detailAvatar}>
                                            {selected.user?.image ? (
                                                <img
                                                    src={selected.user.image}
                                                    alt={selected.user.nickname}
                                                />
                                            ) : (
                                                <User size={22} />
                                            )}
                                        </div>
                                        <div className={styles.detailUser}>
                                            <div className={styles.detailNameRow}>
                                                <span className={styles.detailName}>
                                                    {selected.user?.nickname}
                                                </span>
                                                {selected.user?.is_verified && (
                                                    <span className={styles.verified}>
                                                        <ShieldCheck size={13} />
                                                        Verificiran
                                                    </span>
                                                )}
                                            </div>
                                            <span className={styles.detailMeta}>
                                                <Mail size={12} />
                                                {selected.user?.email}
                                            </span>
                                            <span className={styles.detailMeta}>
                                                {selected.user?.role} &middot; {formatDate(selected.created_at)}
                                            </span>
                                        </div>
                                        <span className={`${styles.badge} ${status.className} ${styles.detailStatus}`}>
                                            {status.icon}
                                            {status.label}
                                        </span>
                                    </div>

                                    <div className={styles.divider} />

                                    <div className={styles.section}>
                                        <div className={styles.sectionTitle}>
                                            <FileText size={15} />
                                            Propratno pismo
                                        </div>
                                        <p className={styles.coverLetter}>
                                            {selected.cover_letter || (
                                                <span className={styles.empty}>Nije priloženo.</span>
                                            )}
                                        </p>
                                    </div>

                                    <div className={styles.divider} />

                                    <div className={styles.section}>
                                        <div className={styles.sectionTitle}>
                                            <Upload size={15} />
                                            CV dokument
                                        </div>
                                        {cvHref ? (
                                            <div className={styles.cvActions}>
                                                <a
                                                    href={cvHref}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.fileLink}
                                                >
                                                    <FileText size={14} />
                                                    Otvori CV
                                                    <ExternalLink size={12} />
                                                </a>
                                                <a
                                                    href={cvHref}
                                                    download={cvFileName}
                                                    className={styles.fileLinkSecondary}
                                                >
                                                    <Upload size={14} />
                                                    Preuzmi CV
                                                </a>
                                            </div>
                                        ) : (
                                            <span className={styles.empty}>Nije priložen CV.</span>
                                        )}
                                    </div>

                                    {selected.youtube_url && (
                                        <>
                                            <div className={styles.divider} />
                                            <div className={styles.section}>
                                                <div className={styles.sectionTitle}>
                                                    <Video size={15} />
                                                    YouTube video
                                                </div>
                                                <a
                                                    href={selected.youtube_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.fileLink}
                                                >
                                                    {selected.youtube_url}
                                                    <ExternalLink size={12} />
                                                </a>
                                            </div>
                                        </>
                                    )}

                                    <div className={styles.divider} />

                                    <div className={styles.actions}>
                                        {(selected.status === 'pending' || selected.status === 'accepted') && (
                                            <button
                                                className={styles.btnReject}
                                                onClick={() => setConfirmRejectId(selected.id)}
                                            >
                                                <XCircle size={15} />
                                                Odbij
                                            </button>
                                        )}
                                        {(selected.status === 'pending' || selected.status === 'rejected') && (
                                            <button
                                                className={styles.btnAccept}
                                                onClick={() => acceptApplicationStatusFn(selected.id)}
                                            >
                                                <CheckCircle size={15} />
                                                Prihvati
                                            </button>
                                        )}
                                        {selected.status === 'accepted' && (
                                            <button className={styles.btnContact}>
                                                <MessageSquareShare size={15} />
                                                Kontaktiraj korisnika
                                            </button>
                                        )}
                                        {selected.status === 'rejected' && (
                                            <button
                                                className={styles.btnDelete}
                                                onClick={() => setConfirmDeleteId(selected.id)}
                                            >
                                                <Trash2 size={15} />
                                                Obriši prijavu
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className={styles.emptyState}>
                                    <User size={32} />
                                    <p>Odaberi prijavu za pregled</p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>

            {confirmRejectId && confirmingApp && (
                <ConfirmDialog
                    title="Odbij prijavu"
                    message={
                        <>
                            Jeste li sigurni da želite odbiti prijavu korisnika{' '}
                            <strong>{confirmingApp.user?.nickname}</strong>? Ova akcija se može poništiti.
                        </>
                    }
                    confirmLabel="Odbij prijavu"
                    confirmClassName={styles.confirmReject}
                    onConfirm={handleRejectConfirm}
                    onCancel={() => setConfirmRejectId(null)}
                />
            )}

            {confirmDeleteId && deletingApp && (
                <ConfirmDialog
                    title="Obriši prijavu"
                    message={
                        <>
                            Jeste li sigurni da želite trajno obrisati prijavu korisnika{' '}
                            <strong>{deletingApp.user?.nickname}</strong>? Ova akcija se ne može poništiti.
                        </>
                    }
                    confirmLabel="Obriši prijavu"
                    confirmClassName={styles.confirmDelete}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setConfirmDeleteId(null)}
                />
            )}
        </>
    );
}