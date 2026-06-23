"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    ThumbsUp, MessageCircle, MoreHorizontal,
    X, ChevronLeft, ChevronRight, Pencil, Trash2, Flag,
} from "lucide-react";
import { getVisibilityOption } from "@/lib/postVisibility";

import styles from "./SocialPostCard.module.css";
import { likePost, deleteLike } from "@/api/posts";
import { useAuth } from "@/context/AuthContext";
import CommentModal from "../CommentsModal/CommentsModal";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "../ConfrimDeleteModal/ConfrimDeleteModa";
import EditPostModal from "../EditPostModal/EditPostModal";
import ReportModal from "../ReportModal/ReportModal";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function clamp(arr, max = 3) {
    if (!Array.isArray(arr)) return [];
    return arr.slice(0, max);
}

function resolveImageUrl(path) {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path}`;
}

function Avatar({ url }) {
    return (
        <div className={styles.avatar}>
            <img src={url ?? "/no-profile-picture.png"} alt="" className={styles.avatarImg} />
        </div>
    );
}

function ImageGrid({ images, onOpen }) {
    const count = images.length;

    if (!count) return null;

    if (count === 1) {
        return (
            <div className={`${styles.grid} ${styles.grid1}`}>
                <button className={styles.imgBtn} onClick={() => onOpen(0)} aria-label="View image 1">
                    <img src={images[0]} alt="Post image" className={styles.img} />
                </button>
            </div>
        );
    }

    if (count === 2) {
        return (
            <div className={`${styles.grid} ${styles.grid2}`}>
                {images.map((src, i) => (
                    <button key={i} className={styles.imgBtn} onClick={() => onOpen(i)} aria-label={`View image ${i + 1}`}>
                        <img src={src} alt={`Post image ${i + 1}`} className={styles.img} />
                    </button>
                ))}
            </div>
        );
    }

    if (count === 3) {
        return (
            <div className={`${styles.grid} ${styles.grid3}`}>
                <div className={styles.imgMainWrapper}>
                    <button className={styles.imgBtn} onClick={() => onOpen(0)} aria-label="View image 1">
                        <img src={images[0]} alt="Post image 1" className={styles.img} />
                    </button>
                </div>
                <button className={styles.imgBtn} onClick={() => onOpen(1)} aria-label="View image 2">
                    <img src={images[1]} alt="Post image 2" className={styles.img} />
                </button>
                <button className={styles.imgBtn} onClick={() => onOpen(2)} aria-label="View image 3">
                    <img src={images[2]} alt="Post image 3" className={styles.img} />
                </button>
            </div>
        );
    }
    return null;
}

function Lightbox({ images, index, onClose, onPrev, onNext }) {
    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onPrev();
            if (e.key === "ArrowRight") onNext();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose, onPrev, onNext]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div className={styles.lightboxOverlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Image viewer">
            <div className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
                <button className={`${styles.lbBtn} ${styles.lbClose}`} onClick={onClose} aria-label="Close">
                    <X size={20} />
                </button>
                {images.length > 1 && (
                    <button className={`${styles.lbBtn} ${styles.lbPrev}`} onClick={onPrev} aria-label="Previous image">
                        <ChevronLeft size={24} />
                    </button>
                )}
                <img key={index} src={images[index]} alt={`Image ${index + 1} of ${images.length}`} className={styles.lbImg} />
                {images.length > 1 && (
                    <button className={`${styles.lbBtn} ${styles.lbNext}`} onClick={onNext} aria-label="Next image">
                        <ChevronRight size={24} />
                    </button>
                )}
                {images.length > 1 && (
                    <div className={styles.lbCounter}>{index + 1} / {images.length}</div>
                )}
            </div>
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

export default function SocialPostCard({ post, onCommentSubmit, onDeleteComment, onCommentReplySubmit, onDeleteCommentReply, onDeletePost, onEditPost }) {
    if (!post) return null;

    const { user: currentUser } = useAuth();
    const user = post?.user ?? {};

    const nickname = user?.nickname ?? "Unknown";
    const avatarUrl = user?.image ? resolveImageUrl(user.image) : null;
    const isVerified = user?.is_verified ?? false;
    const content = post?.content ?? "";

    const images = clamp(
        (post?.images ?? []).map((img) => resolveImageUrl(img?.image_url)).filter(Boolean)
    );

    const timestamp = formatTimestamp(post?.created_at);
    const visibilityOption = getVisibilityOption(post?.visibility);
    const VisibilityIcon = visibilityOption.icon;

    const alreadyLiked = Array.isArray(post?.likes)
        ? post.likes.some((l) => l?.user_id === currentUser?.id)
        : false;

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const [editOpen, setEditOpen] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const [openCommentsModal, setOpenCommentsModal] = useState(false);
    const [liked, setLiked] = useState(alreadyLiked);
    const [isLikePending, setIsLikePending] = useState(false);
    const [likesCount, setLikesCount] = useState(
        post?.likes_count ?? post?.likes?.length ?? 0
    );

    useEffect(() => {
        setLiked(alreadyLiked);
    }, [post?.id, currentUser?.id]);

    const handleLike = async () => {
        if (isLikePending) return;
        setIsLikePending(true);

        if (liked) {
            setLiked(false);
            setLikesCount((c) => c - 1);
            try {
                await deleteLike(post.id);
            } catch {
                setLiked(true);
                setLikesCount((c) => c + 1);
            } finally {
                setIsLikePending(false);
            }
        } else {
            setLiked(true);
            setLikesCount((c) => c + 1);
            try {
                await likePost(post.id);
            } catch {
                setLiked(false);
                setLikesCount((c) => c - 1);
            } finally {
                setIsLikePending(false);
            }
        }
    };

    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [menuOpen]);

    const commentsCount = Array.isArray(post?.comments)
        ? post.comments.length
        : (post?.comments_count ?? 0);

    const [lbIndex, setLbIndex] = useState(null);
    const openLightbox = useCallback((i) => setLbIndex(i), []);
    const closeLightbox = useCallback(() => setLbIndex(null), []);
    const prevImage = useCallback(
        () => setLbIndex((i) => (i - 1 + images.length) % images.length),
        [images.length]
    );
    const nextImage = useCallback(
        () => setLbIndex((i) => (i + 1) % images.length),
        [images.length]
    );

    const handleCommentSubmit = (postId, content) => {
        if (!content.trim()) return;
        onCommentSubmit({ postId, content });
    };

    const handleDeleteComment = (commentId) => {
        onDeleteComment(commentId);
    };

    const handleCommentReplySubmit = (commentId, postId, content) => {
        if (!content.trim()) return;
        onCommentReplySubmit({ commentId, postId, content });
    };

    const handleDeleteCommentReply = (commentId) => {
        onDeleteCommentReply(commentId);
    };

    return (
        <>
            <article className={styles.card}>
                <header className={styles.header}>
                    <Avatar url={avatarUrl} />
                    <div className={styles.meta}>
                        <p className={styles.authorRow}>
                            <Link href={`/profile/${nickname}`} className={styles.authorName}>
                                <span className={styles.authorName}>{nickname}</span>
                            </Link>
                            {isVerified && (
                                <svg className={styles.verified} viewBox="0 0 16 16" aria-label="Verified">
                                    <circle cx="8" cy="8" r="8" fill="var(--brand)" />
                                    <path d="M6.5 11L3.5 8l1.06-1.06L6.5 8.88l4.94-4.94L12.5 5z" fill="#fff" />
                                </svg>
                            )}
                        </p>
                        <p className={styles.timestamp}>
                            <span>{timestamp}</span>
                            <VisibilityIcon size={12} aria-label={visibilityOption.label} />
                        </p>
                    </div>
                    {currentUser?.id === user?.id ? (
                        <div className={styles.moreBtnWrapper} ref={menuRef}>
                            <button
                                className={styles.moreBtn}
                                aria-label="More options"
                                onClick={() => setMenuOpen((v) => !v)}
                            >
                                <MoreHorizontal size={20} />
                            </button>
                            {menuOpen && (
                                <div className={styles.moreMenu} role="menu">
                                    <button
                                        className={styles.moreMenuItem}
                                        role="menuitem"
                                        onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                                    >
                                        <Pencil size={16} />
                                        Uredi
                                    </button>
                                    <button
                                        className={`${styles.moreMenuItem} ${styles.moreMenuItemDelete}`}
                                        role="menuitem"
                                        onClick={() => { setMenuOpen(false); setConfirmDeleteOpen(true); }}
                                    >
                                        <Trash2 size={16} />
                                        Obriši
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : currentUser && (
                        <button
                            className={styles.moreBtn}
                            aria-label="Prijavi objavu"
                            onClick={() => setReportOpen(true)}
                        >
                            <Flag size={18} />
                        </button>
                    )}
                </header>

                {content && <div className={styles.body}>{content}</div>}

                {images.length > 0 && <ImageGrid images={images} onOpen={openLightbox} />}

                {(likesCount > 0 || commentsCount > 0) && (
                    <div className={styles.statsBar}>
                        {likesCount > 0 && (
                            <div className={styles.reactions}>
                                <div className={styles.reactionBubbles}>
                                    <span className={styles.reactionDot}>
                                        <ThumbsUp size={16} aria-hidden="true" />
                                    </span>
                                </div>
                                <span className={styles.reactionCount}>{likesCount}</span>
                            </div>
                        )}
                        {commentsCount > 0 && (
                            <button className={styles.commentBtn} onClick={() => setOpenCommentsModal(true)}>
                                <span className={styles.commentCount}>
                                    {commentsCount} {commentsCount === 1 ? "comment" : "comments"}
                                </span>
                            </button>
                        )}
                    </div>
                )}

                <div className={styles.divider} />

                {currentUser && (
                    <div className={styles.actions}>
                        <button
                            className={`${styles.actionBtn} ${liked ? styles.liked : ""}`}
                            onClick={handleLike}
                            disabled={isLikePending}
                        >
                            <ThumbsUp
                                size={18}
                                aria-hidden="true"
                                color={liked ? "#303152" : "#000000"}
                                fill={liked ? "#bfc1f8" : "#ffffff"}
                            />
                            <span>Like</span>
                        </button>
                        <button className={styles.actionBtn} onClick={() => setOpenCommentsModal(true)}>
                            <MessageCircle size={18} aria-hidden="true" />
                            <span>Comment</span>
                        </button>
                    </div>
                )}
            </article>

            {openCommentsModal && (
                <CommentModal
                    post={post}
                    onClose={() => setOpenCommentsModal(false)}
                    onCommentSubmit={handleCommentSubmit}
                    onDeleteComment={handleDeleteComment}
                    handleCommentReplySubmit={handleCommentReplySubmit}
                    handleDeleteCommentReply={handleDeleteCommentReply}
                />
            )}

            {lbIndex !== null && images.length > 0 && (
                <Lightbox
                    images={images}
                    index={lbIndex}
                    onClose={closeLightbox}
                    onPrev={prevImage}
                    onNext={nextImage}
                />
            )}

            {confirmDeleteOpen && (
                <ConfirmDeleteModal
                    onConfirm={() => { setConfirmDeleteOpen(false); onDeletePost(post.id); }}
                    onCancel={() => setConfirmDeleteOpen(false)}
                />
            )}

            {editOpen && (
                <EditPostModal
                    post={post}
                    onClose={() => setEditOpen(false)}
                    onSave={(data) => onEditPost(data)}
                />
            )}

            {reportOpen && (
                <ReportModal
                    targetType="post"
                    postId={post.id}
                    onClose={() => setReportOpen(false)}
                />
            )}
        </>
    );
}