import Link from "next/link";
import { ThumbsUp, MessageCircle } from "lucide-react";
import styles from "../Profile/ActivitySection/ActivitySection.module.css";
import { resolveImageUrl, formatTimestamp } from "../../lib/utils";

export default function PostMiniCard({ post }) {
    const thumbnail = post?.images?.[0]?.image_url
        ? resolveImageUrl(post.images[0].image_url)
        : null;

    const likesCount = post?.likes_count ?? post?.likes?.length ?? 0;
    const commentsCount = post?.comments?.length ?? post?.comments_count ?? 0;
    const timestamp = formatTimestamp(post?.created_at);
    const content = post?.content?.trim() || "";

    return (
        <Link href={`/post/${post.id}`} className={styles.miniCard}>
            {thumbnail ? (
                <div className={styles.miniCardThumb}>
                    <img src={thumbnail} alt="Post slika" className={styles.miniCardImg} />
                </div>
            ) : (
                <div className={styles.miniCardNoThumb}>
                    <p className={styles.miniCardNoThumbText}>
                        {content || "—"}
                    </p>
                </div>
            )}

            <div className={styles.miniCardBody}>
                {thumbnail && (
                    <p className={styles.miniCardContent}>
                        {content || "—"}
                    </p>
                )}
                <div className={styles.miniCardMeta}>
                    <span className={styles.miniCardStat}>
                        <ThumbsUp size={12} /> {likesCount}
                    </span>
                    <span className={styles.miniCardStat}>
                        <MessageCircle size={12} /> {commentsCount}
                    </span>
                    <span className={styles.miniCardTime}>{timestamp}</span>
                </div>
            </div>
        </Link>
    );
}