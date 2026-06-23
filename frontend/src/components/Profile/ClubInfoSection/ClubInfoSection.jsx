import {
  Calendar,
  Landmark,
  MapPin,
  Shield,
  Trophy,
} from "lucide-react";
import styles from "./ClubInfoSection.module.css";

const DETAIL_ICONS = {
  Liga: Shield,
  Sport: Trophy,
  Osnovan: Calendar,
  "Domaći teren": Landmark,
  Lokacija: MapPin,
};

export default function ClubInfoSection({ user }) {
  const details = [
    user.league && { label: "Liga", value: user.league },
    user.sport?.name && { label: "Sport", value: user.sport.name },
    user.founded_year && { label: "Osnovan", value: user.founded_year },
    user.home_venue && { label: "Domaći teren", value: user.home_venue },
    user.location && { label: "Lokacija", value: user.location },
  ].filter(Boolean);

  const trophies = user.trophies || [];
  const hasContent = details.length > 0 || trophies.length > 0;
  if (!hasContent) return null;

  return (
    <section className={styles.card}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Shield size={18} strokeWidth={2} />
          </div>
          <h2 className={styles.title}>Klub i takmičenje</h2>
        </div>

        {details.length > 0 && (
          <div className={styles.grid}>
            {details.map((item) => {
              const Icon = DETAIL_ICONS[item.label] || Shield;
              return (
                <div key={item.label} className={styles.stat}>
                  <div className={styles.statIcon}>
                    <Icon size={16} strokeWidth={2} />
                  </div>
                  <span className={styles.statLabel}>{item.label}</span>
                  <span className={styles.statValue}>{item.value}</span>
                </div>
              );
            })}
          </div>
        )}

        {trophies.length > 0 && (
          <>
            <h3 className={styles.subtitle}>Osvojeni trofeji</h3>
            <ul className={styles.trophyList}>
              {trophies.map((trophy, i) => (
                <li key={trophy.id || i} className={styles.trophyItem}>
                  <div className={styles.trophyIcon}>
                    <Trophy size={18} strokeWidth={2} />
                  </div>
                  <div>
                    <p className={styles.trophyTitle}>{trophy.title}</p>
                    <p className={styles.trophyMeta}>
                      {[trophy.competition, trophy.year].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
