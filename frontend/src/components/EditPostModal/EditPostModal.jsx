"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ImagePlus, Trash2 } from "lucide-react";
import styles from "./EditPostModal.module.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function resolveImageUrl(path) {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${API_BASE}${path}`;
}

export default function EditPostModal({ post, onClose, onSave }) {
    const [content, setContent] = useState(post?.content ?? "");

    const [existingImages, setExistingImages] = useState(
        (post?.images ?? []).map((img) => ({
            id: img.id,
            url: resolveImageUrl(img.image_url),
            markedForDelete: false,
        }))
    );

    const [newImages, setNewImages] = useState([]);

    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const overlayRef = useRef(null);

    const totalVisible =
        existingImages.filter((i) => !i.markedForDelete).length + newImages.length;

    const canAddMore = totalVisible < 3;

    useEffect(() => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        ta.style.height = `${ta.scrollHeight}px`;
    }, [content]);

    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const handleOverlayClick = (e) => {
        if (e.target === overlayRef.current) onClose();
    };

    const handleToggleDelete = (id) => {
        setExistingImages((prev) =>
            prev.map((img) =>
                img.id === id ? { ...img, markedForDelete: !img.markedForDelete } : img
            )
        );
    };

    const handleRemoveNew = (index) => {
        setNewImages((prev) => {
            const copy = [...prev];
            URL.revokeObjectURL(copy[index].preview);
            copy.splice(index, 1);
            return copy;
        });
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;

        const remaining = 3 - totalVisible;
        const toAdd = files.slice(0, remaining).map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setNewImages((prev) => [...prev, ...toAdd]);
        e.target.value = "";
    };

    useEffect(() => {
        return () => {
            newImages.forEach((img) => URL.revokeObjectURL(img.preview));
        };
    }, []);

    const handleSave = () => {
        const deletedImageIds = existingImages
            .filter((i) => i.markedForDelete)
            .map((i) => i.id);

        const newFiles = newImages.map((i) => i.file);

        onSave?.({
            postId: post.id,
            content,
            deletedImageIds,
            newFiles,
        });

        onClose();
    };

    const hasChanges =
        content !== (post?.content ?? "") ||
        existingImages.some((i) => i.markedForDelete) ||
        newImages.length > 0;

    return (
        <div
            className={styles.overlay}
            ref={overlayRef}
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="epm-title"
        >
            <div className={styles.modal}>

                <div className={styles.header}>
                    <h2 className={styles.title} id="epm-title">Uredi objavu</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Zatvori">
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.divider} />

                <div className={styles.body}>

                    <div className={styles.authorRow}>
                        <div className={styles.avatar}>
                            <img
                                src={post?.user?.image ? resolveImageUrl(post.user.image) : "/no-profile-picture.png"}
                                alt=""
                                className={styles.avatarImg}
                            />
                        </div>
                        <div>
                            <p className={styles.authorName}>{post?.user?.nickname ?? "Unknown"}</p>
                            <span className={styles.audienceBadge}>🌐 Javno</span>
                        </div>
                    </div>

                    <textarea
                        ref={textareaRef}
                        className={styles.textarea}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Šta misliš?"
                        rows={3}
                    />

                    {(existingImages.length > 0 || newImages.length > 0) && (
                        <div className={styles.imageSection}>
                            <p className={styles.imageSectionLabel}>Slike</p>
                            <div className={styles.imageGrid}>

                                {existingImages.map((img) => (
                                    <div
                                        key={img.id}
                                        className={`${styles.imageThumb} ${img.markedForDelete ? styles.markedForDelete : ""}`}
                                    >
                                        <img src={img.url} alt="" className={styles.thumbImg} />
                                        <div className={styles.thumbOverlay}>
                                            {img.markedForDelete ? (
                                                <div className={styles.deletedLabel}>Obrisano</div>
                                            ) : null}
                                            <button
                                                className={`${styles.thumbBtn} ${img.markedForDelete ? styles.thumbBtnRestore : styles.thumbBtnDelete}`}
                                                onClick={() => handleToggleDelete(img.id)}
                                                aria-label={img.markedForDelete ? "Vrati sliku" : "Ukloni sliku"}
                                            >
                                                {img.markedForDelete ? (
                                                    <span className={styles.restoreText}>Vrati</span>
                                                ) : (
                                                    <Trash2 size={14} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {newImages.map((img, i) => (
                                    <div key={`new-${i}`} className={`${styles.imageThumb} ${styles.newThumb}`}>
                                        <img src={img.preview} alt="" className={styles.thumbImg} />
                                        <div className={styles.thumbOverlay}>
                                            <span className={styles.newLabel}>Nova</span>
                                            <button
                                                className={`${styles.thumbBtn} ${styles.thumbBtnDelete}`}
                                                onClick={() => handleRemoveNew(i)}
                                                aria-label="Ukloni novu sliku"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {canAddMore && (
                                    <button
                                        className={styles.addImageBtn}
                                        onClick={() => fileInputRef.current?.click()}
                                        aria-label="Dodaj sliku"
                                    >
                                        <ImagePlus size={22} />
                                        <span>Dodaj</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {existingImages.length === 0 && newImages.length === 0 && (
                        <button
                            className={styles.addImageEmpty}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImagePlus size={18} />
                            <span>Dodaj slike</span>
                        </button>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className={styles.hiddenInput}
                        onChange={handleFileChange}
                    />
                </div>

                <div className={styles.divider} />

                <div className={styles.footer}>
                    <button className={styles.btnCancel} onClick={onClose}>
                        Odustani
                    </button>
                    <button
                        className={styles.btnSave}
                        onClick={handleSave}
                        disabled={!hasChanges || !content.trim()}
                    >
                        Sačuvaj
                    </button>
                </div>
            </div>
        </div>
    );
}