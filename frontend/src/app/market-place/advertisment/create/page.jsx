'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Navbar from '@/components/NavBar/NavBar';
import styles from './page.module.css';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
    Building2, Search, Dumbbell, ChevronRight, ChevronLeft,
    MapPin, Trophy, CheckCircle2, AlertCircle, Plus, X,
} from 'lucide-react';

import { useAdvertismentPostMutations } from '@/hooks/AdvertismentPostMutation';
import { useAdvertisementLookups } from '@/hooks/Lookup';
import { LookupSelect, LocationLookupInput, PositionLookupSelect } from '@/components/LookupSelect/LookupSelect';

import { roleToAdType, targetRoleToApi } from '@/lib/adRoleMapping';

const ROLE_LABELS = { club: 'kao klub', coach: 'kao trener', scout: 'kao skaut', athlete: 'kao sportista' };

const TYPE_CONFIG = {
    club: { label: 'Klub', Icon: Building2, color: '#1e3a5f', bg: '#e8f0fa' },
    scout: { label: 'Skaut', Icon: Search, color: '#14532d', bg: '#e8f5ee' },
    coach: { label: 'Trener', Icon: Dumbbell, color: '#7c2d12', bg: '#fdf0eb' },
    athlete: {
        label: 'Sportista',
        Icon: Trophy,
        color: '#0f766e',
        bg: '#ecfeff',
    },
};

const TARGET_OPTIONS = {
    club: [
        { value: 'athlete', label: 'Igrač', icon: '', desc: 'Tražite sportiste za tim' },
        { value: 'coach', label: 'Trener', icon: '', desc: 'Tražite stručni kadar' },
        { value: 'scout', label: 'Skaut', icon: '', desc: 'Tražite skauta za klub' },
    ],
    coach: [
        { value: 'club', label: 'Klub', icon: '', desc: 'Tražite angažman u klubu' },
        { value: 'athlete', label: 'Igrač', icon: '', desc: 'Nudite trening igračima' },
        { value: 'recreational_athlete', label: 'Rekreativac', icon: '🏃', desc: 'Nudite rekreativni program' },
    ],
    scout: [
        { value: 'club', label: 'Klub', icon: '', desc: 'Nudite skauting usluge klubu' },
        { value: 'athlete', label: 'Igrač', icon: '', desc: 'Tražite talente za praćenje' },
    ],
    athlete: [
        {
            value: 'club',
            label: 'Klub',
            icon: '',
            desc: 'Predstavi se klubovima'
        },
        {
            value: 'coach',
            label: 'Trener',
            icon: '',
            desc: 'Pronađi individualnog trenera'
        },
        {
            value: 'scout',
            label: 'Skaut',
            icon: '',
            desc: 'Predstavi se skautima i agentima'
        },
    ],
};

const STEPS = ['Koga tražiš', 'Detalji oglasa', 'Pregled'];

function FieldWrapper({ label, error, hint, children }) {
    return (
        <div className={styles.fieldGroup}>
            <label className={styles.label}>{label}</label>
            {hint && <span className={styles.hint}>{hint}</span>}
            {children}
            {error && (
                <span className={styles.errorMsg}>
                    <AlertCircle size={13} /> {error}
                </span>
            )}
        </div>
    );
}

function TagInput({ value = [], onChange, placeholder }) {
    const [input, setInput] = useState('');

    function addTag() {
        const t = input.trim();
        if (t && !value.includes(t)) onChange([...value, t]);
        setInput('');
    }

    return (
        <div className={styles.tagInputWrapper}>
            <div className={styles.tags}>
                {value.map(tag => (
                    <span key={tag} className={styles.tag}>
                        {tag}
                        <button type="button" onClick={() => onChange(value.filter(t => t !== tag))}>
                            <X size={11} />
                        </button>
                    </span>
                ))}
            </div>
            <div className={styles.tagRow}>
                <input
                    className={styles.input}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                    placeholder={placeholder}
                />
                <button type="button" className={styles.addTagBtn} onClick={addTag}>
                    <Plus size={15} />
                </button>
            </div>
        </div>
    );
}

function SectionLabel({ children }) {
    return (
        <p style={{
            fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: '#94a3b8', margin: '8px 0 0',
            borderTop: '1px solid #f1f5f9', paddingTop: 16,
        }}>
            {children}
        </p>
    );
}

function StepTarget({ adType, targetRole, setTargetRole, submitted }) {
    const options = TARGET_OPTIONS[adType] || [];
    return (
        <div className={styles.stepSection}>
            <p className={styles.stepLead}>
                Odaberi kome je oglas namijenjen — na osnovu toga ćeš popuniti prilagođena polja.
            </p>
            <FieldWrapper
                label="Oglas je namijenjen"
                error={submitted && !targetRole ? 'Odaberi kome je oglas namijenjen' : undefined}
            >
                <div
                    className={styles.targetRoleGrid}
                    style={{ marginTop: 6, alignItems: 'stretch' }}
                >
                    {options.map(o => (
                        <button
                            key={o.value}
                            type="button"
                            className={`${styles.targetRoleChip} ${targetRole === o.value ? styles.targetRoleChipActive : ''}`}
                            onClick={() => setTargetRole(o.value)}
                            style={{
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                padding: '14px 16px',
                                gap: 4,
                                position: 'relative',
                                lineHeight: 1.3,
                            }}
                        >
                            {targetRole === o.value && (
                                <CheckCircle2
                                    size={14}
                                    className={styles.targetRoleCheck}
                                    style={{ position: 'absolute', top: 10, right: 10 }}
                                />
                            )}

                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{o.label}</span>
                            <span style={{ fontSize: '0.78rem', opacity: 0.65, fontWeight: 400 }}>{o.desc}</span>
                        </button>
                    ))}
                </div>
            </FieldWrapper>
        </div>
    );
}

