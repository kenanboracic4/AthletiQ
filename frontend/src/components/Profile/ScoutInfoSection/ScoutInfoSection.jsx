import {
  Building2,
  Crosshair,
  Dumbbell,
  MapPin,
  Phone,
  Target,
} from "lucide-react";
import InfoItem from "../InfoItem/InfoItem";
import styles from "./ScoutInfoSection.module.css";

export default function ScoutInfoSection({ user }) {
  const regions = user.scout_regions || [];
  const hasContent =
    user.sought_position ||
    user.organization ||
    user.contact_number ||
    user.sport?.name ||
    regions.length;

  if (!hasContent) return null;

  return (
    <section className={styles.card}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Crosshair size={18} strokeWidth={2} />
          </div>
          <h2 className={styles.title}>Informacije</h2>
        </div>

        <ul className={styles.list}>
          {user.sport?.name && (
            <InfoItem
              icon={Dumbbell}
              title="Sport"
              description={user.sport.name}
              accent="#1a237e"
            />
          )}
          {user.sought_position && (
            <InfoItem
              icon={Target}
              title="Pozicije od interesa"
              description={user.sought_position}
              accent="#374151"
            />
          )}
          {user.organization && (
            <InfoItem
              icon={Building2}
              title="Organizacija"
              description={user.organization}
              accent="#374151"
            />
          )}
          {user.contact_number && (
            <InfoItem
              icon={Phone}
              title="Kontakt"
              description={user.contact_number}
              accent="#374151"
            />
          )}
        </ul>

        {regions.length > 0 && (
          <>
            <h3 className={styles.subtitle}>Regije praćenja</h3>
            <div className={styles.regions}>
              {regions.map((region, i) => (
                <span key={region.id || i} className={styles.regionPill}>
                  <MapPin size={12} strokeWidth={2.2} />
                  {region.region_name}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
