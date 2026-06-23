import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import {
    MapPin, Briefcase, Clock, ChevronRight, Users, Award,
    FileText, DollarSign, Home, Star, Globe, Calendar,
    CheckCircle, ArrowLeft, Share2, Bookmark, Flag,
    User, Shield, Target, Zap, TrendingUp, Link
} from 'lucide-react';
import './page.css';
import Navbar from '@/components/NavBar/NavBar';
import { CreatorCard } from '@/components/CreatorCard/page';
import { AdStats } from '@/components/AdStats/page';
import AdApplyCard from '@/components/AdApplyCard/page';
import { AdOwnerActions } from '@/components/AdOwnerActions/AdOwnerActions';
import { AdButtons } from '@/components/AdButtons/page';

export const getAdvertisementServer = async (advertisementId) => {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const baseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    let headers = {};
    if (refreshToken) {
        try {
            const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
                method: 'POST',
                headers: { Cookie: `refresh_token=${refreshToken}` },
                cache: 'no-store'
            });
            if (refreshRes.ok) {
                const { access_token } = await refreshRes.json();
                headers['Authorization'] = `Bearer ${access_token}`;
            }
        } catch (error) {
            console.error("Greška prilikom osvežavanja tokena na serveru:", error);
        }
    }
    try {
        const res = await fetch(`${baseUrl}/advertisements/get-advertisement/${advertisementId}`, {
            headers: headers,
            cache: 'no-store'
        });
        if (!res.ok) {
            console.error(`Oglas sa ID-jem ${advertisementId} nije pronađen ili je server vratio error:`, res.status);
            return null;
        }
        return await res.json();
    } catch (error) {
        console.error("Network greška na serveru prilikom preuzimanja oglasa:", error);
        return null;
    }
};

const ROLE_LABELS = {
    athlete: 'Sportista',
    coach: 'Trener',
    scout: 'Skaut',
    club: 'Klub',
    recreational_athlete: 'Rekreativac',
};

const ROLE_ICONS = {
    athlete: User,
    coach: Award,
    scout: Target,
    club: Shield,
    recreational_athlete: Zap,
};

function RequirementRow({ icon: Icon, label, value }) {
    if (!value && value !== 0 && value !== false) return null;
    const displayValue = typeof value === 'boolean' ? (value ? 'Da' : 'Ne') : String(value);
    return (
        <div className="req-row">
            <span className="req-icon"><Icon size={15} /></span>
            <span className="req-label">{label}</span>
            <span className="req-value">{displayValue}</span>
        </div>
    );
}

