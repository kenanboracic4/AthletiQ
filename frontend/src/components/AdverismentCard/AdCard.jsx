'use client';

import { useState } from 'react';
import {
    Building2,
    Search,
    Dumbbell,
    MapPin,
    Trophy,
    Users,
    Clock,
    Shield,
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Bookmark,
    Info,
    Share2,
    CheckCircle2,
    Flag,
    ArrowRight,
    Sparkles,
    Check,
    X,
} from 'lucide-react';
import styles from './AdCard.module.css';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import ReportModal from '../ReportModal/ReportModal';

const TYPE_CONFIG = {
    club: { label: 'Klub', Icon: Building2 },
    scout: { label: 'Skaut', Icon: Search },
    coach: { label: 'Trener', Icon: Dumbbell },
};

function getRoleType(role) {
    if (!role) return 'club';
    const r = role.toLowerCase();
    if (r.includes('trener') || r.includes('coach')) return 'coach';
    if (r.includes('skaut') || r.includes('scout')) return 'scout';
    return 'club';
}

function resolveImageUrl(path) {
    if (!path) return '/no-profile-picture.png';
    if (path.startsWith('http')) return path;
    return `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}${path}`;
}

function isUrgent(title) {
    return ['HITNO', 'URGENT'].some((kw) => title?.toUpperCase().includes(kw));
}

function buildHighlights(type, req) {
    if (!req) return [];

    if (type === 'coach') {
        return [
            req.price_per_player_km && { label: 'Cijena', val: `${req.price_per_player_km} KM / igraču` },
            req.max_group_size && { label: 'Veličina grupe', val: `${req.max_group_size} igrača` },
            req.age_group && { label: 'Uzrast', val: req.age_group },
            req.program_duration && { label: 'Trajanje', val: req.program_duration },
            req.training_schedule && { label: 'Raspored', val: req.training_schedule },
            req.target_level && { label: 'Nivo', val: req.target_level },
        ].filter(Boolean).slice(0, 5);
    }

    if (type === 'club') {
        return [
            req.age_range && { label: 'Uzrast', val: `${req.age_range.min}–${req.age_range.max} godina` },
            req.min_experience_seniors && { label: 'Iskustvo', val: req.min_experience_seniors },
            req.height_min_cm && { label: 'Min. visina', val: `${req.height_min_cm} cm` },
            req.financial_conditions?.salary_range_km && { label: 'Plata', val: `${req.financial_conditions.salary_range_km} KM/mj.` },
        ].filter(Boolean).slice(0, 5);
    }

    if (type === 'scout') {
        return [
            req.player_position && { label: 'Pozicija', val: req.player_position },
            req.age_range && { label: 'Uzrast', val: `${req.age_range.min}–${req.age_range.max} godina` },
            req.citizenship_requirement && { label: 'Pasoš', val: req.citizenship_requirement },
            req.key_attributes?.[0] && { label: 'Ključni atribut', val: req.key_attributes[0] },
        ].filter(Boolean).slice(0, 5);
    }

    return [];
}

function buildServices(type, req) {
    if (!req) return [];
    if (type === 'coach') return req.included_services?.slice(0, 4) ?? [];
    if (type === 'club') {
        return [
            req.accommodation_provided && 'Smještaj obezbijeđen',
            req.financial_conditions?.match_bonuses?.startsWith('Da') && 'Match bonusi uključeni',
            req.mandatory_attachments?.[0],
        ].filter(Boolean).slice(0, 4);
    }
    if (type === 'scout') return req.key_attributes?.slice(1, 5) ?? [];
    return [];
}

function getMatchClass(pct) {
    if (pct >= 75) return 'matchHigh';
    if (pct >= 50) return 'matchMid';
    return 'matchLow';
}

