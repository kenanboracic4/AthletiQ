'use client'
import { ArrowLeft, ExternalLink } from "lucide-react";
import styles from "./ChatHeader.module.css";
import { getAvatarUrl } from "@/lib/chatHelpers";
import Link from 'next/link';

export default function ChatHeader({ otherUser, isConnected, advertismentId, advertismentTitle, onBack, showBackButton = false }) {
    const name = otherUser?.nickname ?? "Nepoznat korisnik";

    return (
        <header className={styles.header}>
            {showBackButton && (
                <button type="button" className={styles.backBtn} onClick={onBack} aria-label="Nazad na listu">
                    <ArrowLeft size={20} />
                </button>
            )}

            <Link
                href={otherUser?.nickname ? `/profile/${otherUser.nickname}` : "/feed"}
                className={styles.userLink}
            >
                <div className={styles.avatarWrap}>
                    <img src={getAvatarUrl(otherUser)} alt={name} className={styles.avatar} />
                    {isConnected && <span className={styles.onlineDot} aria-hidden="true" />}
                </div>
                <div className={styles.info}>
                    <div className={styles.name}>{name}</div>
                    <div className={styles.status}>{isConnected ? "Online" : "Offline"}</div>
                </div>
            </Link>

            {advertismentId && (
                <Link href={`/market-place/advertisment/${advertismentId}`} className={styles.adLink}>
                    <ExternalLink size={14} />
                    <span className={styles.adLinkText}>{advertismentTitle ?? "Oglas"}</span>
                </Link>
            )}
        </header>
    );
}
