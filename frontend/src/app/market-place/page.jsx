'use client';
import { useEffect, useRef, useCallback, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Navbar from "@/components/NavBar/NavBar";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";
import { getAdvertismentsByUser, getRecommendedAdvertisments } from "@/api/adverisment";
import AdCard from "@/components/AdverismentCard/AdCard";
import { PropagateLoader } from "react-spinners";
import { queryKeys } from "@/lib/queryKeys";
import { Sparkles } from "lucide-react";

import Link from "next/link";

export default function MarketPlace() {
    const { user } = useAuth();
    const observerRef = useRef(null);
    const [activeTab, setActiveTab] = useState("oglasi");

    const advertisementsQueryKey = user?.id
        ? [...queryKeys.advertisements, user.id]
        : null;

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: advertisementsQueryKey,
        queryFn: ({ pageParam = null }) =>
            getAdvertismentsByUser(user.id, { cursor: pageParam }),
        getNextPageParam: (lastPage) =>
            lastPage.has_more ? lastPage.next_cursor : undefined,
        enabled: !!user?.id,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
    });

    const advertisements = data?.pages.flatMap((page) => page.items) ?? [];

    const {
        data: recommended = [],
        isLoading: isLoadingRecommended,
        isError: isRecommendedError,
    } = useQuery({
        queryKey: user?.id ? [...queryKeys.recommendedAdvertisements, user.id] : queryKeys.recommendedAdvertisements,
        queryFn: () => getRecommendedAdvertisments({ limit: 30 }),
        enabled: !!user?.id && activeTab === "preporuceno",
        staleTime: 1000 * 60 * 5,
    });

    const stableFetchNextPage = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        const el = observerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) stableFetchNextPage();
        }, { threshold: 0.1 });

        observer.observe(el);

        return () => {
            observer.disconnect();
        };
    }, [stableFetchNextPage]);

    return (
        <main>
            <Navbar />
            <div className={styles.pageWrapper}>

                <div className={styles.hero}>
                    <h1 className={styles.heroTitle}>Marketplace</h1>
                    <p className={styles.heroSubtitle}>Pronađi prilike, klubove i trenere u jednom mjestu</p>
                </div>

                <div className={styles.tabsWrapper}>
                    <button
                        className={`${styles.tab} ${activeTab === "oglasi" ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab("oglasi")}
                    >
                        Oglasi
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === "preporuceno" ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab("preporuceno")}
                    >
                        Preporučeno za vas
                    </button>

                    <Link href="/market-place/advertisment/create" className={styles.createBtn} onClick={() => { }}>
                        + Kreiraj oglas
                    </Link>
                </div>

                <div className={styles.feedWrapper}>
                    {isLoading && (
                        <div className={styles.loaderWrapper}>
                            <PropagateLoader color="#65646420" size={10} />
                        </div>
                    )}

                    {activeTab === "oglasi" && (
                        <div className={styles.grid}>
                            {advertisements.map((ad) => (
                                <AdCard
                                    key={ad.id}
                                    ad={ad}

                                />
                            ))}
                        </div>
                    )}

                    {activeTab === "preporuceno" && (
                        <>
                            <p className={styles.recoIntro}>
                                <Sparkles size={15} />
                                AI poredi tvoj profil sa oglasima i prikazuje koliko ti svaki odgovara.
                            </p>

                            {isLoadingRecommended && (
                                <div className={styles.loaderWrapper}>
                                    <PropagateLoader color="#65646420" size={10} />
                                </div>
                            )}

                            {isRecommendedError && !isLoadingRecommended && (
                                <p className={styles.comingSoon}>
                                    Trenutno ne možemo izračunati preporuke. Pokušaj ponovo kasnije.
                                </p>
                            )}

                            {!isLoadingRecommended && !isRecommendedError && recommended.length === 0 && (
                                <p className={styles.comingSoon}>
                                    Nema oglasa za preporuku. Dopuni svoj profil da bismo pronašli bolja poklapanja.
                                </p>
                            )}

                            {!isLoadingRecommended && recommended.length > 0 && (
                                <div className={styles.grid}>
                                    {recommended.map((ad) => (
                                        <AdCard
                                            key={ad.id}
                                            ad={ad}
                                            matchPercentage={ad.match_percentage}
                                            matchReasons={ad.match_reasons}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {isFetchingNextPage && (
                        <div className={styles.loaderWrapper}>
                            <PropagateLoader color="#65646420" size={10} />
                        </div>
                    )}

                    {!hasNextPage && !isLoading && activeTab === "oglasi" && (
                        <p className={styles.noMore}>Nema više oglasa</p>
                    )}

                    <div ref={observerRef} style={{ height: 1 }} />
                </div>
            </div>
        </main>
    );
}