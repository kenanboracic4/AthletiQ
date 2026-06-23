"use client";

import { useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import Navbar from "@/components/NavBar/NavBar";
import SideNav from "@/components/SideNav/SideNav";
import NetworkCard from "@/components/NetworkCard/NetworkCard";
import { getSuggestedPeople } from "@/api/user";
import { useAuth } from "@/context/AuthContext";
import { PropagateLoader } from "react-spinners";
import { Users, UserX } from "lucide-react";
import styles from "./page.module.css";
import layout from "@/styles/pageLayout.module.css";

const ROLE_LABELS = {
    ATHLETE: "Sportista",
    RECREATIONAL_ATHLETE: "Rekreativni sportista",
    SCOUT: "Skaut",
    CLUB: "Klub",
    COACH: "Trener",
    ADMIN: "Administrator",
};

const PAGE_SIZE = 12;

export default function PeoplePage() {
    const { user } = useAuth();
    const observerRef = useRef(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ["allPeople"],
        queryFn: ({ pageParam = 1 }) => getSuggestedPeople(pageParam, PAGE_SIZE, false),
        getNextPageParam: (lastPage, pages) =>
            lastPage && lastPage.length === PAGE_SIZE ? pages.length + 1 : undefined,
        enabled: !!user?.id,
    });

    const people = data?.pages.flatMap((p) => p ?? []) ?? [];
    const isEmpty = !isLoading && people.length === 0;

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

    return (
        <main>
            <Navbar />
            <div className={layout.mainContainerTwoCol}>
                <aside className={layout.leftColumn}>
                    <SideNav />
                </aside>

                <section className={layout.centerColumn}>
                    <div className={styles.header}>
                        <Users size={18} />
                        <h1 className={styles.headerTitle}>Profili za tebe</h1>
                    </div>

                    {isLoading && (
                        <div className={styles.loaderWrap}>
                            <PropagateLoader color="#65646420" size={10} />
                        </div>
                    )}

                    {isEmpty && (
                        <div className={styles.emptyState}>
                            <UserX size={40} strokeWidth={1.2} />
                            <p>Trenutno nema korisnika za prikaz.</p>
                        </div>
                    )}

                    <div className={styles.list}>
                        {people.map((person) => (
                            <NetworkCard
                                key={person.id}
                                id={person.id}
                                nickname={person.nickname}
                                image={person.image}
                                title={person.nickname}
                                subtitle={ROLE_LABELS[person.role] ?? person.role}
                                isPrivate={person.is_private}
                                friendshipStatus={person.friendship_status}
                                isFollowing={person.is_following}
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
                            Učitaj još korisnika
                        </button>
                    )}

                    {!hasNextPage && !isLoading && people.length > 0 && (
                        <p className={styles.endText}>To je sve za sada</p>
                    )}

                    <div ref={observerRef} style={{ height: 1 }} />
                </section>
            </div>
        </main>
    );
}
