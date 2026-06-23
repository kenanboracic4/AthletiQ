import styles from "./AuthShell.module.css";

export default function AuthShell({
    children,
    eyebrow = "Sportska mreža · Bosna i Hercegovina",
    title = "Mjesto gdje se",
    titleAccent = "sport pronalazi.",
    lead = "Pridruži se sportistima, klubovima, trenerima i skautima. Objave, berza oglasa i poruke — sve na jednom mjestu.",
    stats = ["Feed", "Berza oglasa", "Poruke", "Profili"],
}) {
    return (
        <div className={styles.page}>
            <div className={styles.bg} aria-hidden />
            <div className={styles.overlay} aria-hidden />
            <div className={styles.pattern} aria-hidden />

            <div className={styles.inner}>
                <aside className={styles.brand}>
                    <p className={styles.eyebrow}>
                        <span className={styles.eyebrowDot} aria-hidden />
                        {eyebrow}
                    </p>
                    <h1 className={styles.title}>
                        {title}
                        <br />
                        <span className={styles.titleAccent}>{titleAccent}</span>
                    </h1>
                    <p className={styles.lead}>{lead}</p>
                    <div className={styles.stats}>
                        {stats.map((item) => (
                            <span key={item} className={styles.stat}>
                                {item}
                            </span>
                        ))}
                    </div>
                </aside>

                <div className={styles.formSide}>
                    <div className={styles.card}>
                        <div className={styles.mobileBrand}>
                            <div className={styles.mobileLogo}>AthletiQ</div>
                            <p className={styles.mobileTag}>{eyebrow}</p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
