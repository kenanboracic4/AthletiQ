"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import styles from "./AppFooter.module.css";

const HIDDEN_ON = ["/login", "/register"];

export default function AppFooter() {
    const { user } = useAuth();
    const pathname = usePathname();

    if (HIDDEN_ON.includes(pathname)) {
        return null;
    }

    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <Link href={user ? "/feed" : "/"} className={styles.brand}>
                    AthletiQ
                </Link>

                <nav className={styles.nav} aria-label="Footer navigacija">
                    {user ? (
                        <>
                            <Link href="/feed">Početna</Link>
                            <Link href="/market-place">Berza</Link>
                            <Link href="/chat">Poruke</Link>
                            <Link href={`/profile/${user.nickname}`}>Profil</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/">Početna</Link>
                            <Link href="/login">Prijava</Link>
                            <Link href="/register">Registracija</Link>
                        </>
                    )}
                </nav>

                <p className={styles.copy}>© {new Date().getFullYear()} AthletiQ</p>
            </div>
        </footer>
    );
}
