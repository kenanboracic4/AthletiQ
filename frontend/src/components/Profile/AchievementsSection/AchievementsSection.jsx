import { Award, Medal } from "lucide-react";
import styles from "./AchievementsSection.module.css";

export default function AchievementsSection({ achievements = [] }) {
  if (!achievements.length) return null;

  return (
    <section className={styles.card}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Medal size={18} strokeWidth={2} />
          </div>
          <h2 className={styles.title}>Dostignuća</h2>
        </div>
        <ul className={styles.list}>
          {achievements.map((item, i) => (
            <li key={item.id || i} className={styles.item}>
              <div className={styles.year}>
                <Award size={16} strokeWidth={2} />
                <span>{item.year || "—"}</span>
              </div>
              <div>
                <p className={styles.itemTitle}>{item.title}</p>
                {item.description && <p className={styles.desc}>{item.description}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
