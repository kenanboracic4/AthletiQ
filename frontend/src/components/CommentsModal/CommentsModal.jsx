"use client";

import { useState, useEffect, useRef } from "react";
import { X, Send, Trash, Check, ChevronDown, ChevronUp } from "lucide-react";
import styles from "./CommentModal.module.css";
import cardStyles from "../PostCard/SocialPostCard.module.css";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { getReplyComments } from "@/api/posts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function resolveImageUrl(path) {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path}`;
}

function CommentAvatar({ url, size = 32 }) {
    return (
        <div
            className={cardStyles.avatar}
            style={{ width: `${size}px`, height: `${size}px`, minWidth: `${size}px` }}
        >
            <img src={url ?? "/no-profile-picture.png"} alt="" className={cardStyles.avatarImg} />
        </div>
    );
}

function formatTimestamp(isoString) {
    if (!isoString) return "";
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHr = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHr / 24);

        if (diffMin < 1) return "upravo sad";
        if (diffMin < 60) return `${diffMin}m`;
        if (diffHr < 24) return `${diffHr}h`;
        if (diffDay < 7) return `${diffDay}d`;
        return date.toLocaleDateString();
    } catch {
        return "";
    }
}

export default function CommentModal({
    post,
    onClose,
    onCommentSubmit,
    onDeleteComment,
    onDeleteReply,
    handleCommentReplySubmit,
    handleDeleteCommentReply
}) {
    const { user: currentUser } = useAuth();
    const queryClient = useQueryClient();

    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [confirmDeleteReplyId, setConfirmDeleteReplyId] = useState(null);
    const [expandedReplies, setExpandedReplies] = useState({});
    const [replyTo, setReplyTo] = useState(null);
    const inputRef = useRef(null);
    const scrollRef = useRef(null);

    const activeReplyParentId = Object.keys(expandedReplies).find(
        (id) => expandedReplies[id]
    ) ?? null;

    const { data: replies, isLoading: isLoadingReplies } = useQuery({
        queryKey: queryKeys.replies(activeReplyParentId),
        queryFn: () => getReplyComments(activeReplyParentId),
        enabled: !!activeReplyParentId
    });

    const comments = Array.isArray(post?.comments) ? post.comments : [];

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments.length]);

    useEffect(() => {
        if (replyTo && inputRef.current) {
            inputRef.current.focus();
        }
    }, [replyTo]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                if (confirmDeleteReplyId) {
                    setConfirmDeleteReplyId(null);
                } else if (confirmDeleteId) {
                    setConfirmDeleteId(null);
                } else if (replyTo) {
                    setReplyTo(null);
                } else {
                    onClose();
                }
            }
        };

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose, confirmDeleteId, confirmDeleteReplyId, replyTo]);

    const toggleReplies = (commentId) => {
        setExpandedReplies((prev) => {
            const isCurrentlyOpen = prev[commentId];
            return { [commentId]: !isCurrentlyOpen };
        });
    };

    const handleConfirmDelete = () => {
        onDeleteComment(confirmDeleteId);
        setConfirmDeleteId(null);
    };

    const handleConfirmDeleteReply = async () => {
        try {
            await handleDeleteCommentReply(confirmDeleteReplyId);
            queryClient.setQueryData(queryKeys.replies(activeReplyParentId), (oldReplies) => {
                if (!oldReplies) return oldReplies;
                return oldReplies.filter((r) => r.id !== confirmDeleteReplyId);
            })
        } catch {
            toast.error("Greška pri brisanju odgovora!");
        } finally {
            setConfirmDeleteReplyId(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!text.trim() || loading) return;

        setLoading(true);

        try {
            if (replyTo) {
                await handleCommentReplySubmit(replyTo.id, post?.id, text.trim());
            } else {
                await onCommentSubmit(post?.id, text.trim());
            }

            setText("");
            setReplyTo(null);
        } catch {
            toast.error("Greška kod slanja!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <header className={styles.header}>
                    <h2>Komentari ({comments.length})</h2>
                    <button
                        className={cardStyles.moreBtn}
                        onClick={onClose}
                        aria-label="Zatvori"
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className={styles.commentsList}>
                    {comments.length === 0 ? (
                        <p className={styles.emptyState}>
                            Nema komentara. Budi prvi koji će prokomentarisati.
                        </p>
                    ) : (
                        comments.map((comment, index) => {
                            const author = comment?.user ?? {};
                            const nickname = author?.nickname ?? "Unknown";
                            const avatarUrl = author?.image
                                ? resolveImageUrl(author.image)
                                : null;

                            const isOwner = currentUser?.id === author?.id;
                            const isPendingDelete = confirmDeleteId === comment.id;
                            const isExpanded = !!expandedReplies[comment.id];
                            const commentReplies =
                                activeReplyParentId === comment.id ? replies : null;

                            return (
                                <div key={index} className={styles.commentBlock}>
                                    <div
                                        className={`${styles.commentItem} ${isPendingDelete ? styles.commentItemDeleting : ""}`}
                                    >
                                        {isPendingDelete && (
                                            <div className={styles.deleteConfirmOverlay}>
                                                <span className={styles.deleteConfirmText}>
                                                    Obrisati komentar?
                                                </span>
                                                <div className={styles.deleteConfirmActions}>
                                                    <button
                                                        className={styles.deleteConfirmNo}
                                                        onClick={() => setConfirmDeleteId(null)}
                                                    >
                                                        <X size={15} />
                                                    </button>
                                                    <button
                                                        className={styles.deleteConfirmYes}
                                                        onClick={handleConfirmDelete}
                                                    >
                                                        <Check size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <CommentAvatar url={avatarUrl} />

                                        <div className={styles.commentMain}>
                                            <div className={styles.commentRow}>
                                                <div className={styles.commentBubble}>
                                                    <p className={styles.commentUser}>{nickname}</p>
                                                    <p className={styles.commentText}>
                                                        {comment.content}
                                                    </p>
                                                </div>

                                                {isOwner && (
                                                    <Trash
                                                        size={22}
                                                        className={styles.deleteBtn}
                                                        onClick={() =>
                                                            setConfirmDeleteId(comment.id)
                                                        }
                                                    />
                                                )}
                                            </div>

                                            <div className={styles.commentMetaRow}>
                                                <span className={styles.commentMeta}>
                                                    {formatTimestamp(comment.created_at)}
                                                </span>

                                                <button
                                                    type="button"
                                                    className={styles.replyBtn}
                                                    onClick={() => setReplyTo(comment)}
                                                >
                                                    Reply
                                                </button>

                                                {comment.reply_count > 0 && (
                                                    <button
                                                        type="button"
                                                        className={styles.toggleRepliesBtn}
                                                        onClick={() => toggleReplies(comment.id)}
                                                    >
                                                        {isExpanded ? (
                                                            <>
                                                                <ChevronUp size={13} />
                                                                Hide replies
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown size={13} />
                                                                {comment.reply_count}{" "}
                                                                {comment.reply_count === 1
                                                                    ? "reply"
                                                                    : "replies"}
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className={styles.repliesContainer}>
                                            {isLoadingReplies && activeReplyParentId === comment.id ? (
                                                <p className={styles.repliesLoading}>
                                                    Loading...
                                                </p>
                                            ) : Array.isArray(commentReplies) &&
                                                commentReplies.length > 0 ? (
                                                commentReplies.map((reply, ri) => {
                                                    const replyAuthor = reply?.user ?? {};
                                                    const replyNickname =
                                                        replyAuthor?.nickname ?? "Unknown";
                                                    const replyAvatarUrl = replyAuthor?.image
                                                        ? resolveImageUrl(replyAuthor.image)
                                                        : null;
                                                    const isReplyOwner = currentUser?.id === replyAuthor?.id;
                                                    const isReplyPendingDelete = confirmDeleteReplyId === reply.id;

                                                    return (
                                                        <div
                                                            key={ri}
                                                            className={`${styles.replyItem} ${isReplyPendingDelete ? styles.commentItemDeleting : ""}`}
                                                        >
                                                            {isReplyPendingDelete && (
                                                                <div className={styles.deleteConfirmOverlay}>
                                                                    <span className={styles.deleteConfirmText}>
                                                                        Obrisati odgovor?
                                                                    </span>
                                                                    <div className={styles.deleteConfirmActions}>
                                                                        <button
                                                                            className={styles.deleteConfirmNo}
                                                                            onClick={() => setConfirmDeleteReplyId(null)}
                                                                        >
                                                                            <X size={15} />
                                                                        </button>
                                                                        <button
                                                                            className={styles.deleteConfirmYes}
                                                                            onClick={handleConfirmDeleteReply}
                                                                        >
                                                                            <Check size={15} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <CommentAvatar
                                                                url={replyAvatarUrl}
                                                                size={26}
                                                            />
                                                            <div className={styles.replyMain}>
                                                                <div className={styles.replyRow}>
                                                                    <div className={styles.commentBubble}>
                                                                        <p className={styles.commentUser}>
                                                                            {replyNickname}
                                                                        </p>
                                                                        <p className={styles.replyText}>
                                                                            {reply.content}
                                                                        </p>
                                                                    </div>
                                                                    {isReplyOwner && (
                                                                        <Trash
                                                                            size={20}
                                                                            className={styles.deleteBtn}
                                                                            onClick={() => setConfirmDeleteReplyId(reply.id)}
                                                                        />
                                                                    )}
                                                                </div>
                                                                <span className={styles.commentMeta}>
                                                                    {formatTimestamp(reply.created_at)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}

                    <div ref={scrollRef} />
                </div>

                <footer className={styles.footer}>
                    {replyTo && (
                        <div className={styles.replyIndicator}>
                            <span className={styles.replyIndicatorText}>
                                Reply to {" "}
                                <strong>{replyTo.user?.nickname ?? "user"}</strong>
                            </span>
                            <button
                                type="button"
                                className={styles.replyIndicatorCancel}
                                onClick={() => setReplyTo(null)}
                            >
                                <X size={13} />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.inputForm}>
                        <CommentAvatar
                            url={
                                currentUser?.image
                                    ? resolveImageUrl(currentUser.image)
                                    : null
                            }
                        />

                        <div className={styles.inputWrapper}>
                            <input
                                ref={inputRef}
                                type="text"
                                className={styles.input}
                                placeholder={
                                    replyTo ? "Write a reply..." : "Write a comment..."
                                }
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                disabled={loading}
                            />

                            <button
                                type="submit"
                                className={styles.sendBtn}
                                disabled={!text.trim() || loading}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </footer>
            </div>
        </div>
    );
}