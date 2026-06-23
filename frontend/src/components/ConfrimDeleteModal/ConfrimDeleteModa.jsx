import { useEffect, useRef } from "react";
import { Trash2, UserMinus } from "lucide-react";
import styles from "./ConfirmDeleteModal.module.css";

export default function ConfirmDeleteModal({ onConfirm, onCancel, type, nickname }) {
    const cancelRef = useRef(null);

    const isUnfollow = type === "unfollow";
    const isAdvertisement = type === "advertisement";

    useEffect(() => {
        cancelRef.current?.focus();
        const handler = (e) => { if (e.key === "Escape") onCancel(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onCancel]);

    const getTitle = () => {
        if (isUnfollow) return "Otpratiti korisnika?";
        if (isAdvertisement) return "Obrisati oglas?";
        return "Obrisati objavu?";
    };

    const getDescription = () => {
        if (isUnfollow) {
            return <>Da li zaista želiš otpratiti <strong>@{nickname}</strong>?</>;
        }
        if (isAdvertisement) {
            return "Ova radnja se ne može poništiti. Oglas će biti trajno uklonjen.";
        }
        return "Ova radnja se ne može poništiti. Objava će biti trajno uklonjena.";
    };

    return (
        <div className={styles.overlay} onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="cdm-title">
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.body}>
                    <div className={styles.iconWrap}>
                        {isUnfollow ? <UserMinus size={22} /> : <Trash2 size={22} />}
                    </div>
                    <p className={styles.title} id="cdm-title">
                        {getTitle()}
                    </p>
                    <p className={styles.desc}>
                        {getDescription()}
                    </p>
                </div>
                <div className={styles.actions}>
                    <button ref={cancelRef} className={styles.btnCancel} onClick={onCancel}>
                        Odustani
                    </button>
                    <button className={styles.btnDelete} onClick={onConfirm}>
                        {isUnfollow ? "Otprati" : "Obriši"}
                    </button>
                </div>
            </div>
        </div>
    );
}