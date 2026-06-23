import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "../Profile/ActivitySection/ActivitySection.module.css";
import PostMiniCard from "../PostMiniCard/PostMiniCard";

export default function PostsCarousel({ posts, page, totalPages, onPrev, onNext, onDotClick }) {
    return (
        <>
            <div className={styles.carousel}>
                <button
                    className={styles.arrowBtn}
                    onClick={onPrev}
                    disabled={page === 0}
                    aria-label="Prethodna stranica"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className={styles.carouselTrack}>
                    {posts.map((post) => (
                        <PostMiniCard key={post.id} post={post} />
                    ))}
                </div>

                <button
                    className={styles.arrowBtn}
                    onClick={onNext}
                    disabled={page >= totalPages - 1}
                    aria-label="Sljedeća stranica"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {totalPages > 1 && (
                <div className={styles.paginationDots}>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            className={`${styles.dot} ${i === page ? styles.dotActive : ""}`}
                            onClick={() => onDotClick(i)}
                            aria-label={`Stranica ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </>
    );
}