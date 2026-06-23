import {
  Calendar,
  Dumbbell,
  MapPin,
  Ruler,
  Target,
  User,
  Weight,
  Footprints,
  Trophy,
  Flag,
} from "lucide-react";
import { calcAge } from "@/lib/profileHelpers";
import styles from "./AthleteInfoSection.module.css";

const ICONS = {
  Sport: Dumbbell,
  Pozicija: Target,
  Visina: Ruler,
  Težina: Weight,
  "Dominantna strana": Footprints,
  Godine: Calendar,
  Iskustvo: Trophy,
  "Trenutni klub": Trophy,
  "Željena liga": Flag,
  Državljanstvo: Flag,
  Lokacija: MapPin,
};

export default function AthleteInfoSection({ user }) {
  const age = calcAge(user.birth_date);
  const stats = [
    user.sport?.name && { label: "Sport", value: user.sport.name },
    user.position?.name && { label: "Pozicija", value: user.position.name },
    user.height && { label: "Visina", value: `${user.height} cm` },
    user.weight && { label: "Težina", value: `${user.weight} kg` },
    user.dominant_side && { label: "Dominantna strana", value: user.dominant_side },
    age && { label: "Godine", value: `${age}` },
    user.experience_level && { label: "Iskustvo", value: user.experience_level },
    user.current_club && { label: "Trenutni klub", value: user.current_club },
    user.preferred_league && { label: "Željena liga", value: user.preferred_league },
    user.citizenship && { label: "Državljanstvo", value: user.citizenship },
    user.location && { label: "Lokacija", value: user.location },
  ].filter(Boolean);

  if (!stats.length) return null;

  const HeaderIcon = User;

  return (
    <section className={styles.card}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <HeaderIcon size={18} strokeWidth={2} />
          </div>
          <h2 className={styles.title}>Sportski profil</h2>
        </div>
        <div className={styles.grid}>
          {stats.map((item) => {
            const Icon = ICONS[item.label] || User;
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
      </div>
    </section>
  );
}
