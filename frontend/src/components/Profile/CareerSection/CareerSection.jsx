"use client";

import ProfileTimeline from "@/components/Profile/ProfileTimeline/ProfileTimeline";
import { Briefcase } from "lucide-react";
import { sortCareerEntries } from "@/lib/profileHelpers";
import styles from "./CareerSection.module.css";

export default function CareerSection({ user }) {
  const entries = sortCareerEntries(user?.career_entries || []);

  return (
    <section className={styles.card}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Briefcase size={18} strokeWidth={2} />
          </div>
          <h2 className={styles.title}>Karijera</h2>
        </div>
        <ProfileTimeline entries={entries} />
      </div>
    </section>
  );
}
