import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import Navbar from "@/components/NavBar/NavBar";
import UserProfileCard from "@/components/UserProfileCard/UserProfileCard";
import ProfileSections from "@/components/Profile/ProfileSections/ProfileSections";
import LockedProfileNotice from "@/components/Profile/LockedProfileNotice/LockedProfileNotice";
import ProfileSidebar from "@/components/Profile/ProfileSideBar/ProfileSideBar";

import { getUserByNicknameServer } from "@/api/server";
import styles from "./page.module.css";

export default async function UserProfilePage({ params }) {
  const { nickname } = await params;

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    redirect("/login");
  }

  let user;
  try {
    user = await getUserByNicknameServer(nickname);
  } catch (e) {
    console.error("Greška pri dohvatu profila:", e.response?.data || e.message);
    redirect("/login");
  }

  if (!user) {
    redirect("/login");
  }

  const isLocked =
    user.is_private && !["self", "friends"].includes(user.friendship_status);

  return (
    <>
      <Navbar />
      <main className={styles.page}>
        <div className={styles.layout}>
          <div className={styles.main}>
            <UserProfileCard user={user} />

            {isLocked ? (
              <LockedProfileNotice />
            ) : (
              <ProfileSections user={user} nickname={nickname} />
            )}
          </div>

          <ProfileSidebar />
        </div>
      </main>
    </>
  );
}