function BasicInfo({ register, errors, sports, locations, isLoading }) {
    return (
        <>
            <FieldWrapper label="Naslov oglasa" error={errors.title?.message} hint="Kratko, jasno, upadljivo.">
                <input
                    className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                    placeholder='npr. "Potraga za seniorskim golmanom – Premijer liga"'
                    {...register('title', {
                        required: 'Naslov je obavezan',
                        minLength: { value: 10, message: 'Minimalno 10 karaktera' },
                    })}
                />
            </FieldWrapper>

            <FieldWrapper label="Opis" error={errors.description?.message} hint="Opiši prilike, uslove i šta kandidat može očekivati.">
                <textarea
                    className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                    rows={5}
                    placeholder="Opiši što detaljnije: ko ste, šta tražite, šta nudite..."
                    {...register('description', {
                        required: 'Opis je obavezan',
                        minLength: { value: 30, message: 'Minimalno 30 karaktera' },
                    })}
                />
            </FieldWrapper>

            <div className={styles.twoCol}>
                <FieldWrapper label="Sport" error={errors.sport?.message}>
                    <LookupSelect
                        register={register}
                        name="sport"
                        rules={{ required: 'Odaberi sport' }}
                        options={sports}
                        placeholder={isLoading ? 'Učitavanje...' : '— Odaberi sport —'}
                        disabled={isLoading}
                        className={styles.select}
                        error={!!errors.sport}
                    />
                </FieldWrapper>

                <FieldWrapper label="Lokacija" error={errors.location?.message} hint="Odaberi grad ili upiši lokaciju.">
                    <div className={styles.inputIcon}>
                        <MapPin size={16} />
                        <LocationLookupInput
                            register={register}
                            name="location"
                            rules={{ required: 'Lokacija je obavezna' }}
                            locations={locations}
                            listId="ad-location-options"
                            placeholder={isLoading ? 'Učitavanje...' : 'npr. Sarajevo'}
                            className={styles.input}
                            error={!!errors.location}
                        />
                    </div>
                </FieldWrapper>
            </div>
        </>
    );
}

function ReqAthleteToClub({ register, errors, setValue, getValues, sportName, positions }) {
    const [highlights, setHighlights] = useState(
        getValues('requirements.highlights') || []
    );

    return (
        <>
            <SectionLabel>Igrački profil</SectionLabel>

            <div className={styles.twoCol}>
                <FieldWrapper label="Pozicija">
                    <PositionLookupSelect
                        register={register}
                        name="requirements.position"
                        rules={{ required: 'Obavezno' }}
                        positions={positions}
                        sportName={sportName}
                        className={styles.select}
                    />
                </FieldWrapper>

                <FieldWrapper label="Godine">
                    <input
                        type="number"
                        className={styles.input}
                        {...register('requirements.age', {
                            required: 'Obavezno',
                        })}
                    />
                </FieldWrapper>
            </div>

            <div className={styles.twoCol}>
                <FieldWrapper label="Visina (cm)">
                    <input
                        type="number"
                        className={styles.input}
                        {...register('requirements.height_cm')}
                    />
                </FieldWrapper>

                <FieldWrapper label="Težina (kg)">
                    <input
                        type="number"
                        className={styles.input}
                        {...register('requirements.weight_kg')}
                    />
                </FieldWrapper>
            </div>

            <FieldWrapper label="Dominantna noga/ruka">
                <select
                    className={styles.select}
                    {...register('requirements.dominant_side')}
                >
                    <option value="">— Odaberi —</option>
                    <option value="Desna">Desna</option>
                    <option value="Lijeva">Lijeva</option>
                    <option value="Obje">Obje</option>
                </select>
            </FieldWrapper>

            <SectionLabel>Karijera</SectionLabel>

            <FieldWrapper label="Trenutni klub">
                <input
                    className={styles.input}
                    placeholder="npr. FK Sarajevo"
                    {...register('requirements.current_club')}
                />
            </FieldWrapper>

            <FieldWrapper label="Dosadašnje iskustvo">
                <textarea
                    rows={4}
                    className={styles.textarea}
                    placeholder="Klubovi, lige, nastupi..."
                    {...register('requirements.experience')}
                />
            </FieldWrapper>

            <FieldWrapper label="Najveći uspjesi">
                <TagInput
                    value={highlights}
                    onChange={v => {
                        setHighlights(v);
                        setValue('requirements.highlights', v);
                    }}
                    placeholder="npr. Reprezentacija U19"
                />
            </FieldWrapper>

            <SectionLabel>Dostupnost</SectionLabel>

            <div className={styles.twoCol}>
                <FieldWrapper label="Status">
                    <select
                        className={styles.select}
                        {...register('requirements.availability')}
                    >
                        <option value="">— Status —</option>
                        <option value="Slobodan igrač">
                            Slobodan igrač
                        </option>
                        <option value="Ističe ugovor">
                            Ističe ugovor
                        </option>
                        <option value="Transfer moguć">
                            Transfer moguć
                        </option>
                    </select>
                </FieldWrapper>

                <FieldWrapper label="Preferirana liga">
                    <input
                        className={styles.input}
                        placeholder="npr. Premijer liga BiH"
                        {...register('requirements.preferred_league')}
                    />
                </FieldWrapper>
            </div>

            <FieldWrapper label="Video / Transfermarkt / Wyscout link">
                <input
                    className={styles.input}
                    placeholder="https://..."
                    {...register('requirements.profile_link')}
                />
            </FieldWrapper>
        </>
    );
}

