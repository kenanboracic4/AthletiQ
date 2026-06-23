"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  Users,
  Megaphone,
  MessagesSquare,
  Sparkles,
  Trophy,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Reveal from "@/components/Landing/Reveal";
import Parallax from "@/components/Landing/Parallax";
import Counter from "@/components/Landing/Counter";
import styles from "./page.module.css";

const TICKER = [
  "Sportista",
  "Trener",
  "Klub",
  "Skaut",
  "Rekreativac",
  "Objave",
  "Berza oglasa",
  "AI preporuke",
  "Poruke",
  "Mreža",
];

const STATS = [
  { to: 5, suffix: "", label: "uloga prilagođenih sportu" },
  { to: 4, suffix: "", label: "alata na jednom mjestu" },
  { to: 0, suffix: " KM", label: "članarina, zauvijek" },
  { to: 100, suffix: "%", label: "fokus na lokalni sport" },
];

const FEATURES = [
  {
    tag: "01",
    icon: Users,
    title: "Zid objava",
    text: "Objave, komentari i reakcije — društvena mreža samo za sport. Prati klubove, trenere i igrače iz svog grada.",
    image: "/landing/feature-community.jpg",
    caption: "Zajednica na terenu i online",
  },
  {
    tag: "02",
    icon: Megaphone,
    title: "Berza oglasa + AI matching",
    text: "Klub traži golmana, sportista traži probni trening, skaut traži talent. AI poredi tvoj profil i pokazuje koliko ti svaki oglas odgovara.",
    image: "/landing/feature-marketplace.jpg",
    caption: "Oglasi prilagođeni tvojoj ulozi",
  },
  {
    tag: "03",
    icon: MessagesSquare,
    title: "Mreža i poruke",
    text: "Poveži se sa ljudima, piši direktno, popuni profil sa sportom i lokacijom. Sve na jednom mjestu.",
    image: "/landing/how-network.jpg",
    caption: "Dogovor bez posrednika",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Napravi profil",
    text: "Registracija traje par minuta. Izaberi ulogu i reci nam koji sport igraš i gdje.",
    image: "/landing/how-register.jpg",
  },
  {
    num: "02",
    title: "Prati i objavi",
    text: "Uđi na početnu, prati klubove i ljude iz svoje discipline. Dijeli trenutke sa terena.",
    image: "/landing/how-network.jpg",
  },
  {
    num: "03",
    title: "Pronađi priliku",
    text: "Berza ti AI-preporukama pokazuje prilike koje ti najviše odgovaraju.",
    image: "/landing/how-ads.jpg",
  },
  {
    num: "04",
    title: "Dogovori se",
    text: "Prijavi se na oglas ili pošalji poruku. Ostatak je na terenu, ne u inboxu.",
    image: "/landing/how-connect.jpg",
  },
];

const ROLES = [
  {
    title: "Sportista",
    text: "Traži klub, trenera ili priliku da napreduješ.",
    image: "/landing/role-athlete.jpg",
  },
  {
    title: "Trener",
    text: "Traži igrače, objavi oglase i gradi reputaciju.",
    image: "/landing/role-coach.jpg",
  },
  {
    title: "Klub",
    text: "Kompletiraj ekipu i predstavi se zajednici.",
    image: "/landing/role-club.jpg",
  },
  {
    title: "Skaut i rekreativac",
    text: "Otkrivaj talente ili pronađi tim za društveni sport.",
    image: "/landing/role-scout.jpg",
  },
];

function BrandMark() {
  return <span className={styles.wordmark}>AthletiQ</span>;
}

function AuthActions({ className = "" }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className={`${styles.authSlot} ${className}`} />;
  }

  if (user) {
    return (
      <div className={`${styles.authSlot} ${className}`}>
        <span className={styles.greeting}>
          Zdravo, {user.nickname || user.username}
        </span>
        <Link href="/feed" className={styles.btnSolid}>
          Na početnu
          <ArrowRight size={16} className={styles.btnArrow} />
        </Link>
      </div>
    );
  }

  return (
    <div className={`${styles.authSlot} ${className}`}>
      <Link href="/login" className={styles.btnOutline}>
        Prijava
      </Link>
      <Link href="/register" className={styles.btnSolid}>
        Registracija
      </Link>
    </div>
  );
}

