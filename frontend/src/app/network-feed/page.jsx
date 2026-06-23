'use client';

import { useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery, useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import Navbar from "@/components/NavBar/NavBar";
import { useAuth } from "@/context/AuthContext";
import layout from "@/styles/pageLayout.module.css";
import styles from "../feed/page.module.css";
import { followingFeedPost } from "@/api/posts";
import { searchUsers } from "@/api/user";
import SocialPostCard from "@/components/PostCard/PostCard";
import SearchUsers from "@/components/Search/Search";
import UserCard from "@/components/UserCard/UserCard";
import { PropagateLoader } from "react-spinners";
import { queryKeys } from "@/lib/queryKeys";
import { Users, Search, UserX } from "lucide-react";
import { usePostMutations } from "@/hooks/usePostMutations";
import SideNav from "@/components/SideNav/SideNav";
import SuggestedPeople from "@/components/SuggestedPeople/SuggestedPeople";
import SuggestedClubs from "@/components/SuggestedClubs/SuggestedClubs";

export default function NetworkFeed() {
    const { user } = useAuth();
    const observerRef = useRef(null);
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get("search") || "";

    const { submitComment, removeComment, submitCommentReply, deleteCommentReply, deletePostFn, editPostFn } =
        usePostMutations(queryKeys.friendsFeed);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isFeedLoading,
    } = useInfiniteQuery({
        queryKey: queryKeys.friendsFeed,
        queryFn: ({ pageParam = null }) => followingFeedPost(10, pageParam),
        getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
        enabled: !searchQuery,
    });

    const {
        data: searchResults,
        isLoading: isSearchLoading,
        isFetching: isSearchFetching,
        isError: isSearchError,
    } = useQuery({
        queryKey: ["usersSearch", searchQuery],
        queryFn: () => searchUsers(searchQuery),
        enabled: searchQuery.length >= 1,
        staleTime: 1000 * 30,
        placeholderData: keepPreviousData,
    });

    const results = Array.isArray(searchResults) ? searchResults : [];
    const isInitialSearch = isSearchLoading && results.length === 0;
    const isUpdatingSearch = isSearchFetching && !isInitialSearch;

    const posts = data?.pages.flatMap((page) => page.items) ?? [];
    const isFeedEmpty = !isFeedLoading && posts.length === 0 && !searchQuery;

    const stableFetchNextPage = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) fetchNextPage();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        if (searchQuery) return;

        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) stableFetchNextPage(); },
            { threshold: 0.1 }
        );
        const el = observerRef.current;
        if (el) observer.observe(el);
        return () => observer.disconnect();
    }, [stableFetchNextPage, searchQuery]);

    return (
        <main>
            <Navbar />
            <div className={layout.mainContainer}>

                <aside className={layout.leftColumn}>
                    <SideNav />
                </aside>

                <section className={layout.centerColumn}>
                    <SearchUsers />

                    {searchQuery ? (
                        <>
                            <div className={styles.feedHeader}>
                                <Search size={16} />
                                <span>
                                    {isInitialSearch
                                        ? `Pretraga za "${searchQuery}"...`
                                        : `Rezultati za "${searchQuery}"`}
                                    {isUpdatingSearch && !isInitialSearch ? " · ažuriranje..." : ""}
                                </span>
                            </div>

                            {isInitialSearch && (
                                <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
                                    <PropagateLoader color="#65646420" size={10} />
                                </div>
                            )}

                            {isSearchError && !isSearchFetching && (
                                <div className={styles.emptyFeed}>
                                    <UserX size={36} strokeWidth={1.2} />
                                    <p>Greška pri pretrazi.</p>
                                    <span>Pokušaj ponovo za nekoliko sekundi.</span>
                                </div>
                            )}

                            {!isSearchError && !isInitialSearch && results.length === 0 && (
                                <div className={styles.emptyFeed}>
                                    <UserX size={36} strokeWidth={1.2} />
                                    <p>Nema korisnika.</p>
                                    <span>Niko ne odgovara pojmu "{searchQuery}".</span>
                                </div>
                            )}

                            {results.length > 0 && (
                                <div className={styles.searchResults}>
                                    {results.map((u) => (
                                        <UserCard key={u.id} user={u} />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className={styles.feedHeader}>
                                <Users size={16} />
                                <span>Tvoja mreža</span>
                            </div>

                            {isFeedLoading && (
                                <div style={{ display: "flex", justifyContent: "center" }}>
                                    <PropagateLoader color="#65646420" size={10} />
                                </div>
                            )}

                            {isFeedEmpty && (
                                <div className={styles.emptyFeed}>
                                    <Users size={40} strokeWidth={1.2} />
                                    <p>Nema objava u tvojoj mreži.</p>
                                    <span>Dodaj prijatelje ili počni pratiti ljude da vidiš njihove objave ovdje.</span>
                                </div>
                            )}

                            {posts.map((post) => (
                                <SocialPostCard
                                    key={post.id}
                                    post={post}
                                    onCommentSubmit={submitComment}
                                    onDeleteComment={removeComment}
                                    onCommentReplySubmit={submitCommentReply}
                                    onDeleteCommentReply={deleteCommentReply}
                                    onDeletePost={deletePostFn}
                                    onEditPost={editPostFn}
                                />
                            ))}

                            {isFetchingNextPage && (
                                <div style={{ display: "flex", justifyContent: "center" }}>
                                    <PropagateLoader color="#65646420" size={10} />
                                </div>
                            )}

                            {!hasNextPage && !isFeedLoading && posts.length > 0 && (
                                <p className={styles.noMorePosts}>Nema više objava</p>
                            )}

                            <div ref={observerRef} style={{ height: 1 }} />
                        </>
                    )}
                </section>

                <aside className={layout.rightColumn}>
                    <SuggestedPeople />
                    <SuggestedClubs />
                </aside>

            </div>
        </main>
    );
}