function ReqClubAthlete({ register, errors, setValue, getValues, sportName, positions }) {
    const [attachments, setAttachments] = useState(getValues('requirements.mandatory_attachments') || []);
    return (
        <>
            <SectionLabel>Zahtjevi prema igraču</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Min. godine" error={errors.requirements?.age_min?.message}>
                    <input type="number" className={styles.input} placeholder="npr. 18"
                        {...register('requirements.age_min', { required: 'Obavezno', min: { value: 14, message: 'Min 14' } })} />
                </FieldWrapper>
                <FieldWrapper label="Max. godine" error={errors.requirements?.age_max?.message}>
                    <input type="number" className={styles.input} placeholder="npr. 32"
                        {...register('requirements.age_max', { required: 'Obavezno' })} />
                </FieldWrapper>
            </div>
            <div className={styles.twoCol}>
                <FieldWrapper label="Pozicija" error={errors.requirements?.position?.message}>
                    <PositionLookupSelect
                        register={register}
                        name="requirements.position"
                        rules={{ required: 'Obavezno' }}
                        positions={positions}
                        sportName={sportName}
                        className={styles.select}
                        error={!!errors.requirements?.position}
                    />
                </FieldWrapper>
                <FieldWrapper label="Min. visina (cm)">
                    <input type="number" className={styles.input} placeholder="npr. 180"
                        {...register('requirements.height_min_cm')} />
                </FieldWrapper>
            </div>
            <FieldWrapper label="Min. iskustvo" error={errors.requirements?.min_experience?.message}>
                <input className={styles.input} placeholder="npr. 2 sezone u prvoj ligi"
                    {...register('requirements.min_experience', { required: 'Obavezno' })} />
            </FieldWrapper>

            <SectionLabel>Finansijski uslovi</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Raspon plate (KM/mj.)">
                    <input className={styles.input} placeholder="npr. 1500 – 2500"
                        {...register('requirements.salary_range_km')} />
                </FieldWrapper>
                <FieldWrapper label="Bonusi za utakmice">
                    <select className={styles.select} {...register('requirements.match_bonuses')}>
                        <option value="">— Bonusi —</option>
                        <option value="Da, po pravilniku">Da, po pravilniku</option>
                        <option value="Individualni dogovor">Individualni dogovor</option>
                        <option value="Ne">Bez bonusa</option>
                    </select>
                </FieldWrapper>
            </div>
            <FieldWrapper label="Smještaj i ishrana">
                <label className={styles.checkLabel}>
                    <input type="checkbox" {...register('requirements.accommodation_provided')} />
                    <span>Klub obezbjeđuje smještaj i ishranu</span>
                </label>
            </FieldWrapper>

            <SectionLabel>Dokumentacija</SectionLabel>
            <FieldWrapper label="Obavezni prilozi" hint="Enter ili + za dodavanje">
                <TagInput
                    value={attachments}
                    onChange={v => { setAttachments(v); setValue('requirements.mandatory_attachments', v); }}
                    placeholder="npr. InStat profil, Video kompilacija..."
                />
            </FieldWrapper>
        </>
    );
}

function ReqClubCoach({ register, errors, setValue, getValues }) {
    const [certs, setCerts] = useState(getValues('requirements.required_certifications') || []);
    return (
        <>
            <SectionLabel>Tražene kvalifikacije</SectionLabel>
            <FieldWrapper label="UEFA licenca" error={errors.requirements?.license?.message}>
                <select
                    className={`${styles.select} ${errors.requirements?.license ? styles.inputError : ''}`}
                    {...register('requirements.license', { required: 'Obavezno' })}
                >
                    <option value="">— Odaberi licencu —</option>
                    <option value="UEFA Pro">UEFA Pro</option>
                    <option value="UEFA A">UEFA A</option>
                    <option value="UEFA B">UEFA B</option>
                    <option value="UEFA C">UEFA C</option>
                    <option value="Bez licence">Bez licence (mlađe kategorije)</option>
                </select>
            </FieldWrapper>
            <div className={styles.twoCol}>
                <FieldWrapper label="Min. godina iskustva" error={errors.requirements?.min_years_exp?.message}>
                    <input type="number" className={styles.input} placeholder="npr. 5"
                        {...register('requirements.min_years_exp', { required: 'Obavezno', min: { value: 0, message: 'Min 0' } })} />
                </FieldWrapper>
                <FieldWrapper label="Kategorija tima">
                    <select className={styles.select} {...register('requirements.team_category')}>
                        <option value="">— Kategorija —</option>
                        <option value="Seniorski tim">Seniorski tim</option>
                        <option value="U-19">U-19</option>
                        <option value="U-17">U-17</option>
                        <option value="U-15">U-15</option>
                        <option value="Ženska ekipa">Ženska ekipa</option>
                    </select>
                </FieldWrapper>
            </div>
            <FieldWrapper label="Dodatne certifikacije" hint="Enter ili + za dodavanje">
                <TagInput
                    value={certs}
                    onChange={v => { setCerts(v); setValue('requirements.required_certifications', v); }}
                    placeholder="npr. Goalkeeping cert, Sports Analytics..."
                />
            </FieldWrapper>

            <SectionLabel>Uslovi zaposlenja</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Raspon plate (KM/mj.)">
                    <input className={styles.input} placeholder="npr. 2000 – 3500"
                        {...register('requirements.salary_range_km')} />
                </FieldWrapper>
                <FieldWrapper label="Tip ugovora">
                    <select className={styles.select} {...register('requirements.contract_type')}>
                        <option value="">— Tip —</option>
                        <option value="Puno radno vrijeme">Puno radno vrijeme</option>
                        <option value="Honorarno">Honorarno</option>
                        <option value="Sezonski ugovor">Sezonski ugovor</option>
                    </select>
                </FieldWrapper>
            </div>
            <FieldWrapper label="Preseljenje">
                <label className={styles.checkLabel}>
                    <input type="checkbox" {...register('requirements.relocation_package')} />
                    <span>Klub obezbjeđuje paket za preseljenje / smještaj</span>
                </label>
            </FieldWrapper>
        </>
    );
}

