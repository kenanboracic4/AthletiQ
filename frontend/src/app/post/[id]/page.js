import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Navbar from "@/components/NavBar/NavBar";
import SideNav from "@/components/SideNav/SideNav";
import SuggestedPeople from "@/components/SuggestedPeople/SuggestedPeople";
import PostCardWrapper from "./PostPageClient";
import { getPostByIdServer } from "@/api/server";
import layout from "@/styles/pageLayout.module.css";
import styles from "./page.module.css";

export default async function PostPage({ params }) {
    const { id } = await params;

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) redirect("/login");

    let post;
    try {
        post = await getPostByIdServer(id);
    } catch (e) {
        console.error("Greška pri dohvatu objave:", e);
        notFound();
    }

    if (!post) notFound();

    return (
        <main>
            <Navbar />
            <div className={layout.mainContainer}>
                <aside className={layout.leftColumn}>
                    <SideNav />
                </aside>

                <section className={layout.centerColumn}>
                    <Link href={`/profile/${post.user?.nickname}`} className={styles.backBtn}>
                        <ArrowLeft size={18} />
                        Nazad na profil
                    </Link>
                    <PostCardWrapper post={post} />
                </section>

                <aside className={layout.rightColumn}>
                    <SuggestedPeople />
                </aside>
            </div>
        </main>
    );
}