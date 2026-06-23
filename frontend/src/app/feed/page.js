'use client';

import { useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import Navbar from "@/components/NavBar/NavBar";
import { useAuth } from "@/context/AuthContext";
import layout from "@/styles/pageLayout.module.css";
import styles from "./page.module.css";
import SuggestedPeople from "@/components/SuggestedPeople/SuggestedPeople";
import SuggestedClubs from "@/components/SuggestedClubs/SuggestedClubs";
import CreatePost from "@/components/CreatePost/CreatePost";
import { getAlgorithmicFeed } from "@/api/posts";
import SocialPostCard from "@/components/PostCard/PostCard";
import { PropagateLoader } from "react-spinners";
import { queryKeys } from "@/lib/queryKeys";
import { usePostMutations } from "@/hooks/usePostMutations";
import SideNav from "@/components/SideNav/SideNav";

export default function FeedPage() {
    const { user } = useAuth();
    const observerRef = useRef(null);
    const { submitComment, removeComment, submitCommentReply, deleteCommentReply, deletePostFn, editPostFn } = usePostMutations(queryKeys.feed);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: queryKeys.feed,
        queryFn: ({ pageParam = null }) => getAlgorithmicFeed({ cursor: pageParam }),
        getNextPageParam: (lastPage) => lastPage.has_more ? lastPage.next_cursor : undefined,
    });

    const posts = data?.pages.flatMap((page) => page.items) ?? [];

    const stableFetchNextPage = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    stableFetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        const el = observerRef.current;
        if (el) observer.observe(el);

        return () => observer.disconnect();
    }, [stableFetchNextPage]);

    return (
        <main>
            <Navbar />

            <div className={layout.mainContainer}>
                <aside className={layout.leftColumn}>
                    <SideNav />
                </aside>
                <section className={layout.centerColumn}>
                    {user && <CreatePost user={user} />}

                    {isLoading && (
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <PropagateLoader color="#65646420" size={10} />
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
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <PropagateLoader color="#65646420" size={10} />
                        </div>
                    )}

                    {!hasNextPage && !isLoading && (
                        <p className={styles.noMorePosts}>Nema više objava</p>
                    )}

                    <div ref={observerRef} style={{ height: 1 }} />
                </section>

                <aside className={layout.rightColumn}>
                    <SuggestedPeople />
                    <SuggestedClubs />
                </aside>
            </div>
        </main>
    );
}