function ReqClubScout({ register, errors, setValue, getValues }) {
    const [regions, setRegions] = useState(getValues('requirements.coverage_regions') || []);
    return (
        <>
            <SectionLabel>Zahtjevi prema skautu</SectionLabel>
            <FieldWrapper label="Iskustvo u skauting poslu" error={errors.requirements?.scouting_exp?.message}>
                <input className={styles.input} placeholder="npr. 3+ godine u strukturi kluba Premier League"
                    {...register('requirements.scouting_exp', { required: 'Obavezno' })} />
            </FieldWrapper>
            <div className={styles.twoCol}>
                <FieldWrapper label="Mreža kontakata">
                    <select className={styles.select} {...register('requirements.network_level')}>
                        <option value="">— Nivo —</option>
                        <option value="Lokalna (BiH)">Lokalna (BiH)</option>
                        <option value="Regionalna (Ex-Yu)">Regionalna (Ex-Yu)</option>
                        <option value="Evropska">Evropska</option>
                        <option value="Globalna">Globalna</option>
                    </select>
                </FieldWrapper>
                <FieldWrapper label="Tip skautinga">
                    <select className={styles.select} {...register('requirements.scouting_type')}>
                        <option value="">— Tip —</option>
                        <option value="Video analiza">Video analiza</option>
                        <option value="Live skauting">Live skauting (teren)</option>
                        <option value="Kombinovano">Kombinovano</option>
                    </select>
                </FieldWrapper>
            </div>
            <FieldWrapper label="Regije pokrivanja" hint="Enter ili + za dodavanje">
                <TagInput
                    value={regions}
                    onChange={v => { setRegions(v); setValue('requirements.coverage_regions', v); }}
                    placeholder="npr. Balkans, Eastern Europe, MENA..."
                />
            </FieldWrapper>

            <SectionLabel>Kompenzacija</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Naknada">
                    <input className={styles.input} placeholder="npr. €500/mj + % od transfera"
                        {...register('requirements.compensation')} />
                </FieldWrapper>
                <FieldWrapper label="Tip angažmana">
                    <select className={styles.select} {...register('requirements.employment_type')}>
                        <option value="">— Tip —</option>
                        <option value="Stalno zaposlenje">Stalno zaposlenje</option>
                        <option value="Freelance">Freelance / projekt</option>
                        <option value="Konsultant">Konsultant</option>
                    </select>
                </FieldWrapper>
            </div>
        </>
    );
}

function ReqCoachToClub({ register, errors, setValue, getValues }) {
    const [achievements, setAchievements] = useState(getValues('requirements.career_achievements') || []);
    return (
        <>
            <SectionLabel>Tvoje kvalifikacije</SectionLabel>
            <FieldWrapper label="UEFA licenca" error={errors.requirements?.license?.message}>
                <select
                    className={`${styles.select} ${errors.requirements?.license ? styles.inputError : ''}`}
                    {...register('requirements.license', { required: 'Obavezno' })}
                >
                    <option value="">— Licenca —</option>
                    <option value="UEFA Pro">UEFA Pro</option>
                    <option value="UEFA A">UEFA A</option>
                    <option value="UEFA B">UEFA B</option>
                    <option value="UEFA C">UEFA C</option>
                </select>
            </FieldWrapper>
            <div className={styles.twoCol}>
                <FieldWrapper label="Godine iskustva" error={errors.requirements?.years_exp?.message}>
                    <input type="number" className={styles.input} placeholder="npr. 10"
                        {...register('requirements.years_exp', { required: 'Obavezno' })} />
                </FieldWrapper>
                <FieldWrapper label="Preferirani nivo kluba">
                    <select className={styles.select} {...register('requirements.preferred_club_level')}>
                        <option value="">— Nivo —</option>
                        <option value="Premijer liga BiH">Premijer liga BiH</option>
                        <option value="Prva liga">Prva liga</option>
                        <option value="Kantonal / Regionalni">Kantonal / Regionalni</option>
                        <option value="Omladinska škola">Omladinska škola</option>
                        <option value="Inostranstvo">Inostranstvo</option>
                    </select>
                </FieldWrapper>
            </div>
            <FieldWrapper label="Karijerni uspjesi" hint="Enter ili + za dodavanje">
                <TagInput
                    value={achievements}
                    onChange={v => { setAchievements(v); setValue('requirements.career_achievements', v); }}
                    placeholder="npr. Prvak FBiH 2022, UEFA Konferencija 2023..."
                />
            </FieldWrapper>

            <SectionLabel>Uslovi koji te zanimaju</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Očekivana plata (KM/mj.)">
                    <input className={styles.input} placeholder="npr. 2500+"
                        {...register('requirements.expected_salary_km')} />
                </FieldWrapper>
                <FieldWrapper label="Dostupnost">
                    <select className={styles.select} {...register('requirements.availability')}>
                        <option value="">— Dostupnost —</option>
                        <option value="Odmah">Odmah</option>
                        <option value="Od januara">Od januara</option>
                        <option value="Po dogovoru">Po dogovoru</option>
                    </select>
                </FieldWrapper>
            </div>
            <FieldWrapper label="Preseljenje">
                <label className={styles.checkLabel}>
                    <input type="checkbox" {...register('requirements.open_to_relocation')} />
                    <span>Otvoren za rad u drugom gradu / inostranstvu</span>
                </label>
            </FieldWrapper>
        </>
    );
}