export default function AdCard({ ad, matchPercentage = null, matchReasons = null }) {
    const { user: currentUser } = useAuth();
    const [expanded, setExpanded] = useState(false);
    const [saved, setSaved] = useState(false);
    const [copied, setCopied] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);

    if (!ad) return null;

    const hasMatch = typeof matchPercentage === 'number' && !Number.isNaN(matchPercentage);
    const reasons = Array.isArray(matchReasons) ? matchReasons : [];

    const type = getRoleType(ad.creator?.role);
    const { label, Icon: TypeIcon } = TYPE_CONFIG[type];
    const urgent = isUrgent(ad.title);
    const highlights = buildHighlights(type, ad.requirements);
    const services = buildServices(type, ad.requirements);

    const shareUrl =
        typeof window !== 'undefined'
            ? `${window.location.origin}/market-place/advertisment/${ad.id}`
            : `/market-place/advertisment/${ad.id}`;

    const handleShareClick = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Link je kopiran');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Greška prilikom kopiranja linka: ', err);
        }
    };

    const metaParts = [
        { icon: TypeIcon, text: label },
        ad.sport && { icon: Trophy, text: ad.sport },
        ad.location && { icon: MapPin, text: ad.location },
        type === 'scout' && ad.requirements?.age_range && {
            icon: Users,
            text: `Do ${ad.requirements.age_range.max} god.`,
        },
        type === 'coach' && ad.requirements?.program_duration && {
            icon: Clock,
            text: ad.requirements.program_duration,
        },
        type === 'club' && ad.requirements?.accommodation_provided && {
            icon: Shield,
            text: 'Smještaj',
        },
    ].filter(Boolean);

    return (
        <article className={`${styles.card} ${styles[type]}`}>
            <div className={styles.topBar}>
                {ad.creator ? (
                    <Link href={`/profile/${ad.creator.nickname}`} className={styles.creatorLink}>
                        <img
                            src={resolveImageUrl(ad.creator.image)}
                            alt=""
                            className={styles.creatorAvatar}
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/no-profile-picture.png';
                            }}
                        />
                        <span className={styles.creatorBlock}>
                            <span className={styles.creatorName}>{ad.creator.nickname}</span>
                            <span className={styles.creatorRole}>{ad.creator.role}</span>
                        </span>
                        {ad.creator?.is_verified === true && (
                            <CheckCircle2
                                size={14}
                                className={styles.verifiedIcon}
                                aria-label="Verifikovan profil"
                            />
                        )}
                    </Link>
                ) : (
                    <span className={styles.creatorRole}>Oglas na berzi</span>
                )}

                <div className={styles.topBarRight}>
                    {hasMatch && (
                        <span
                            className={`${styles.matchBadge} ${styles[getMatchClass(matchPercentage)]}`}
                            title="Procjena poklapanja sa tvojim profilom"
                        >
                            <Sparkles size={13} />
                            {matchPercentage}% poklapanje
                        </span>
                    )}

                    <button
                        type="button"
                        className={`${styles.saveBtn} ${saved ? styles.saved : ''}`}
                        onClick={() => setSaved((p) => !p)}
                        aria-label={saved ? 'Ukloni sa sačuvanih' : 'Sačuvaj oglas'}
                    >
                        <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
                    </button>
                </div>
            </div>

            <div className={styles.main}>
                {urgent && (
                    <p className={styles.urgentLine}>
                        <AlertCircle size={14} />
                        Hitno traženje
                    </p>
                )}

                <h3 className={styles.title}>{ad.title}</h3>

                {metaParts.length > 0 && (
                    <p className={styles.metaLine}>
                        {metaParts.map((part, index) => (
                            <span key={`${part.text}-${index}`} className={styles.metaPart}>
                                {index > 0 && <span className={styles.metaDot}>·</span>}
                                <part.icon size={13} className={styles.metaIcon} />
                                {part.text}
                            </span>
                        ))}
                    </p>
                )}

                <p className={`${styles.description} ${expanded ? styles.descriptionOpen : ''}`}>
                    {ad.description}
                </p>

                {ad.description && ad.description.length > 120 && (
                    <button
                        type="button"
                        className={styles.readMoreBtn}
                        onClick={() => setExpanded((p) => !p)}
                    >
                        {expanded ? (
                            <>Prikaži manje <ChevronUp size={14} /></>
                        ) : (
                            <>Prikaži više <ChevronDown size={14} /></>
                        )}
                    </button>
                )}

                {reasons.length > 0 && (
                    <div className={styles.matchReasons}>
                        <p className={styles.detailsHeading}>Zašto ti odgovara</p>
                        <ul className={styles.reasonsList}>
                            {reasons.map((r, i) => (
                                <li
                                    key={`${r.label}-${i}`}
                                    className={`${styles.reasonItem} ${r.ok ? styles.reasonOk : styles.reasonNo}`}
                                    title={r.detail}
                                >
                                    {r.ok ? <Check size={13} /> : <X size={13} />}
                                    <span className={styles.reasonLabel}>{r.label}:</span>
                                    <span className={styles.reasonDetail}>{r.detail}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {highlights.length > 0 && (
                    <div className={styles.detailsBlock}>
                        <p className={styles.detailsHeading}>Uslovi</p>
                        <dl className={styles.detailsList}>
                            {highlights.map((item) => (
                                <div key={item.label} className={styles.detailsRow}>
                                    <dt>{item.label}</dt>
                                    <dd>{item.val}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                )}

                {services.length > 0 && (
                    <div className={styles.detailsBlock}>
                        <p className={styles.detailsHeading}>Dodatno</p>
                        <ul className={styles.servicesList}>
                            {services.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className={styles.footer}>
                <Link href={`/market-place/advertisment/${ad.id}`} className={styles.primaryBtn}>
                    Pogledaj oglas
                    <ArrowRight size={15} />
                </Link>

                <div className={styles.footerActions}>
                    <button
                        type="button"
                        className={styles.textBtn}
                        onClick={handleShareClick}
                    >
                        <Share2 size={14} />
                        {copied ? 'Kopirano' : 'Podijeli'}
                    </button>

                    {currentUser && currentUser.id !== ad.creator_id && currentUser.id !== ad.creator?.id && (
                        <button
                            type="button"
                            className={styles.textBtn}
                            onClick={() => setReportOpen(true)}
                        >
                            <Flag size={14} />
                            Prijavi
                        </button>
                    )}
                </div>
            </div>

            {reportOpen && (
                <ReportModal
                    targetType="advertisement"
                    advertisementId={ad.id}
                    onClose={() => setReportOpen(false)}
                />
            )}
        </article>
    );
}
