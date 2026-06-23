import { Lock } from "lucide-react";
import styles from "./LockedProfileNotice.module.css";

export default function LockedProfileNotice() {
  return (
    <div className={styles.notice}>
      <div className={styles.iconWrap}>
        <Lock size={28} strokeWidth={2} />
      </div>
      <h2 className={styles.title}>Ovaj profil je privatan</h2>
      <p className={styles.text}>
        Pošalji zahtjev za prijateljstvo da vidiš objave i detalje ovog korisnika.
      </p>
    </div>
  );
}