function ReqCoachToAthlete({ register, errors, setValue, getValues }) {
    const [services, setServices] = useState(getValues('requirements.included_services') || []);
    return (
        <>
            <SectionLabel>Program treninga</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Trajanje programa" error={errors.requirements?.program_duration?.message}>
                    <input className={styles.input} placeholder="npr. 4 sedmice (5x tjedno)"
                        {...register('requirements.program_duration', { required: 'Obavezno' })} />
                </FieldWrapper>
                <FieldWrapper label="Max. veličina grupe" error={errors.requirements?.max_group_size?.message}>
                    <input type="number" className={styles.input} placeholder="npr. 6"
                        {...register('requirements.max_group_size', { required: 'Obavezno', min: { value: 1, message: 'Min 1' } })} />
                </FieldWrapper>
            </div>
            <div className={styles.twoCol}>
                <FieldWrapper label="Nivo igrača">
                    <select className={styles.select} {...register('requirements.target_level')}>
                        <option value="">— Nivo —</option>
                        <option value="Profesionalci">Profesionalci</option>
                        <option value="Poluamateri">Poluamateri</option>
                        <option value="Akademski (U17–U21)">Akademski (U17–U21)</option>
                        <option value="Svi nivoi">Svi nivoi</option>
                    </select>
                </FieldWrapper>
                <FieldWrapper label="Lokacija treninga">
                    <input className={styles.input} placeholder="npr. Tereni Koševo, Sarajevo"
                        {...register('requirements.training_location')} />
                </FieldWrapper>
            </div>
            <FieldWrapper label="Šta je uključeno" hint="Enter ili + za dodavanje">
                <TagInput
                    value={services}
                    onChange={v => { setServices(v); setValue('requirements.included_services', v); }}
                    placeholder="npr. Video analiza, Praćenje srčanog ritma..."
                />
            </FieldWrapper>

            <SectionLabel>Cijena</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Cijena po igraču (KM)" error={errors.requirements?.price_per_player_km?.message}>
                    <input type="number" className={styles.input} placeholder="npr. 350"
                        {...register('requirements.price_per_player_km', { required: 'Obavezno' })} />
                </FieldWrapper>
                <FieldWrapper label="Tip naplate">
                    <select className={styles.select} {...register('requirements.payment_type')}>
                        <option value="">— Tip —</option>
                        <option value="Po sesiji">Po sesiji</option>
                        <option value="Sedmično">Sedmično</option>
                        <option value="Paketna cijena">Paketna cijena</option>
                    </select>
                </FieldWrapper>
            </div>
        </>
    );
}

function ReqCoachToRecreational({ register, errors, setValue, getValues }) {
    const [services, setServices] = useState(getValues('requirements.included_services') || []);
    return (
        <>
            <SectionLabel>Program za rekreativce</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Trajanje programa" error={errors.requirements?.program_duration?.message}>
                    <input className={styles.input} placeholder="npr. 8 sedmica"
                        {...register('requirements.program_duration', { required: 'Obavezno' })} />
                </FieldWrapper>
                <FieldWrapper label="Max. broj polaznika" error={errors.requirements?.max_group_size?.message}>
                    <input type="number" className={styles.input} placeholder="npr. 12"
                        {...register('requirements.max_group_size', { required: 'Obavezno' })} />
                </FieldWrapper>
            </div>
            <div className={styles.twoCol}>
                <FieldWrapper label="Fizička sprema">
                    <select className={styles.select} {...register('requirements.fitness_level')}>
                        <option value="">— Nivo —</option>
                        <option value="Početnik">Početnik</option>
                        <option value="Srednji">Srednji</option>
                        <option value="Napredniji">Napredniji</option>
                        <option value="Svi">Svi nivoi</option>
                    </select>
                </FieldWrapper>
                <FieldWrapper label="Uzrast">
                    <select className={styles.select} {...register('requirements.age_group')}>
                        <option value="">— Uzrast —</option>
                        <option value="18–35">18–35</option>
                        <option value="35–50">35–50</option>
                        <option value="50+">50+</option>
                        <option value="Svi uzrasti">Svi uzrasti</option>
                    </select>
                </FieldWrapper>
            </div>
            <FieldWrapper label="Šta je uključeno" hint="Enter ili + za dodavanje">
                <TagInput
                    value={services}
                    onChange={v => { setServices(v); setValue('requirements.included_services', v); }}
                    placeholder="npr. Oprema, Plan ishrane, Procjena fizičke spreme..."
                />
            </FieldWrapper>

            <SectionLabel>Cijena i termini</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Cijena (KM/mj.)" error={errors.requirements?.price_per_player_km?.message}>
                    <input type="number" className={styles.input} placeholder="npr. 150"
                        {...register('requirements.price_per_player_km', { required: 'Obavezno' })} />
                </FieldWrapper>
                <FieldWrapper label="Termini treninga">
                    <input className={styles.input} placeholder="npr. Pon/Sri/Pet – 18:00"
                        {...register('requirements.training_schedule')} />
                </FieldWrapper>
            </div>
        </>
    );
}

function ReqScoutToClub({ register, errors, setValue, getValues }) {
    const [regions, setRegions] = useState(getValues('requirements.coverage_regions') || []);
    const [achievements, setAchievements] = useState(getValues('requirements.career_achievements') || []);
    return (
        <>
            <SectionLabel>Tvoj skauting profil</SectionLabel>
            <FieldWrapper label="Godine iskustva" error={errors.requirements?.years_exp?.message}>
                <input type="number" className={styles.input} placeholder="npr. 7"
                    {...register('requirements.years_exp', { required: 'Obavezno' })} />
            </FieldWrapper>
            <div className={styles.twoCol}>
                <FieldWrapper label="Tip skautinga">
                    <select className={styles.select} {...register('requirements.scouting_type')}>
                        <option value="">— Tip —</option>
                        <option value="Video analiza">Video analiza</option>
                        <option value="Live skauting">Live skauting</option>
                        <option value="Kombinovano">Kombinovano</option>
                    </select>
                </FieldWrapper>
                <FieldWrapper label="Mreža kontakata">
                    <select className={styles.select} {...register('requirements.network_level')}>
                        <option value="">— Nivo —</option>
                        <option value="Lokalna (BiH)">Lokalna (BiH)</option>
                        <option value="Regionalna (Ex-Yu)">Regionalna (Ex-Yu)</option>
                        <option value="Evropska">Evropska</option>
                        <option value="Globalna">Globalna</option>
                    </select>
                </FieldWrapper>
            </div>
            <FieldWrapper label="Regije koje pokrivate" hint="Enter ili + za dodavanje">
                <TagInput
                    value={regions}
                    onChange={v => { setRegions(v); setValue('requirements.coverage_regions', v); }}
                    placeholder="npr. Balkans, Western Europe, MENA..."
                />
            </FieldWrapper>
            <FieldWrapper label="Karijerni uspjesi" hint="Enter ili + za dodavanje">
                <TagInput
                    value={achievements}
                    onChange={v => { setAchievements(v); setValue('requirements.career_achievements', v); }}
                    placeholder="npr. Otkrio igrača koji igra u Bundesligi..."
                />
            </FieldWrapper>

            <SectionLabel>Uslovi koji te zanimaju</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Očekivana kompenzacija">
                    <input className={styles.input} placeholder="npr. €800/mj + % od transfera"
                        {...register('requirements.expected_compensation')} />
                </FieldWrapper>
                <FieldWrapper label="Dostupnost">
                    <select className={styles.select} {...register('requirements.availability')}>
                        <option value="">— Dostupnost —</option>
                        <option value="Odmah">Odmah</option>
                        <option value="Od januara">Od januara</option>
                        <option value="Po dogovoru">Po dogovoru</option>
                    </select>
                </FieldWrapper>
            </div>
        </>
    );
}