function Ticker() {
  const items = [...TICKER, ...TICKER];
  return (
    <div className={styles.tickerWrap} aria-hidden>
      <div className={styles.tickerTrack}>
        {items.map((item, i) => (
          <span key={`${item}-${i}`} className={styles.tickerItem}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function TiltCard({ children, className = "" }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) translateY(-6px)`;
  };

  const reset = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  return (
    <div ref={ref} className={className} onMouseMove={onMove} onMouseLeave={reset}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY;
      setScrolled(top > 8);
      const docH =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docH > 0 ? Math.min(top / docH, 1) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const loggedInActions = (
    <div className={styles.heroActions}>
      <Link href="/feed" className={styles.btnSolid}>
        Otvori početnu
        <ArrowRight size={16} className={styles.btnArrow} />
      </Link>
      <Link href="/market-place" className={styles.btnGhost}>
        Berza oglasa
      </Link>
    </div>
  );

  const guestActions = (
    <div className={styles.heroActions}>
      <Link href="/register" className={styles.btnSolid}>
        Napravi profil
        <ArrowRight size={16} className={styles.btnArrow} />
      </Link>
      <Link href="/login" className={styles.btnGhost}>
        Prijavi se
      </Link>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.scrollBar} style={{ transform: `scaleX(${progress})` }} aria-hidden />
      <div className={styles.grain} aria-hidden />

      <header className={`${styles.header} ${scrolled ? styles.headerSolid : ""}`}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brandLink}>
            <BrandMark />
          </Link>

          <nav className={styles.nav}>
            <a href="#o-nama" className={styles.navLink}>O nama</a>
            <a href="#platforma" className={styles.navLink}>Platforma</a>
            <a href="#kako" className={styles.navLink}>Kako radi</a>
            <a href="#uloge" className={styles.navLink}>Uloge</a>
          </nav>

          <AuthActions className={styles.headerAuth} />
        </div>
      </header>

      <main>

        <section className={styles.hero}>
          <div className={styles.heroBgWrap} aria-hidden>
            <Parallax speed={140} className={styles.heroBgParallax}>
              <Image
                src="/landing/hero.jpg"
                alt=""
                fill
                priority
                sizes="100vw"
                className={styles.heroBgImg}
              />
            </Parallax>
            <div className={styles.heroOverlay} />
            <div className={styles.heroGlowA} />
            <div className={styles.heroGlowB} />
          </div>

          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={`${styles.heroKicker} ${styles.fadeUp}`} style={{ animationDelay: "0.05s" }}>
                <Sparkles size={14} />
                Sportska mreža · Bosna i Hercegovina
              </p>
              <h1 className={`${styles.heroTitle} ${styles.fadeUp}`} style={{ animationDelay: "0.18s" }}>
                Gdje se sport <span className={styles.gradText}>stvarno</span>
                <br />
                pronalazi.
              </h1>
              <p className={`${styles.heroLead} ${styles.fadeUp}`} style={{ animationDelay: "0.32s" }}>
                Objave, berza oglasa sa AI preporukama, poruke i profili
                prilagođeni stvarnom životu na terenu — za sportiste, klubove,
                trenere i skaute.
              </p>
              <div className={styles.fadeUp} style={{ animationDelay: "0.46s" }}>
                {user ? loggedInActions : guestActions}
              </div>
            </div>

            <div className={styles.heroFloaters} aria-hidden>
              <Parallax speed={-60} className={`${styles.chip} ${styles.chipA}`}>
                <Trophy size={16} />
                <div>
                  <strong>Berza oglasa</strong>
                  <span>Prilike za tvoju ulogu</span>
                </div>
              </Parallax>
              <Parallax speed={90} className={`${styles.chip} ${styles.chipB}`}>
                <Sparkles size={16} />
                <div>
                  <strong>97% poklapanje</strong>
                  <span>AI matching</span>
                </div>
              </Parallax>
              <Parallax speed={40} className={`${styles.chip} ${styles.chipC}`}>
                <MapPin size={16} />
                <div>
                  <strong>Lokalno</strong>
                  <span>Klubovi iz tvog grada</span>
                </div>
              </Parallax>
            </div>
          </div>

          <a href="#o-nama" className={styles.scrollCue} aria-label="Skroluj dalje">
            <span>Skroluj</span>
            <ArrowDown size={16} />
          </a>
        </section>

        <Ticker />

        <section className={styles.stats}>
          <div className={styles.statsInner}>
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 90} direction="up" className={styles.statCell}>
                <span className={styles.statNum}>
                  <Counter to={s.to} suffix={s.suffix} />
                </span>
                <span className={styles.statLabel}>{s.label}</span>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="o-nama" className={styles.about}>
          <Reveal direction="left" className={styles.aboutPhotos}>
            <Parallax speed={-40} className={styles.aboutMainWrap}>
              <div className={`${styles.imageFrame} ${styles.imageHover}`}>
                <Image
                  src="/landing/about-team.jpg"
                  alt="Tim na terenu"
                  width={900}
                  height={650}
                  className={styles.photo}
                />
              </div>
            </Parallax>
            <Parallax speed={70} className={styles.aboutSideWrap}>
              <div className={`${styles.imageFrame} ${styles.imageHover}`}>
                <Image
                  src="/landing/about-training.jpg"
                  alt="Sportista na treningu"
                  width={700}
                  height={520}
                  className={styles.photo}
                />
              </div>
            </Parallax>
          </Reveal>

          <Reveal direction="right" className={styles.aboutCopy}>
            <p className={styles.kicker}>O nama</p>
            <h2>Most između terena i prilike</h2>
            <p>
              Na društvenim mrežama sportska objava nestane za pet minuta. U
              grupama na WhatsAppu oglas za igrača se izgubi među stotinu
              poruka. AthletiQ je nastao da to promijeni.
            </p>
            <p>
              Fokusirani smo na lokalnu zajednicu: jasni profili, oglasi sa
              konkretnim zahtjevima i AI koji povezuje pravu osobu sa pravom
              prilikom — bez posrednika.
            </p>
            <blockquote className={styles.quote}>
              „Sport nas uči da tim pobjeđuje. Ista logika vrijedi kad tražiš
              klub ili igrača."
            </blockquote>
          </Reveal>
        </section>

        <section id="platforma" className={styles.features}>
          <Reveal>
            <div className={styles.sectionIntro}>
              <p className={styles.kicker}>Za šta služi</p>
              <h2>Sve što sportista traži — na jednom mjestu</h2>
            </div>
          </Reveal>

          {FEATURES.map((item, i) => (
            <Reveal key={item.title} delay={i * 60} direction={i % 2 === 0 ? "left" : "right"}>
              <article className={`${styles.featureRow} ${i % 2 === 1 ? styles.featureReverse : ""}`}>
                <Parallax speed={i % 2 === 0 ? 36 : -36} className={styles.featureMedia}>
                  <figure className={styles.figure}>
                    <div className={`${styles.imageFrame} ${styles.imageHover}`}>
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={900}
                        height={600}
                        className={styles.photo}
                      />
                      <span className={styles.featureBadge}>{item.tag}</span>
                    </div>
                    <figcaption>{item.caption}</figcaption>
                  </figure>
                </Parallax>
                <div className={styles.featureCopy}>
                  <span className={styles.featureIcon}>
                    <item.icon size={22} />
                  </span>
                  <h3  >{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </section>

        <section id="kako" className={styles.steps}>
          <Reveal>
            <div className={styles.sectionIntro}>
              <p className={styles.kicker}>Kako se koristi</p>
              <h2>Od registracije do prvog dogovora</h2>
            </div>
          </Reveal>

          <div className={styles.stepsList}>
            {STEPS.map((step, i) => (
              <Reveal key={step.num} delay={i * 80} direction="up">
                <article className={styles.stepItem}>
                  <div className={styles.stepThumb}>
                    <Image
                      src={step.image}
                      alt={step.title}
                      width={800}
                      height={600}
                      className={styles.photo}
                    />
                  </div>
                  <div className={styles.stepBody}>
                    <span className={styles.stepNum}>{step.num}</span>
                    <h3 style={{ color: "#fff" }}>{step.title}</h3>
                    <p>{step.text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="uloge" className={styles.roles}>
          <Reveal>
            <div className={styles.sectionIntro}>
              <p className={styles.kicker}>Za koga je</p>
              <h2>Svako ima svoje mjesto u AthletiQ-u</h2>
            </div>
          </Reveal>

          <div className={styles.rolesGrid}>
            {ROLES.map((role, i) => (
              <Reveal key={role.title} delay={i * 70} direction="up">
                <TiltCard className={styles.roleCard}>
                  <div className={styles.rolePhoto}>
                    <Image
                      src={role.image}
                      alt={role.title}
                      width={800}
                      height={600}
                      className={styles.photo}
                    />
                    <div className={styles.roleShade} />
                    <div className={styles.roleOverlay}>
                      <h3 style={{ color: "#fff" }}>{role.title}</h3>
                      <p>{role.text}</p>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        <section className={styles.cta}>
          <Reveal direction="scale">
            <div className={styles.ctaBox}>
              <div className={styles.ctaGlow} aria-hidden />
              <h2 style={{ color: "#fff" }}>{user ? "Nastavi gdje si stao" : "Probaj AthletiQ danas"}</h2>
              <p>
                {user
                  ? "Početna, berza oglasa i poruke čekaju te. Jedan klik i opet si u toku sa zajednicom."
                  : "Registracija je besplatna. Za par minuta možeš pratiti klubove, gledati oglase i graditi mrežu."}
              </p>
              <div className={styles.ctaActions}>
                {user ? loggedInActions : guestActions}
              </div>
            </div>
          </Reveal>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <BrandMark />
            <p>Sportska mreža za lokalnu zajednicu.</p>
            <div className={styles.footerLinks}>
              <a href="#o-nama">O nama</a>
              <a href="#platforma">Platforma</a>
              <a href="#uloge">Uloge</a>
            </div>
          </div>
          <p className={styles.copy}>© {new Date().getFullYear()} AthletiQ. Sva prava zadržana.</p>
        </footer>
      </main>
    </div>
  );
}
