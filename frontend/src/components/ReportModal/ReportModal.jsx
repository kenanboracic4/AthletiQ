"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createReport } from "@/api/reports";
import styles from "./ReportModal.module.css";

const REASONS = [
    "Neprimjeren sadržaj",
    "Spam",
    "Lažne informacije",
    "Uvrede ili mržnja",
    "Prevara",
    "Ostalo",
];

export default function ReportModal({ targetType, postId, advertisementId, onClose }) {
    const [reason, setReason] = useState(REASONS[0]);
    const [description, setDescription] = useState("");

    const mutation = useMutation({
        mutationFn: createReport,
        onSuccess: () => {
            toast.success("Prijava uspješno poslana");
            onClose();
        },
        onError: (error) => {
            const detail = error?.response?.data?.detail;
            toast.error(detail || "Greška prilikom prijave");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({
            target_type: targetType,
            post_id: postId || null,
            advertisement_id: advertisementId || null,
            reason,
            description: description.trim() || null,
        });
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Prijavi sadržaj</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Razlog prijave</label>
                        <select
                            className={styles.select}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        >
                            {REASONS.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Dodatni opis (opcionalno)</label>
                        <textarea
                            className={styles.textarea}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Opišite problem..."
                            maxLength={1000}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>
                            Odustani
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={mutation.isPending}>
                            {mutation.isPending ? "Slanje..." : "Pošalji prijavu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
