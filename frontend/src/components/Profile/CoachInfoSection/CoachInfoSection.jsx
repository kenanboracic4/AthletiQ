import {
  Award,
  Briefcase,
  Dumbbell,
  Phone,
} from "lucide-react";
import InfoItem from "../InfoItem/InfoItem";
import styles from "./CoachInfoSection.module.css";

export default function CoachInfoSection({ user }) {
  const certs = user.certifications || [];
  const hasContent =
    user.experience || user.contact_number || user.sport?.name || certs.length;

  if (!hasContent) return null;

  return (
    <section className={styles.card}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Briefcase size={18} strokeWidth={2} />
          </div>
          <h2 className={styles.title}>Iskustvo i stručnost</h2>
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
          {user.experience && (
            <InfoItem
              icon={Briefcase}
              title="Trenersko iskustvo"
              description={user.experience}
              accent="#b45309"
            />
          )}
          {user.contact_number && (
            <InfoItem
              icon={Phone}
              title="Kontakt telefon"
              description={user.contact_number}
              accent="#374151"
            />
          )}
        </ul>

        {certs.length > 0 && (
          <>
            <h3 className={styles.subtitle}>Certifikati i licence</h3>
            <ul className={styles.certList}>
              {certs.map((cert, i) => (
                <li key={cert.id || i} className={styles.certItem}>
                  <div className={styles.certIcon}>
                    <Award size={17} strokeWidth={2} />
                  </div>
                  <div>
                    <p className={styles.certTitle}>{cert.title}</p>
                    <p className={styles.certMeta}>
                      {[cert.issuer, cert.year].filter(Boolean).join(" · ")}
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