function ReqAthleteToScout({ register, errors, setValue, getValues, sportName, positions }) {
    const [strengths, setStrengths] = useState(
        getValues('requirements.key_strengths') || []
    );

    return (
        <>
            <SectionLabel>Profil igrača</SectionLabel>

            <div className={styles.twoCol}>
                <FieldWrapper label="Pozicija">
                    <PositionLookupSelect
                        register={register}
                        name="requirements.position"
                        rules={{ required: 'Obavezno' }}
                        positions={positions}
                        sportName={sportName}
                        className={styles.select}
                    />
                </FieldWrapper>

                <FieldWrapper label="Godine">
                    <input
                        type="number"
                        className={styles.input}
                        {...register('requirements.age', {
                            required: 'Obavezno',
                        })}
                    />
                </FieldWrapper>
            </div>

            <div className={styles.twoCol}>
                <FieldWrapper label="Visina (cm)">
                    <input
                        type="number"
                        className={styles.input}
                        {...register('requirements.height_cm')}
                    />
                </FieldWrapper>

                <FieldWrapper label="Državljanstvo">
                    <input
                        className={styles.input}
                        placeholder="npr. Bosna i Hercegovina"
                        {...register('requirements.citizenship')}
                    />
                </FieldWrapper>
            </div>

            <FieldWrapper label="Ključne kvalitete" hint="Enter ili + za dodavanje">
                <TagInput
                    value={strengths}
                    onChange={v => {
                        setStrengths(v);
                        setValue('requirements.key_strengths', v);
                    }}
                    placeholder="npr. Brzina, Duel igra, Pregled igre..."
                />
            </FieldWrapper>

            <FieldWrapper label="Dosadašnje iskustvo">
                <textarea
                    rows={4}
                    className={styles.textarea}
                    placeholder="Klubovi, lige, reprezentacija..."
                    {...register('requirements.experience')}
                />
            </FieldWrapper>

            <SectionLabel>Materijali za pregled</SectionLabel>

            <FieldWrapper label="Video link">
                <input
                    className={styles.input}
                    placeholder="YouTube, Vimeo..."
                    {...register('requirements.video_link')}
                />
            </FieldWrapper>

            <FieldWrapper label="Transfermarkt / Wyscout / InStat">
                <input
                    className={styles.input}
                    placeholder="https://..."
                    {...register('requirements.profile_link')}
                />
            </FieldWrapper>

            <FieldWrapper label="Karijerni cilj">
                <textarea
                    rows={3}
                    className={styles.textarea}
                    placeholder="Šta tražiš i gdje želiš napredovati?"
                    {...register('requirements.career_goal')}
                />
            </FieldWrapper>
        </>
    );
}

function ReqAthleteToCoach({ register, errors, setValue, getValues }) {
    const [goals, setGoals] = useState(
        getValues('requirements.training_goals') || []
    );

    return (
        <>
            <SectionLabel>Šta želiš unaprijediti?</SectionLabel>

            <FieldWrapper label="Ciljevi treninga" hint="Enter ili + za dodavanje">
                <TagInput
                    value={goals}
                    onChange={v => {
                        setGoals(v);
                        setValue('requirements.training_goals', v);
                    }}
                    placeholder="npr. Brzina, Tehnika šuta, Snaga..."
                />
            </FieldWrapper>

            <div className={styles.twoCol}>
                <FieldWrapper label="Trenutni nivo">
                    <select
                        className={styles.select}
                        {...register('requirements.current_level')}
                    >
                        <option value="">— Odaberi nivo —</option>
                        <option value="Početnik">Početnik</option>
                        <option value="Rekreativac">Rekreativac</option>
                        <option value="Poluprofesionalac">Poluprofesionalac</option>
                        <option value="Profesionalac">Profesionalac</option>
                    </select>
                </FieldWrapper>

                <FieldWrapper label="Godine">
                    <input
                        type="number"
                        className={styles.input}
                        {...register('requirements.age')}
                    />
                </FieldWrapper>
            </div>

            <div className={styles.twoCol}>
                <FieldWrapper label="Lokacija">
                    <input
                        className={styles.input}
                        placeholder="npr. Sarajevo"
                        {...register('requirements.training_city')}
                    />
                </FieldWrapper>

                <FieldWrapper label="Budžet (KM/mj)">
                    <input
                        type="number"
                        className={styles.input}
                        placeholder="npr. 300"
                        {...register('requirements.budget_km')}
                    />
                </FieldWrapper>
            </div>

            <FieldWrapper label="Način rada">
                <select
                    className={styles.select}
                    {...register('requirements.training_type')}
                >
                    <option value="">— Odaberi —</option>
                    <option value="Individualno">Individualno</option>
                    <option value="Mala grupa">Mala grupa</option>
                    <option value="Online">Online</option>
                    <option value="Kombinovano">Kombinovano</option>
                </select>
            </FieldWrapper>

            <FieldWrapper label="Opis">
                <textarea
                    rows={4}
                    className={styles.textarea}
                    placeholder="Opiši svoj trenutni nivo i ciljeve..."
                    {...register('requirements.additional_info')}
                />
            </FieldWrapper>
        </>
    );
}

