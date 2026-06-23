'use client';
import { useState, useRef, useEffect } from 'react';
import { ImagePlus, Type, X, Send, Trash2, FileText, ChevronDown } from 'lucide-react';
import styles from './CreatePost.module.css';
import { toast } from 'react-hot-toast';
import { useCreatePost } from '@/hooks/useCreatePost';
import {
    POST_VISIBILITY,
    POST_VISIBILITY_OPTIONS,
    getVisibilityOption,
} from '@/lib/postVisibility';

export default function CreatePost({ user }) {
    const [isOpen, setIsOpen] = useState(false);
    const [text, setText] = useState('');
    const [images, setImages] = useState([]);
    const [activeTab, setActiveTab] = useState('text');
    const [visibility, setVisibility] = useState(POST_VISIBILITY.PUBLIC);
    const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
    const fileInputRef = useRef(null);
    const visibilityRef = useRef(null);

    const closeModal = () => {
        setIsOpen(false);
        setText('');
        setImages([]);
        setActiveTab('text');
        setVisibility(POST_VISIBILITY.PUBLIC);
        setShowVisibilityMenu(false);
    };

    const { createPost, isPending } = useCreatePost({ onSuccess: closeModal });

    const openModal = () => setIsOpen(true);

    useEffect(() => {
        if (!showVisibilityMenu) return;

        const handleClickOutside = (event) => {
            if (visibilityRef.current && !visibilityRef.current.contains(event.target)) {
                setShowVisibilityMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showVisibilityMenu]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 3) {
            toast.error("Maksimalan broj slika je 3!");
            return;
        }
        const previews = files.map(file => ({
            file,
            url: URL.createObjectURL(file),
            name: file.name,
        }));
        setImages(prev => [...prev, ...previews]);
        setActiveTab('image');
    };

    const removeImage = (index) => {
        setImages(prev => {
            const updated = [...prev];
            URL.revokeObjectURL(updated[index].url);
            updated.splice(index, 1);
            return updated;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (text.trim() === '' && images.length === 0) {
            toast.error('Molimo unesite sadržaj objave i slike.');
            return;
        }

        const formData = new FormData();
        formData.append('content', text);
        formData.append('visibility', visibility);
        images.forEach(image => formData.append('images', image.file));
        createPost(formData);
    };

    const selectedVisibility = getVisibilityOption(visibility);
    const VisibilityIcon = selectedVisibility.icon;

    return (
        <>
            <div className={styles.triggerBar} onClick={openModal}>
                <div className={styles.avatar}>
                    <img src={user?.image ?? "/no-profile-picture.png"} alt={user?.nickname} className={styles.avatarImg} />
                </div>
                <div className={styles.triggerInput}>
                    <span>Napiši nešto...</span>
                </div>
            </div>

            {isOpen && (
                <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className={styles.modal}>

                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Kreiraj objavu</h2>
                            <button className={styles.closeBtn} onClick={closeModal} aria-label="Zatvori">
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.author}>
                            <div className={styles.avatarLg}>
                                <img src={user?.image ?? "/no-profile-picture.png"} alt={user?.nickname} className={styles.avatarImg} />
                            </div>
                            <div>
                                <p className={styles.authorName}>{user?.nickname || 'Korisnik'}</p>
                                <div className={styles.visibilityWrap} ref={visibilityRef}>
                                    <button
                                        type="button"
                                        className={styles.visibilityBtn}
                                        onClick={() => setShowVisibilityMenu((prev) => !prev)}
                                        aria-expanded={showVisibilityMenu}
                                        aria-haspopup="listbox"
                                    >
                                        <VisibilityIcon size={12} />
                                        <span>{selectedVisibility.label}</span>
                                        <ChevronDown size={12} className={showVisibilityMenu ? styles.chevronOpen : ''} />
                                    </button>

                                    {showVisibilityMenu && (
                                        <div className={styles.visibilityMenu} role="listbox">
                                            {POST_VISIBILITY_OPTIONS.map((option) => {
                                                const OptionIcon = option.icon;
                                                const isActive = option.value === visibility;

                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        role="option"
                                                        aria-selected={isActive}
                                                        className={`${styles.visibilityOption} ${isActive ? styles.visibilityOptionActive : ''}`}
                                                        onClick={() => {
                                                            setVisibility(option.value);
                                                            setShowVisibilityMenu(false);
                                                        }}
                                                    >
                                                        <span className={styles.visibilityOptionIcon}>
                                                            <OptionIcon size={16} />
                                                        </span>
                                                        <span className={styles.visibilityOptionText}>
                                                            <span className={styles.visibilityOptionLabel}>{option.label}</span>
                                                            <span className={styles.visibilityOptionHint}>{option.hint}</span>
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.tabs}>
                            <button
                                className={`${styles.tab} ${activeTab === 'text' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('text')}
                            >
                                <Type size={16} />
                                Tekst
                            </button>
                            <button
                                className={`${styles.tab} ${activeTab === 'image' ? styles.tabActive : ''}`}
                                onClick={() => setActiveTab('image')}
                            >
                                <ImagePlus size={16} />
                                Slike {images.length > 0 && <span className={styles.badge}>{images.length}</span>}
                            </button>
                        </div>

                        <div className={styles.content}>
                            {activeTab === 'text' && (
                                <textarea
                                    className={styles.textarea}
                                    placeholder={`Šta misliš, ${user?.nickname || 'korisniče'}?`}
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows={6}
                                    autoFocus
                                />
                            )}

                            {activeTab === 'image' && (
                                <div className={styles.imageSection}>
                                    {images.length === 0 ? (
                                        <div
                                            className={styles.dropzone}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <ImagePlus size={36} strokeWidth={1.5} className={styles.dropzoneIcon} />
                                            <p className={styles.dropzoneText}>Klikni da dodaš slike</p>
                                            <p className={styles.dropzoneSub}>PNG, JPG, WEBP — do 10MB po slici</p>
                                        </div>
                                    ) : (
                                        <div className={styles.previewGrid}>
                                            {images.map((img, i) => (
                                                <div key={i} className={styles.previewItem}>
                                                    <img src={img.url} alt={img.name} className={styles.previewImg} />
                                                    <button
                                                        className={styles.removeImg}
                                                        onClick={() => removeImage(i)}
                                                        aria-label="Ukloni sliku"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <p className={styles.imgName}>{img.name}</p>
                                                </div>
                                            ))}
                                            {images.length < 3 && (
                                                <>
                                                    <div
                                                        className={styles.addMoreBtn}
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >

                                                        <ImagePlus size={24} strokeWidth={1.5} />
                                                        <span>Dodaj još</span>

                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className={styles.hiddenInput}
                                        onChange={handleImageChange}
                                    />
                                </div>
                            )}
                        </div>

                        {activeTab === 'image' && text.length > 0 && (
                            <div className={styles.textPreviewChip}>
                                <FileText size={14} />
                                <span>{text.slice(0, 60)}{text.length > 60 ? '…' : ''}</span>
                            </div>
                        )}

                        <div className={styles.divider} />

                        <div className={styles.footer}>
                            <div className={styles.footerActions}>
                                <button
                                    className={styles.iconBtn}
                                    title="Dodaj tekst"
                                    onClick={() => setActiveTab('text')}
                                >
                                    <Type size={18} />
                                </button>
                                <button
                                    className={styles.iconBtn}
                                    title="Dodaj slike"
                                    onClick={() => setActiveTab('image')}
                                >
                                    <ImagePlus size={18} />
                                </button>
                            </div>
                            <button
                                className={styles.submitBtn}
                                onClick={handleSubmit}
                                disabled={(!text.trim() && images.length === 0) || isPending}
                            >
                                <Send size={16} />
                                {isPending ? 'Objavljivanje...' : 'Objavi'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
