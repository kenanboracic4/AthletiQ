'use client';

import { Inbox, ArrowRight, CheckCircle, XCircle, Timer } from 'lucide-react';
import Link from 'next/link';
import { useApplication } from '@/hooks/Application';
import AdCard from '@/components/AdCard/AdCard';
import Navbar from '@/components/NavBar/NavBar';
import styles from './page.module.css';

export default function MyApplicationsPage() {
    const { myApplications, isLoadingMyApplications } = useApplication();

    const apps = myApplications ?? [];

    const counts = {
        pending: apps.filter(a => a.status === 'pending').length,
        accepted: apps.filter(a => a.status === 'accepted').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
    };

    return (
        <>
            <Navbar />
            <div className={styles.page}>
                <div className={styles.container}>

                    <div className={styles.pageHeader}>
                        <div>
                            <h1 className={styles.pageTitle}>Moje prijave</h1>
                            <p className={styles.pageSubtitle}>
                                {apps.length > 0
                                    ? `${apps.length} ${apps.length === 1 ? 'prijava' : 'prijava'}`
                                    : 'Niste se prijavili ni na jedan oglas'}
                            </p>
                        </div>

                        {apps.length > 0 && (
                            <div className={styles.summaryChips}>
                                <span className={styles.chip} style={{ color: '#92400e', background: '#fef9c3' }}>
                                    <Timer size={12} /> {counts.pending} na čekanju
                                </span>
                                <span className={styles.chip} style={{ color: '#166534', background: '#dcfce7' }}>
                                    <CheckCircle size={12} /> {counts.accepted} prihvaćeno
                                </span>
                                <span className={styles.chip} style={{ color: '#991b1b', background: '#fee2e2' }}>
                                    <XCircle size={12} /> {counts.rejected} odbijeno
                                </span>
                            </div>
                        )}
                    </div>

                    {isLoadingMyApplications ? (
                        <div className={styles.loadingList}>
                            {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
                        </div>
                    ) : apps.length === 0 ? (
                        <div className={styles.empty}>
                            <Inbox size={36} />
                            <p className={styles.emptyTitle}>Nema prijava</p>
                            <p className={styles.emptyText}>Pronađite oglase koji vam odgovaraju i pošaljite prijavu.</p>
                            <Link href="/market-place" className={styles.btnBrowse}>
                                Pretraži oglase <ArrowRight size={15} />
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.list}>
                            {apps.map(app => (
                                <AdCard
                                    key={app.id}
                                    app={app}

                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
