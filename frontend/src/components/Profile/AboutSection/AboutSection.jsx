import { FileText } from "lucide-react";
import { getProfileBio } from "@/lib/profileHelpers";
import styles from "./AboutSection.module.css";

function getAboutTitle(role) {
  switch (role) {
    case "COACH":
      return "Filozofija i opis";
    case "CLUB":
      return "O klubu";
    case "SCOUT":
      return "Fokus skauta";
    default:
      return "Opis";
  }
}

export default function AboutSection({ user }) {
  const text = getProfileBio(user) || (
    user.role === "COACH"
      ? user.philosophy
      : user.role === "SCOUT" && user.sought_position
        ? `Fokus: ${user.sought_position}`
        : null
  );

  if (!text) return null;

  return (
    <section className={styles.card}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <FileText size={18} strokeWidth={2} />
          </div>
          <h2 className={styles.title}>{getAboutTitle(user.role)}</h2>
        </div>
        <p className={styles.text}>{text}</p>
      </div>
    </section>
  );
}