function ReqScoutToAthlete({ register, errors, setValue, getValues, sportName, positions }) {
    const [attributes, setAttributes] = useState(getValues('requirements.key_attributes') || []);
    return (
        <>
            <SectionLabel>Profil igrača koji tražiš</SectionLabel>
            <FieldWrapper label="Tražena pozicija" error={errors.requirements?.position?.message}>
                <PositionLookupSelect
                    register={register}
                    name="requirements.position"
                    rules={{ required: 'Obavezno' }}
                    positions={positions}
                    sportName={sportName}
                    className={styles.select}
                    error={!!errors.requirements?.position}
                />
            </FieldWrapper>
            <div className={styles.twoCol}>
                <FieldWrapper label="Min. godine">
                    <input type="number" className={styles.input} placeholder="npr. 16"
                        {...register('requirements.age_min')} />
                </FieldWrapper>
                <FieldWrapper label="Max. godine">
                    <input type="number" className={styles.input} placeholder="npr. 26"
                        {...register('requirements.age_max')} />
                </FieldWrapper>
            </div>
            <div className={styles.twoCol}>
                <FieldWrapper label="Državljanstvo / Pasoš">
                    <input className={styles.input} placeholder="npr. BiH, EU pasoš (HR)"
                        {...register('requirements.citizenship')} />
                </FieldWrapper>
                <FieldWrapper label="Nivo lige">
                    <select className={styles.select} {...register('requirements.league_level')}>
                        <option value="">— Nivo —</option>
                        <option value="Premijer liga">Premijer liga</option>
                        <option value="Prva liga">Prva liga</option>
                        <option value="Niže kategorije">Niže kategorije</option>
                        <option value="Bilo koji">Bilo koji nivo</option>
                    </select>
                </FieldWrapper>
            </div>
            <FieldWrapper label="Ključni atributi" hint="Enter ili + za dodavanje">
                <TagInput
                    value={attributes}
                    onChange={v => { setAttributes(v); setValue('requirements.key_attributes', v); }}
                    placeholder="npr. Visoka sprint brzina, Čista historija ozljeda..."
                />
            </FieldWrapper>

            <SectionLabel>Kontakt i dokumentacija</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Dostupnost igrača">
                    <select className={styles.select} {...register('requirements.availability')}>
                        <option value="">— Dostupnost —</option>
                        <option value="Odmah slobodan">Odmah slobodan</option>
                        <option value="Na kraju sezone">Na kraju sezone</option>
                        <option value="Po dogovoru">Po dogovoru</option>
                    </select>
                </FieldWrapper>
                <FieldWrapper label="Traženi dokumenti">
                    <input className={styles.input} placeholder="npr. InStat profil, Video"
                        {...register('requirements.required_documents')} />
                </FieldWrapper>
            </div>
            <FieldWrapper label="Napomena" hint="Opcionalno">
                <textarea className={styles.textarea} rows={3}
                    placeholder="npr. Proba na terenu obavezna, kontakt direktno s agentom..."
                    {...register('requirements.agency_note')}
                />
            </FieldWrapper>
        </>
    );
}

const REQ_COMPONENTS = {
    club_athlete: ReqClubAthlete,
    club_coach: ReqClubCoach,
    club_scout: ReqClubScout,

    coach_club: ReqCoachToClub,
    coach_athlete: ReqCoachToAthlete,
    coach_recreational_athlete: ReqCoachToRecreational,

    scout_club: ReqScoutToClub,
    scout_athlete: ReqScoutToAthlete,

    athlete_club: ReqAthleteToClub,
    athlete_scout: ReqAthleteToScout,
    athlete_coach: ReqAthleteToCoach,
};
function StepDetails({ adType, targetRole, register, errors, setValue, getValues, sportName, sports, locations, positions, isLoading }) {
    const ReqComponent = REQ_COMPONENTS[`${adType}_${targetRole}`] ?? null;
    return (
        <div className={styles.stepSection}>
            <p className={styles.stepLead}>Popuni osnovne informacije i specifične uslove oglasa.</p>
            <BasicInfo
                register={register}
                errors={errors}
                sports={sports}
                locations={locations}
                isLoading={isLoading}
            />
            {ReqComponent && (
                <ReqComponent
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    getValues={getValues}
                    sportName={sportName}
                    positions={positions}
                />
            )}
        </div>
    );
}

