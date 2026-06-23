"use client";

import { LayoutGrid } from "lucide-react";
import { useState } from "react";
import styles from "./ActivitySection.module.css";
import { useUser } from "@/hooks/User";
import PostsCarousel from "@/components/PostsCarousel/PostsCarousel";

const TABS = ["Objave", "Komentari", "Slike"];
const CARDS_PER_PAGE = 3;

export default function ActivitySection({ nickname }) {
    const [activeTab, setActiveTab] = useState(0);
    const [page, setPage] = useState(0);

    const offset = page * CARDS_PER_PAGE;

    const { userPosts, isLoadingUserPosts } = useUser(nickname, null, offset, CARDS_PER_PAGE);

    const posts = userPosts?.items ?? userPosts ?? [];
    const totalCount = userPosts?.total ?? posts.length;
    const totalPages = Math.ceil(totalCount / CARDS_PER_PAGE);

    const handlePrev = () => setPage((p) => Math.max(0, p - 1));
    const handleNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

    return (
        <section className={styles.card}>
            <div className={styles.inner}>
                <div className={styles.header}>
                    <div className={styles.titleRow}>
                        <div className={styles.iconWrap}>
                            <LayoutGrid size={18} strokeWidth={2} />
                        </div>
                        <h2 className={styles.title}>Aktivnost</h2>
                    </div>
                </div>

                <div className={styles.tabs} role="tablist">
                    {TABS.map((tab, i) => (
                        <button
                            key={tab}
                            role="tab"
                            aria-selected={i === activeTab}
                            onClick={() => { setActiveTab(i); setPage(0); }}
                            className={`${styles.tab} ${i === activeTab ? styles.tabActive : ""}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 0 && (
                    <>
                        {isLoadingUserPosts ? (
                            <div className={styles.emptyState}>
                                <p className={styles.emptyText}>Učitavanje...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className={styles.emptyState}>
                                <span className={styles.emptyIcon}>📭</span>
                                <p className={styles.emptyText}>Još nema objava.</p>
                            </div>
                        ) : (
                            <PostsCarousel
                                posts={posts}
                                page={page}
                                totalPages={totalPages}
                                onPrev={handlePrev}
                                onNext={handleNext}
                                onDotClick={setPage}
                            />
                        )}
                    </>
                )}

                {activeTab !== 0 && (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>📭</span>
                        <p className={styles.emptyText}>Još nema sadržaja.</p>
                    </div>
                )}
            </div>
        </section>
    );
}