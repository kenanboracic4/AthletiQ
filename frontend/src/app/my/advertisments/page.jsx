'use client';

import { useState } from 'react';
import { Plus, Briefcase, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAdvertismentPostMutations } from '@/hooks/AdvertismentPostMutation';
import MyAdCard from '@/components/MyAdvertismentCard/page';
import styles from './page.module.css';
import Navbar from '@/components/NavBar/NavBar';

export default function MyAdvertisementsPage() {
    const { myAdvertisments, isLoadingMyAdvertisments } = useAdvertismentPostMutations();
    const [editAd, setEditAd] = useState(null);
    console.log(myAdvertisments);

    const ads = myAdvertisments ?? [];

    return (
        <>
            <Navbar />

            <div className={styles.page}>
                <div className={styles.container}>

                    <div className={styles.pageHeader}>
                        <div>
                            <h1 className={styles.pageTitle}>Moji oglasi</h1>
                            <p className={styles.pageSubtitle}>
                                {ads.length > 0
                                    ? `${ads.length} ${ads.length === 1 ? 'oglas' : 'oglasa'}`
                                    : 'Nemate objavljenih oglasa'}
                            </p>
                        </div>
                        <Link href="/market-place/advertisment/create" className={styles.btnCreate}>
                            <Plus size={16} />
                            Novi oglas
                        </Link>
                    </div>

                    {isLoadingMyAdvertisments ? (
                        <div className={styles.loadingList}>
                            {[1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
                        </div>
                    ) : ads.length === 0 ? (
                        <div className={styles.empty}>
                            <Briefcase size={36} />
                            <p className={styles.emptyTitle}>Nema oglasa</p>
                            <p className={styles.emptyText}>Kreirajte prvi oglas i pronađite pravi talent.</p>
                            <Link href="/market-place/advertisment/create" className={styles.btnCreate}>
                                <Plus size={15} /> Kreiraj oglas
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.list}>
                            {ads.map(ad => (
                                <MyAdCard
                                    key={ad.id}
                                    ad={ad}
                                    onEdit={setEditAd}
                                    styles={styles}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}