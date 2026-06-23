"use client";

import { useState } from "react";
import { SendHorizonal } from "lucide-react";
import styles from "./MessageInput.module.css";

export default function MessageInput({ onSend }) {
    const [text, setText] = useState("");

    const handleSend = () => {
        const trimmed = text.trim();
        if (!trimmed) return;
        onSend(trimmed);
        setText("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={styles.inputArea}>
            <div className={styles.wrapper}>
                <input
                    type="text"
                    placeholder="Napiši poruku..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            <button
                type="button"
                className={styles.sendBtn}
                onClick={handleSend}
                disabled={!text.trim()}
                aria-label="Pošalji poruku"
            >
                <SendHorizonal size={18} />
            </button>
        </div>
    );
}
