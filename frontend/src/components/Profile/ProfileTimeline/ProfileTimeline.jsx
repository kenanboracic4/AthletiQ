import { Briefcase } from "lucide-react";
import { formatPeriod } from "@/lib/profileHelpers";
import styles from "./ProfileTimeline.module.css";

export default function ProfileTimeline({ entries = [], emptyText = "Karijera još nije dodana." }) {
  if (!entries.length) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <Briefcase size={22} strokeWidth={1.8} />
        </div>
        <p className={styles.emptyText}>{emptyText}</p>
      </div>
    );
  }

  return (
    <ol className={styles.timeline}>
      {entries.map((entry, index) => (
        <li key={entry.id || index} className={styles.item}>
          <div className={styles.marker}>
            <span className={styles.dot} />
            {index < entries.length - 1 && <span className={styles.line} />}
          </div>
          <div className={styles.content}>
            <div className={styles.topRow}>
              <h3 className={styles.role}>{entry.role_title}</h3>
              <span className={styles.period}>
                {formatPeriod(entry.start_date, entry.end_date, entry.is_current)}
              </span>
            </div>
            <p className={styles.org}>{entry.organization}</p>
            {entry.location && <p className={styles.meta}>{entry.location}</p>}
            {entry.description && <p className={styles.desc}>{entry.description}</p>}
            {entry.is_current && <span className={styles.badge}>Trenutno</span>}
          </div>
        </li>
      ))}
    </ol>
  );
}