function RequirementList({ icon: Icon, label, items }) {
    if (!items || items.length === 0) return null;
    return (
        <div className="req-list-block">
            <div className="req-list-header">
                <span className="req-icon"><Icon size={15} /></span>
                <span className="req-label">{label}</span>
            </div>
            <ul className="req-list">
                {items.map((item, i) => (
                    <li key={i} className="req-list-item">
                        <CheckCircle size={13} />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function RequirementLink({ label, url }) {
    if (!url) return null;
    return (
        <div className="req-row">
            <span className="req-icon"><Link size={15} /></span>
            <span className="req-label">{label}</span>
            <a href={url} target="_blank" rel="noopener noreferrer" className="req-link">
                Pogledaj profil <ChevronRight size={13} />
            </a>
        </div>
    );
}

function formatTimestamp(isoString) {
    if (!isoString) return "";
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHr = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHr / 24);

        if (diffMin < 1) return "upravo sad";
        if (diffMin < 60) return `${diffMin}m`;
        if (diffHr < 24) return `${diffHr}h`;
        if (diffDay < 7) return `${diffDay}d`;
        return date.toLocaleDateString();
    } catch {
        return "";
    }
}

function RequirementsSection({ requirements }) {
    if (!requirements || Object.keys(requirements).length === 0) return null;

    const fieldMap = {
        age_min: { label: 'Min. godine', icon: Calendar },
        age_max: { label: 'Max. godine', icon: Calendar },
        age: { label: 'Godine', icon: Calendar },
        position: { label: 'Pozicija', icon: Target },
        height_min_cm: { label: 'Min. visina (cm)', icon: TrendingUp },
        height_cm: { label: 'Visina (cm)', icon: TrendingUp },
        weight_kg: { label: 'Težina (kg)', icon: TrendingUp },
        dominant_side: { label: 'Dominantna noga', icon: Star },
        min_experience: { label: 'Min. iskustvo', icon: Briefcase },
        experience: { label: 'Iskustvo', icon: Briefcase },
        years_exp: { label: 'Godine iskustva', icon: Briefcase },
        min_years_exp: { label: 'Min. godina iskustva', icon: Briefcase },
        salary_range_km: { label: 'Plata (KM)', icon: DollarSign },
        expected_salary_km: { label: 'Očekivana plata (KM)', icon: DollarSign },
        expected_compensation: { label: 'Kompenzacija', icon: DollarSign },
        compensation: { label: 'Kompenzacija', icon: DollarSign },
        price_per_player_km: { label: 'Cijena po igraču (KM)', icon: DollarSign },
        budget_km: { label: 'Budžet (KM)', icon: DollarSign },
        match_bonuses: { label: 'Bonusi za utakmice', icon: Star },
        accommodation_provided: { label: 'Smještaj obezbjeđen', icon: Home },
        relocation_package: { label: 'Relocation paket', icon: Home },
        open_to_relocation: { label: 'Otvoren za preseljenje', icon: Home },
        license: { label: 'Licenca', icon: Award },
        team_category: { label: 'Kategorija tima', icon: Users },
        contract_type: { label: 'Tip ugovora', icon: FileText },
        employment_type: { label: 'Zaposlenje', icon: Briefcase },
        scouting_exp: { label: 'Iskustvo skautinga', icon: Globe },
        scouting_type: { label: 'Tip skautinga', icon: Target },
        network_level: { label: 'Nivo mreže', icon: Globe },
        preferred_club_level: { label: 'Nivo kluba', icon: Shield },
        availability: { label: 'Dostupnost', icon: Clock },
        current_club: { label: 'Trenutni klub', icon: Shield },
        citizenship: { label: 'Državljanstvo', icon: Globe },
        league_level: { label: 'Nivo lige', icon: TrendingUp },
        preferred_league: { label: 'Preferirana liga', icon: TrendingUp },
        program_duration: { label: 'Trajanje programa', icon: Calendar },
        max_group_size: { label: 'Max. veličina grupe', icon: Users },
        target_level: { label: 'Ciljani nivo', icon: Target },
        training_location: { label: 'Lokacija treninga', icon: MapPin },
        training_city: { label: 'Grad treninga', icon: MapPin },
        training_type: { label: 'Tip treninga', icon: Zap },
        training_schedule: { label: 'Raspored', icon: Clock },
        fitness_level: { label: 'Nivo kondicije', icon: Zap },
        age_group: { label: 'Uzrasna grupa', icon: Users },
        payment_type: { label: 'Način plaćanja', icon: DollarSign },
        current_level: { label: 'Trenutni nivo', icon: TrendingUp },
        additional_info: { label: 'Dodatne informacije', icon: FileText },
        required_documents: { label: 'Potrebni dokumenti', icon: FileText },
        agency_note: { label: 'Napomena agencije', icon: FileText },
        career_goal: { label: 'Karijerni cilj', icon: Star },
    };

    const listFields = {
        mandatory_attachments: { label: 'Obavezni prilozi', icon: FileText },
        required_certifications: { label: 'Certifikati', icon: Award },
        coverage_regions: { label: 'Regije pokrivanja', icon: Globe },
        career_achievements: { label: 'Karijerna dostignuća', icon: Star },
        key_attributes: { label: 'Ključni atributi', icon: Zap },
        key_strengths: { label: 'Snage', icon: Zap },
        highlights: { label: 'Istaknuto', icon: Star },
        training_goals: { label: 'Ciljevi treninga', icon: Target },
        included_services: { label: 'Uključene usluge', icon: CheckCircle },
    };

    const linkFields = {
        profile_link: 'Transfermarkt profil',
        video_link: 'Video',
    };

    const rows = Object.entries(fieldMap)
        .filter(([key]) => requirements[key] !== undefined)
        .map(([key, { label, icon }]) => (
            <RequirementRow key={key} icon={icon} label={label} value={requirements[key]} />
        ));

    const lists = Object.entries(listFields)
        .filter(([key]) => requirements[key]?.length > 0)
        .map(([key, { label, icon }]) => (
            <RequirementList key={key} icon={icon} label={label} items={requirements[key]} />
        ));

    const links = Object.entries(linkFields)
        .filter(([key]) => requirements[key])
        .map(([key, label]) => (
            <RequirementLink key={key} label={label} url={requirements[key]} />
        ));

    return (
        <div className="req-section">
            <h2 className="section-title">Zahtjevi i detalji</h2>
            <div className="req-grid">
                {rows}
                {links}
            </div>
            {lists.length > 0 && <div className="req-lists">{lists}</div>}
        </div>
    );
}

export default async function AdvertisementDetailPage({ params }) {
    const { id } = await params;
    const ad = await getAdvertisementServer(id);

    if (!ad) notFound();

    const { title, description, sport, location, target_roles = [], requirements = {} } = ad;
    const formatTimeStamp = formatTimestamp(ad.created_at);
    const primaryRole = target_roles[0];
    const RoleIcon = ROLE_ICONS[primaryRole] || User;

    return (
        <>
            <Navbar />
            <main className="ad-page">

                <div className="ad-container">

                    <nav className="ad-breadcrumb">
                        <a href="/market-place" className="breadcrumb-back">
                            <ArrowLeft size={16} />
                            Svi oglasi
                        </a>
                        <span className="breadcrumb-sep"><ChevronRight size={14} /></span>
                        <span className="breadcrumb-current">{sport}</span>
                    </nav>

                    <article className="ad-header-card">

                        <div className="ad-header-top">

                            <span className="ad-sport-label">{sport}</span>

                            <div className="ad-actions">

                                <AdOwnerActions ad={ad} />
                            </div>
                        </div>

                        <h1 className="ad-title">{title}</h1>

                        <div className="ad-meta">
                            {location && (
                                <span className="meta-item">
                                    <MapPin size={14} />
                                    {location}
                                </span>
                            )}
                            {target_roles.length > 0 && (
                                <span className="meta-item">
                                    <Users size={14} />
                                    Za: {target_roles.map(r => ROLE_LABELS[r] || r).join(', ')}
                                </span>
                            )}
                            <span className="meta-item">
                                <Clock size={14} />
                                Prije:  {formatTimeStamp}
                            </span>
                        </div>

                        {description && (
                            <p className="ad-description">{description}</p>
                        )}

                        <div className="ad-header-footer">

                            <AdButtons ad={ad} />
                        </div>
                    </article>

                    <div className="ad-content-grid">

                        <div className="ad-main-col">
                            <RequirementsSection requirements={requirements} />
                            <AdApplyCard ad={ad} />
                        </div>

                        <aside className="ad-sidebar">
                            <CreatorCard creator={ad?.creator} />
                            <AdStats viewCount={ad?.view_count} applicationCount={ad?.application_count} />
                            <div className="sidebar-card">
                                <h3 className="sidebar-card-title">Pregled oglasa</h3>
                                <div className="sidebar-rows">
                                    <div className="sidebar-row">
                                        <Briefcase size={15} />
                                        <div>
                                            <span className="sidebar-row-label">Sport</span>
                                            <span className="sidebar-row-value">{sport}</span>
                                        </div>
                                    </div>
                                    {location && (
                                        <div className="sidebar-row">
                                            <MapPin size={15} />
                                            <div>
                                                <span className="sidebar-row-label">Lokacija</span>
                                                <span className="sidebar-row-value">{location}</span>
                                            </div>
                                        </div>
                                    )}
                                    {target_roles.length > 0 && (
                                        <div className="sidebar-row">
                                            <Users size={15} />
                                            <div>
                                                <span className="sidebar-row-label">Oglas za</span>
                                                <span className="sidebar-row-value">
                                                    {target_roles.map(r => ROLE_LABELS[r] || r).join(', ')}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </aside>

                    </div>

                </div>
            </main>
        </>
    );
}