"use client";

import { useState } from "react";
import { PencilLine } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AboutSection from "@/components/Profile/AboutSection/AboutSection";
import ActivitySection from "@/components/Profile/ActivitySection/ActivitySection";
import CareerSection from "@/components/Profile/CareerSection/CareerSection";
import CoachInfoSection from "@/components/Profile/CoachInfoSection/CoachInfoSection";
import ScoutInfoSection from "@/components/Profile/ScoutInfoSection/ScoutInfoSection";
import AthleteInfoSection from "@/components/Profile/AthleteInfoSection/AthleteInfoSection";
import ClubInfoSection from "@/components/Profile/ClubInfoSection/ClubInfoSection";
import AchievementsSection from "@/components/Profile/AchievementsSection/AchievementsSection";
import ProfileExtendedEditor from "@/components/Profile/ProfileExtendedEditor/ProfileExtendedEditor";
import styles from "./ProfileSections.module.css";

const ROLES_WITH_CAREER = ["ATHLETE", "COACH", "RECREATIONAL_ATHLETE"];
const ROLES_WITH_EXTENDED = ["ATHLETE", "COACH", "CLUB", "SCOUT", "RECREATIONAL_ATHLETE"];

export default function ProfileSections({ user, nickname }) {
  const { user: loggedInUser } = useAuth();
  const [showExtendedEditor, setShowExtendedEditor] = useState(false);
  const isOwnProfile = loggedInUser?.nickname === nickname;

  return (
    <>
      <AboutSection user={user} />

      {user.role === "ATHLETE" && <AthleteInfoSection user={user} />}
      {user.role === "CLUB" && <ClubInfoSection user={user} />}

      {ROLES_WITH_CAREER.includes(user.role) && (
        <CareerSection user={user} />
      )}

      {user.role === "ATHLETE" && (
        <AchievementsSection achievements={user.achievements} />
      )}

      {user.role === "COACH" && <CoachInfoSection user={user} />}
      {user.role === "SCOUT" && <ScoutInfoSection user={user} />}

      <ActivitySection nickname={nickname} />

      {isOwnProfile && ROLES_WITH_EXTENDED.includes(user.role) && (
        <button
          type="button"
          className={styles.editDetailsBtn}
          onClick={() => setShowExtendedEditor(true)}
        >
          <PencilLine size={18} strokeWidth={2.2} />
          Uredi detalje profila
        </button>
      )}

      {showExtendedEditor && (
        <ProfileExtendedEditor
          user={user}
          onClose={() => setShowExtendedEditor(false)}
        />
      )}
    </>
  );
}
