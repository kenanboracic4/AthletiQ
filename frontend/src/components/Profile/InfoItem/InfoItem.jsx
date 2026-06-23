import styles from "./InfoItem.module.css";

export default function InfoItem({ icon: Icon, title, description, accent = "#1a237e" }) {
  return (
    <li className={styles.item}>
      <div
        className={styles.iconWrap}
        style={{ color: accent, backgroundColor: `${accent}14` }}
      >
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className={styles.info}>
        <div className={styles.title}>{title}</div>
        <p className={styles.desc}>{description}</p>
      </div>
    </li>
  );
}
