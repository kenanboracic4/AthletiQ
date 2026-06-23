"use client";

import { X, Search, Users, UserPlus, UserMinus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getFollowersList, getFollowingList, searchFollowers } from "@/api/follow";
import { searchFollowingUsers } from "@/api/follow";
import styles from "./FollowersModal.module.css";
import { useAuth } from "@/context/AuthContext";
import ConfirmDeleteModal from "../ConfrimDeleteModal/ConfrimDeleteModa";
import toast from "react-hot-toast";
import { useDebouncedCallback } from "use-debounce";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const ROLE_LABELS = {
    ATHLETE: "Sportista",
    RECREATIONAL_ATHLETE: "Rekreativni sportista",
    SCOUT: "Skaut",
    CLUB: "Klub",
    COACH: "Trener",
    ADMIN: "Administrator",
};

function resolveImageUrl(path) {
    if (!path) return "/no-profile-picture.png";
    if (path.startsWith("http")) return path;
    return `${API_BASE}${path}`;
}

function Avatar({ user }) {
    return (
        <div className={styles.avatar}>
            <img src={resolveImageUrl(user.image)} alt={user.nickname} className={styles.avatarImg} />
        </div>
    );
}

export default function FollowersModal({ nickname, onClose, type, count, handleUnfollow }) {
    const [followers, setFollowers] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [confirmUnfollow, setConfirmUnfollow] = useState(null);
    const listRef = useRef(null);
    const cursorRef = useRef(null);
    const { user: loggedInUser } = useAuth();

    const loadFollowers = async (currentCursor = null) => {
        if (loading) return;
        setLoading(true);
        try {
            const data = type === "followers"
                ? await getFollowersList(nickname, 10, currentCursor)
                : await getFollowingList(nickname, 10, currentCursor);

            if (data && data.length > 0) {
                setFollowers(prev => currentCursor ? [...prev, ...data] : data);
                const lastItem = data[data.length - 1];
                if (lastItem.created_at) cursorRef.current = lastItem.created_at;
                if (data.length < 10) setHasMore(false);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Greška pri učitavanju:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!nickname) return;
        setFollowers([]);
        cursorRef.current = null;
        setHasMore(true);
        loadFollowers(null);
    }, [nickname, type]);

    const debouncedSearch = useDebouncedCallback(async (term) => {
        if (!term || term.length < 2) {
            setSearchResults(null);
            return;
        }
        setIsSearching(true);
        try {
            const results = type === "followers" ? await searchFollowers(term, nickname) : await searchFollowingUsers(term, nickname);
            setSearchResults(results ?? []);
        } catch {
            toast.error("Greška pri pretrazi.");
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, 350);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchInput(val);
        if (!val.trim()) {
            setSearchResults(null);
            setIsSearching(false);
        } else {
            setIsSearching(true);
            debouncedSearch(val);
        }
    };

    const handleScroll = () => {
        if (!listRef.current || loading || !hasMore || searchResults !== null) return;
        const { scrollTop, scrollHeight, clientHeight } = listRef.current;
        if (scrollHeight - scrollTop <= clientHeight + 5) {
            loadFollowers(cursorRef.current);
        }
    };

    const handleUnfollowClick = (e, targetNickname) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmUnfollow(targetNickname);
    };

    const handleUnfollowUser = async (targetNickname) => {
        try {
            handleUnfollow(targetNickname);
            setFollowers(prev => prev.filter(u => u.nickname !== targetNickname));
            if (searchResults) {
                setSearchResults(prev => prev.filter(u => u.nickname !== targetNickname));
            }
            setConfirmUnfollow(null);
        } catch {
            toast.error("Greška pri otpraćivanju!");
        }
    };

    const isFollowers = type === "followers";
    const displayList = searchResults !== null ? searchResults : followers;
    const isActive = searchInput.length > 0;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                <div className={styles.header}>
                    <div className={styles.tabs}>
                        <div className={`${styles.tab} ${styles.tabActive}`}>
                            <Users size={15} />
                            {isFollowers ? "Pratioci" : "Prati"}
                            <span className={styles.count}>{count}</span>
                        </div>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className={`${styles.searchWrap} ${isActive ? styles.searchActive : ""}`}>
                    <div className={styles.searchInner}>
                        <Search
                            size={15}
                            className={`${styles.searchIcon} ${isActive ? styles.searchIconActive : ""}`}
                        />
                        <input
                            className={styles.searchInput}
                            placeholder={isFollowers ? "Pretraži pratioce..." : "Pretraži profile koje prati..."}
                            value={searchInput}
                            onChange={handleSearchChange}
                            autoFocus
                        />
                        {isSearching && <span className={styles.searchSpinner} />}
                        {isActive && !isSearching && (
                            <button
                                className={styles.clearBtn}
                                onClick={() => { setSearchInput(""); setSearchResults(null); }}
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>

                <div className={styles.list} ref={listRef} onScroll={handleScroll}>
                    {displayList.length === 0 && !loading && !isSearching ? (
                        <div className={styles.empty}>
                            <UserPlus size={32} strokeWidth={1.2} />
                            <p>
                                {searchInput
                                    ? `Nema rezultata za "${searchInput}".`
                                    : isFollowers ? "Još nema pratilaca." : "Ne prati nikoga."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {displayList.map((u, i) => (
                                <Link
                                    key={u.id}
                                    href={`/profile/${u.nickname}`}
                                    className={styles.item}
                                    onClick={onClose}
                                    style={{ animationDelay: `${i * 40}ms` }}
                                >
                                    <Avatar user={u} />
                                    <div className={styles.info}>
                                        <span className={styles.nickname}>@{u.nickname}</span>
                                        <span className={styles.role}>
                                            {ROLE_LABELS[u.role] || u.role}
                                        </span>
                                    </div>
                                    {loggedInUser?.nickname === nickname && (
                                        <button
                                            className={styles.unfollowBtn}
                                            onClick={(e) => handleUnfollowClick(e, u.nickname)}
                                            title="Otprati"
                                        >
                                            <UserMinus size={16} />
                                        </button>
                                    )}
                                </Link>
                            ))}
                            {(loading || isSearching) && (
                                <p className={styles.loadingText}>Učitavanje...</p>
                            )}
                        </>
                    )}

                    {confirmUnfollow && (
                        <ConfirmDeleteModal
                            type="unfollow"
                            nickname={confirmUnfollow}
                            onCancel={() => setConfirmUnfollow(false)}
                            onConfirm={() => handleUnfollowUser(confirmUnfollow)}
                        />
                    )}
                </div>

            </div>
        </div>
    );
}