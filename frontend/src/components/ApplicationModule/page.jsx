'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, FileText, Upload, Video, Send } from 'lucide-react';
import styles from './page.module.css';
import { useApplication } from '@/hooks/Application';
import { useRouter } from 'next/navigation';

export default function ApplicationModal({ ad, onClose }) {

    const router = useRouter();
    const { createApplicationFn, isLoading } = useApplication();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            cover_letter: '',
            youtube_url: '',
        },
    });

    const cvFile = watch('cv_file');
    const selectedFileName = cvFile?.[0]?.name ?? null;

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const onSubmit = (formData) => {
        const payload = new FormData();
        payload.append('advertisement_id', ad.id);
        payload.append('cover_letter', formData.cover_letter);
        payload.append('cv_file', formData.cv_file[0]);
        if (formData.youtube_url) {
            payload.append('youtube_url', formData.youtube_url);
        }

        createApplicationFn(payload, {
            onSuccess: () => {
                router.refresh();
                onClose();
                ;
            },
        });
    };

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.headerLeft}>
                        <h2>Pošalji prijavu</h2>
                        <p>{ad?.title ?? 'Oglas'}</p>
                    </div>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Zatvori">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className={styles.body}>
                        <div className={styles.field}>
                            <label className={styles.label}>
                                <FileText size={13} />
                                Propratno pismo
                                <span className={styles.required}>*</span>
                            </label>
                            <textarea
                                className={`${styles.textarea} ${errors.cover_letter ? styles.error : ''}`}
                                placeholder="Predstavi se i objasni zašto si pravi kandidat..."
                                {...register('cover_letter', {
                                    required: 'Propratno pismo je obavezno.',
                                    minLength: { value: 30, message: 'Minimalno 30 karaktera.' },
                                })}
                            />
                            {errors.cover_letter && (
                                <span className={styles.errorMsg}>{errors.cover_letter.message}</span>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>
                                <Upload size={13} />
                                CV dokument
                                <span className={styles.required}>*</span>
                            </label>
                            <label className={`${styles.fileLabel} ${errors.cv_file ? styles.error : ''}`}>
                                <span className={styles.fileText}>
                                    {selectedFileName ?? 'Odaberi PDF ili Word dokument...'}
                                </span>
                                <span className={styles.fileBrowse}>Pretraži</span>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    className={styles.fileInput}
                                    {...register('cv_file', {
                                        required: 'CV dokument je obavezan.',
                                        validate: {
                                            type: (files) => {
                                                const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                                                return allowed.includes(files[0]?.type) || 'Dozvoljeni formati: PDF, DOC, DOCX.';
                                            },
                                            size: (files) =>
                                                files[0]?.size <= 5 * 1024 * 1024 || 'Maksimalna veličina je 5MB.',
                                        },
                                    })}
                                />
                            </label>
                            {errors.cv_file && (
                                <span className={styles.errorMsg}>{errors.cv_file.message}</span>
                            )}
                        </div>

                        <div className={styles.field}>
                            <label className={styles.label}>
                                <Video size={13} />
                                YouTube video
                                <span className={styles.optionalTag}>(opciono)</span>
                            </label>
                            <input
                                type="url"
                                className={`${styles.input} ${errors.youtube_url ? styles.error : ''}`}
                                placeholder="https://youtube.com/..."
                                {...register('youtube_url', {
                                    pattern: {
                                        value: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
                                        message: 'Unesi validan YouTube link.',
                                    },
                                })}
                            />
                            {errors.youtube_url && (
                                <span className={styles.errorMsg}>{errors.youtube_url.message}</span>
                            )}
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className={styles.btnCancel} onClick={onClose}>
                            Odustani
                        </button>
                        <button type="submit" className={styles.btnSubmit} disabled={isLoading}>
                            {isLoading ? <span className={styles.spinner} /> : <Send size={14} />}
                            Pošalji prijavu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}