"use client";

import { useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import Navbar from "@/components/NavBar/NavBar";
import SideNav from "@/components/SideNav/SideNav";
import NetworkCard from "@/components/NetworkCard/NetworkCard";
import { getSuggestedClubs } from "@/api/user";
import { useAuth } from "@/context/AuthContext";
import { PropagateLoader } from "react-spinners";
import { Building2, SearchX } from "lucide-react";
import styles from "./page.module.css";
import layout from "@/styles/pageLayout.module.css";

const PAGE_SIZE = 12;

export default function ClubsPage() {
    const { user } = useAuth();
    const observerRef = useRef(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ["allClubs"],
        queryFn: ({ pageParam = 1 }) => getSuggestedClubs(pageParam, PAGE_SIZE),
        getNextPageParam: (lastPage, pages) =>
            lastPage && lastPage.length === PAGE_SIZE ? pages.length + 1 : undefined,
        enabled: !!user?.id,
    });

    const clubs = data?.pages.flatMap((p) => p ?? []) ?? [];
    const isEmpty = !isLoading && clubs.length === 0;

    const stableFetchNextPage = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) stableFetchNextPage(); },
            { threshold: 0.1 }
        );
        const el = observerRef.current;
        if (el) observer.observe(el);
        return () => observer.disconnect();
    }, [stableFetchNextPage]);

    const buildSub = (club) =>
        [club.sport, club.location].filter(Boolean).join(" · ") || "Klub";

    return (
        <main>
            <Navbar />
            <div className={layout.mainContainerTwoCol}>
                <aside className={layout.leftColumn}>
                    <SideNav />
                </aside>

                <section className={layout.centerColumn}>
                    <div className={styles.header}>
                        <Building2 size={18} />
                        <h1 className={styles.headerTitle}>Predloženi klubovi</h1>
                    </div>

                    {isLoading && (
                        <div className={styles.loaderWrap}>
                            <PropagateLoader color="#65646420" size={10} />
                        </div>
                    )}

                    {isEmpty && (
                        <div className={styles.emptyState}>
                            <SearchX size={40} strokeWidth={1.2} />
                            <p>Trenutno nema klubova za prikaz.</p>
                        </div>
                    )}

                    <div className={styles.list}>
                        {clubs.map((club) => (
                            <NetworkCard
                                key={club.id}
                                id={club.id}
                                nickname={club.nickname}
                                image={club.image}
                                title={club.club_name ?? club.nickname}
                                subtitle={buildSub(club)}
                                isPrivate={false}
                                isFollowing={club.is_following}
                            />
                        ))}
                    </div>

                    {isFetchingNextPage && (
                        <div className={styles.loaderWrap}>
                            <PropagateLoader color="#65646420" size={10} />
                        </div>
                    )}

                    {hasNextPage && !isFetchingNextPage && (
                        <button className={styles.loadMore} onClick={stableFetchNextPage}>
                            Učitaj još klubova
                        </button>
                    )}

                    {!hasNextPage && !isLoading && clubs.length > 0 && (
                        <p className={styles.endText}>To je sve za sada</p>
                    )}

                    <div ref={observerRef} style={{ height: 1 }} />
                </section>
            </div>
        </main>
    );
}
