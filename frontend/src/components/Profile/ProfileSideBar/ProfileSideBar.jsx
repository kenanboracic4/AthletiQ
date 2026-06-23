import SuggestedPeople from "@/components/SuggestedPeople/SuggestedPeople";
import SuggestedClubs from "@/components/SuggestedClubs/SuggestedClubs";
import styles from "./ProfileSidebar.module.css";

export default function ProfileSidebar() {
    return (
        <aside className={styles.sidebar}>
            <SuggestedPeople />
            <SuggestedClubs />
        </aside>
    );
}