function StepPreview({ data, adType, targetRole }) {
    const config = TYPE_CONFIG[adType];
    const Icon = config?.Icon;
    const targetLabel = TARGET_OPTIONS[adType]?.find(o => o.value === targetRole)?.label ?? targetRole;
    const targetIcon = TARGET_OPTIONS[adType]?.find(o => o.value === targetRole)?.icon ?? '';

    function renderReqItem(key, val) {
        const label = key.replace(/_/g, ' ');
        if (typeof val === 'boolean') return val ? <li key={key}><strong>✓</strong> {label}</li> : null;
        if (Array.isArray(val)) return val.length > 0 ? val.map((v, i) => <li key={`${key}-${i}`}>{v}</li>) : null;
        if (typeof val === 'object' && val !== null) {
            return Object.entries(val).map(([k, v]) =>
                v ? <li key={k}><strong>{k.replace(/_/g, ' ')}:</strong> {String(v)}</li> : null
            );
        }
        return val ? <li key={key}><strong>{label}:</strong> {String(val)}</li> : null;
    }

    const hasReqs = data.requirements &&
        Object.values(data.requirements).some(v =>
            v !== '' && v !== undefined && v !== false &&
            !(Array.isArray(v) && v.length === 0)
        );

    return (
        <div className={styles.stepSection}>
            <p className={styles.stepLead}>Provjeri sve detalje prije objave oglasa.</p>
            <div className={styles.previewCard} style={{ '--type-color': config?.color, '--type-bg': config?.bg }}>
                <div className={styles.previewHeader}>
                    <div className={styles.previewHeaderTop}>
                        <span className={styles.previewBadge}>
                            {Icon && <Icon size={13} />} {config?.label}
                        </span>
                        <div className={styles.previewTargets}>
                            <span className={styles.previewTargetsLabel}>Namijenjen:</span>
                            <span className={styles.previewTargetChip}>{targetIcon} {targetLabel}</span>
                        </div>
                    </div>
                    <h3 className={styles.previewTitle}>{data.title || '—'}</h3>
                    <div className={styles.previewMeta}>
                        {data.location && <span><MapPin size={13} /> {data.location}</span>}
                        {data.sport && <span><Trophy size={13} /> {data.sport}</span>}
                    </div>
                </div>

                <p className={styles.previewDesc}>{data.description || '—'}</p>

                {hasReqs && (
                    <div className={styles.previewReqs}>
                        <p className={styles.previewReqsLabel}>Uslovi & Detalji</p>
                        <ul>
                            {Object.entries(data.requirements).map(([k, v]) => renderReqItem(k, v))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function CreateAdvertisement() {
    const { user } = useAuth();
    const router = useRouter();
    const { createAdvertisement: createAdvertisementMutation } = useAdvertismentPostMutations(user?.id);

    const [step, setStep] = useState(0);
    const [targetRole, setTargetRole] = useState('');
    const [targetSubmitted, setTargetSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const adType = roleToAdType(user?.role);
    const roleLabel = ROLE_LABELS[adType] ?? '';
    const config = adType ? TYPE_CONFIG[adType] : null;

    const {
        register, handleSubmit, formState: { errors },
        setValue, getValues, trigger, watch,
    } = useForm({
        defaultValues: { title: '', description: '', sport: '', location: '', requirements: {} },
    });

    const formData = watch();
    const selectedSport = watch('sport');
    const { sports, locations, positions, isLoading } = useAdvertisementLookups(selectedSport);

    async function goNext() {
        if (step === 0) {
            setTargetSubmitted(true);
            if (!targetRole) return;
            setStep(1);
            return;
        }
        if (step === 1) {
            const valid = await trigger(['title', 'description', 'sport', 'location']);
            if (valid) setStep(2);
        }
    }

    const ROLE_TO_API = {
        club: 'Klub',
        coach: 'Trener',
        scout: 'Skaut',
        athlete: 'Sportista',
        recreational_athlete: 'Rekreativni sportista',
    };
    async function onSubmit(data) {
        if (!targetRole) {
            toast.error('Odaberi kome je oglas namijenjen.');
            setStep(0);
            return;
        }
        if (!adType) {
            toast.error('Tvoja uloga ne može kreirati oglase.');
            return;
        }
        const apiTargetRole = targetRoleToApi(targetRole);
        if (!apiTargetRole) {
            toast.error('Odabrana uloga nije validna.');
            return;
        }
        setIsSubmitting(true);
        try {
            const payload = {
                title: data.title,
                description: data.description,
                sport: data.sport,
                location: data.location,
                target_roles: [apiTargetRole],
                requirements: data.requirements ?? {},
            };
            createAdvertisementMutation(payload, {
                onSuccess: () => router.push('/market-place'),
                onSettled: () => setIsSubmitting(false),
            });
        } catch {
            toast.error('Greška prilikom kreiranja oglasa.');
            setIsSubmitting(false);
        }
    }

    if (!adType) {
        return (
            <main>
                <Navbar />
                <div className={styles.pageWrapper}>
                    <p className={styles.stepLead}>Tvoja uloga ne može kreirati oglase.</p>
                </div>
            </main>
        );
    }

    return (
        <main>
            <Navbar />
            <div className={styles.pageWrapper}>

                <div className={styles.topBar}>
                    <div className={styles.topBarInner}>
                        <div>
                            <h1 className={styles.pageTitle}>Kreiraj oglas</h1>
                            <p className={styles.roleInfo}>
                                Objavljuješ{' '}
                                <span
                                    className={styles.rolePill}
                                    style={{ '--type-color': config?.color, '--type-bg': config?.bg }}
                                >
                                    {config?.Icon && <config.Icon size={12} />}
                                    {roleLabel}
                                </span>
                                {user?.first_name && (
                                    <span className={styles.roleName}> — {user.first_name}</span>
                                )}
                            </p>
                        </div>
                        <span className={styles.stepCounter}>{step + 1} / {STEPS.length}</span>
                    </div>

                    <div className={styles.progressTrack}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>

                    <div className={styles.stepLabels}>
                        {STEPS.map((label, i) => (
                            <span
                                key={label}
                                className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ''} ${i < step ? styles.stepLabelDone : ''}`}
                            >
                                {i < step && <CheckCircle2 size={12} />} {label}
                            </span>
                        ))}
                    </div>
                </div>

                <form className={styles.formCard} onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.stepTitle}>
                        <span className={styles.stepNum}>{step + 1}</span>
                        <h2>{STEPS[step]}</h2>
                    </div>

                    {step === 0 && (
                        <StepTarget
                            adType={adType}
                            targetRole={targetRole}
                            setTargetRole={setTargetRole}
                            submitted={targetSubmitted}
                        />
                    )}
                    {step === 1 && (
                        <StepDetails
                            adType={adType}
                            targetRole={targetRole}
                            register={register}
                            errors={errors}
                            setValue={setValue}
                            getValues={getValues}
                            sportName={selectedSport}
                            sports={sports}
                            locations={locations}
                            positions={positions}
                            isLoading={isLoading}
                        />
                    )}
                    {step === 2 && (
                        <StepPreview
                            data={formData}
                            adType={adType}
                            targetRole={targetRole}
                        />
                    )}

                    <div className={styles.navRow}>
                        {step > 0 && (
                            <button type="button" className={styles.btnBack} onClick={() => setStep(s => s - 1)}>
                                <ChevronLeft size={17} /> Nazad
                            </button>
                        )}
                        {step < STEPS.length - 1 && (
                            <button type="button" className={styles.btnNext} onClick={goNext}>
                                Dalje <ChevronRight size={17} />
                            </button>
                        )}
                        {step === STEPS.length - 1 && (
                            <button type="submit" className={styles.btnSubmit} disabled={isSubmitting}>
                                {isSubmitting ? 'Objavljivanje...' : 'Objavi oglas'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </main>
    );
}