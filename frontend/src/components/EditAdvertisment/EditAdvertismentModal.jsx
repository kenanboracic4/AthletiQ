'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, MapPin, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAdvertismentPostMutations } from '@/hooks/AdvertismentPostMutation';
import { roleToToken } from '@/lib/adRoleMapping';
import { useAdvertisementLookups } from '@/hooks/Lookup';
import { LookupSelect, LocationLookupInput, PositionLookupSelect } from '@/components/LookupSelect/LookupSelect';
import styles from './EditAdvertisementModal.module.css';

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
        <p className={styles.sectionLabel}>{children}</p>
    );
}

function ReqAthleteToClub({ register, errors, setValue, getValues, sportName, positions }) {
    const [highlights, setHighlights] = useState(getValues('requirements.highlights') || []);
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
                    <input type="number" className={styles.input} {...register('requirements.age', { required: 'Obavezno' })} />
                </FieldWrapper>
            </div>
            <div className={styles.twoCol}>
                <FieldWrapper label="Visina (cm)">
                    <input type="number" className={styles.input} {...register('requirements.height_cm')} />
                </FieldWrapper>
                <FieldWrapper label="Težina (kg)">
                    <input type="number" className={styles.input} {...register('requirements.weight_kg')} />
                </FieldWrapper>
            </div>
            <FieldWrapper label="Dominantna noga/ruka">
                <select className={styles.select} {...register('requirements.dominant_side')}>
                    <option value="">— Odaberi —</option>
                    <option value="Desna">Desna</option>
                    <option value="Lijeva">Lijeva</option>
                    <option value="Obje">Obje</option>
                </select>
            </FieldWrapper>
            <SectionLabel>Karijera</SectionLabel>
            <FieldWrapper label="Trenutni klub">
                <input className={styles.input} placeholder="npr. FK Sarajevo" {...register('requirements.current_club')} />
            </FieldWrapper>
            <FieldWrapper label="Dosadašnje iskustvo">
                <textarea rows={4} className={styles.textarea} placeholder="Klubovi, lige, nastupi..." {...register('requirements.experience')} />
            </FieldWrapper>
            <FieldWrapper label="Najveći uspjesi">
                <TagInput value={highlights} onChange={v => { setHighlights(v); setValue('requirements.highlights', v); }} placeholder="npr. Reprezentacija U19" />
            </FieldWrapper>
            <SectionLabel>Dostupnost</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Status">
                    <select className={styles.select} {...register('requirements.availability')}>
                        <option value="">— Status —</option>
                        <option value="Slobodan igrač">Slobodan igrač</option>
                        <option value="Ističe ugovor">Ističe ugovor</option>
                        <option value="Transfer moguć">Transfer moguć</option>
                    </select>
                </FieldWrapper>
                <FieldWrapper label="Preferirana liga">
                    <input className={styles.input} placeholder="npr. Premijer liga BiH" {...register('requirements.preferred_league')} />
                </FieldWrapper>
            </div>
            <FieldWrapper label="Video / Transfermarkt / Wyscout link">
                <input className={styles.input} placeholder="https://..." {...register('requirements.profile_link')} />
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
                    <input type="number" className={styles.input} placeholder="npr. 18" {...register('requirements.age_min', { required: 'Obavezno', min: { value: 14, message: 'Min 14' } })} />
                </FieldWrapper>
                <FieldWrapper label="Max. godine" error={errors.requirements?.age_max?.message}>
                    <input type="number" className={styles.input} placeholder="npr. 32" {...register('requirements.age_max', { required: 'Obavezno' })} />
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
                    <input type="number" className={styles.input} placeholder="npr. 180" {...register('requirements.height_min_cm')} />
                </FieldWrapper>
            </div>
            <FieldWrapper label="Min. iskustvo" error={errors.requirements?.min_experience?.message}>
                <input className={styles.input} placeholder="npr. 2 sezone u prvoj ligi" {...register('requirements.min_experience', { required: 'Obavezno' })} />
            </FieldWrapper>
            <SectionLabel>Finansijski uslovi</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Raspon plate (KM/mj.)">
                    <input className={styles.input} placeholder="npr. 1500 – 2500" {...register('requirements.salary_range_km')} />
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
                <TagInput value={attachments} onChange={v => { setAttachments(v); setValue('requirements.mandatory_attachments', v); }} placeholder="npr. InStat profil, Video kompilacija..." />
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
                <select className={`${styles.select} ${errors.requirements?.license ? styles.inputError : ''}`} {...register('requirements.license', { required: 'Obavezno' })}>
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
                    <input type="number" className={styles.input} placeholder="npr. 5" {...register('requirements.min_years_exp', { required: 'Obavezno' })} />
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
                <TagInput value={certs} onChange={v => { setCerts(v); setValue('requirements.required_certifications', v); }} placeholder="npr. Goalkeeping cert..." />
            </FieldWrapper>
            <SectionLabel>Uslovi zaposlenja</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Raspon plate (KM/mj.)">
                    <input className={styles.input} placeholder="npr. 2000 – 3500" {...register('requirements.salary_range_km')} />
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
                <input className={styles.input} placeholder="npr. 3+ godine u strukturi kluba" {...register('requirements.scouting_exp', { required: 'Obavezno' })} />
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
                <TagInput value={regions} onChange={v => { setRegions(v); setValue('requirements.coverage_regions', v); }} placeholder="npr. Balkans, Eastern Europe..." />
            </FieldWrapper>
            <SectionLabel>Kompenzacija</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Naknada">
                    <input className={styles.input} placeholder="npr. €500/mj + % od transfera" {...register('requirements.compensation')} />
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
                <select className={`${styles.select} ${errors.requirements?.license ? styles.inputError : ''}`} {...register('requirements.license', { required: 'Obavezno' })}>
                    <option value="">— Licenca —</option>
                    <option value="UEFA Pro">UEFA Pro</option>
                    <option value="UEFA A">UEFA A</option>
                    <option value="UEFA B">UEFA B</option>
                    <option value="UEFA C">UEFA C</option>
                </select>
            </FieldWrapper>
            <div className={styles.twoCol}>
                <FieldWrapper label="Godine iskustva" error={errors.requirements?.years_exp?.message}>
                    <input type="number" className={styles.input} placeholder="npr. 10" {...register('requirements.years_exp', { required: 'Obavezno' })} />
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
                <TagInput value={achievements} onChange={v => { setAchievements(v); setValue('requirements.career_achievements', v); }} placeholder="npr. Prvak FBiH 2022..." />
            </FieldWrapper>
            <SectionLabel>Uslovi koji te zanimaju</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Očekivana plata (KM/mj.)">
                    <input className={styles.input} placeholder="npr. 2500+" {...register('requirements.expected_salary_km')} />
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
                    <input className={styles.input} placeholder="npr. 4 sedmice (5x tjedno)" {...register('requirements.program_duration', { required: 'Obavezno' })} />
                </FieldWrapper>
                <FieldWrapper label="Max. veličina grupe" error={errors.requirements?.max_group_size?.message}>
                    <input type="number" className={styles.input} placeholder="npr. 6" {...register('requirements.max_group_size', { required: 'Obavezno' })} />
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
                    <input className={styles.input} placeholder="npr. Tereni Koševo" {...register('requirements.training_location')} />
                </FieldWrapper>
            </div>
            <FieldWrapper label="Šta je uključeno" hint="Enter ili + za dodavanje">
                <TagInput value={services} onChange={v => { setServices(v); setValue('requirements.included_services', v); }} placeholder="npr. Video analiza..." />
            </FieldWrapper>
            <SectionLabel>Cijena</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Cijena po igraču (KM)" error={errors.requirements?.price_per_player_km?.message}>
                    <input type="number" className={styles.input} placeholder="npr. 350" {...register('requirements.price_per_player_km', { required: 'Obavezno' })} />
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
                    <input className={styles.input} placeholder="npr. 8 sedmica" {...register('requirements.program_duration', { required: 'Obavezno' })} />
                </FieldWrapper>
                <FieldWrapper label="Max. broj polaznika" error={errors.requirements?.max_group_size?.message}>
                    <input type="number" className={styles.input} placeholder="npr. 12" {...register('requirements.max_group_size', { required: 'Obavezno' })} />
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
                <TagInput value={services} onChange={v => { setServices(v); setValue('requirements.included_services', v); }} placeholder="npr. Oprema, Plan ishrane..." />
            </FieldWrapper>
            <SectionLabel>Cijena i termini</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Cijena (KM/mj.)" error={errors.requirements?.price_per_player_km?.message}>
                    <input type="number" className={styles.input} placeholder="npr. 150" {...register('requirements.price_per_player_km', { required: 'Obavezno' })} />
                </FieldWrapper>
                <FieldWrapper label="Termini treninga">
                    <input className={styles.input} placeholder="npr. Pon/Sri/Pet – 18:00" {...register('requirements.training_schedule')} />
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
                <input type="number" className={styles.input} placeholder="npr. 7" {...register('requirements.years_exp', { required: 'Obavezno' })} />
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
                <TagInput value={regions} onChange={v => { setRegions(v); setValue('requirements.coverage_regions', v); }} placeholder="npr. Balkans, Western Europe..." />
            </FieldWrapper>
            <FieldWrapper label="Karijerni uspjesi" hint="Enter ili + za dodavanje">
                <TagInput value={achievements} onChange={v => { setAchievements(v); setValue('requirements.career_achievements', v); }} placeholder="npr. Otkrio igrača koji igra u Bundesligi..." />
            </FieldWrapper>
            <SectionLabel>Uslovi koji te zanimaju</SectionLabel>
            <div className={styles.twoCol}>
                <FieldWrapper label="Očekivana kompenzacija">
                    <input className={styles.input} placeholder="npr. €800/mj + % od transfera" {...register('requirements.expected_compensation')} />
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
    const [strengths, setStrengths] = useState(getValues('requirements.key_strengths') || []);
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
                    <input type="number" className={styles.input} {...register('requirements.age', { required: 'Obavezno' })} />
                </FieldWrapper>
            </div>
            <div className={styles.twoCol}>
                <FieldWrapper label="Visina (cm)">
                    <input type="number" className={styles.input} {...register('requirements.height_cm')} />
                </FieldWrapper>
                <FieldWrapper label="Državljanstvo">
                    <input className={styles.input} placeholder="npr. Bosna i Hercegovina" {...register('requirements.citizenship')} />
                </FieldWrapper>
            </div>
            <FieldWrapper label="Ključne kvalitete" hint="Enter ili + za dodavanje">
                <TagInput value={strengths} onChange={v => { setStrengths(v); setValue('requirements.key_strengths', v); }} placeholder="npr. Brzina, Duel igra..." />
            </FieldWrapper>
            <FieldWrapper label="Dosadašnje iskustvo">
                <textarea rows={4} className={styles.textarea} placeholder="Klubovi, lige, reprezentacija..." {...register('requirements.experience')} />
            </FieldWrapper>
            <SectionLabel>Materijali za pregled</SectionLabel>
            <FieldWrapper label="Video link">
                <input className={styles.input} placeholder="YouTube, Vimeo..." {...register('requirements.video_link')} />
            </FieldWrapper>
            <FieldWrapper label="Transfermarkt / Wyscout / InStat">
                <input className={styles.input} placeholder="https://..." {...register('requirements.profile_link')} />
            </FieldWrapper>
            <FieldWrapper label="Karijerni cilj">
                <textarea rows={3} className={styles.textarea} placeholder="Šta tražiš i gdje želiš napredovati?" {...register('requirements.career_goal')} />
            </FieldWrapper>
        </>
    );
}

function ReqAthleteToCoach({ register, errors, setValue, getValues }) {
    const [goals, setGoals] = useState(getValues('requirements.training_goals') || []);
    return (
        <>
            <SectionLabel>Šta želiš unaprijediti?</SectionLabel>
            <FieldWrapper label="Ciljevi treninga" hint="Enter ili + za dodavanje">
                <TagInput value={goals} onChange={v => { setGoals(v); setValue('requirements.training_goals', v); }} placeholder="npr. Brzina, Tehnika šuta, Snaga..." />
            </FieldWrapper>
            <div className={styles.twoCol}>
                <FieldWrapper label="Trenutni nivo">
                    <select className={styles.select} {...register('requirements.current_level')}>
                        <option value="">— Odaberi nivo —</option>
                        <option value="Početnik">Početnik</option>
                        <option value="Rekreativac">Rekreativac</option>
                        <option value="Poluprofesionalac">Poluprofesionalac</option>
                        <option value="Profesionalac">Profesionalac</option>
                    </select>
                </FieldWrapper>
                <FieldWrapper label="Godine">
                    <input type="number" className={styles.input} {...register('requirements.age')} />
                </FieldWrapper>
            </div>
            <div className={styles.twoCol}>
                <FieldWrapper label="Lokacija">
                    <input className={styles.input} placeholder="npr. Sarajevo" {...register('requirements.training_city')} />
                </FieldWrapper>
                <FieldWrapper label="Budžet (KM/mj)">
                    <input type="number" className={styles.input} placeholder="npr. 300" {...register('requirements.budget_km')} />
                </FieldWrapper>
            </div>
            <FieldWrapper label="Način rada">
                <select className={styles.select} {...register('requirements.training_type')}>
                    <option value="">— Odaberi —</option>
                    <option value="Individualno">Individualno</option>
                    <option value="Mala grupa">Mala grupa</option>
                    <option value="Online">Online</option>
                    <option value="Kombinovano">Kombinovano</option>
                </select>
            </FieldWrapper>
            <FieldWrapper label="Opis">
                <textarea rows={4} className={styles.textarea} placeholder="Opiši svoj trenutni nivo i ciljeve..." {...register('requirements.additional_info')} />
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
                    <input type="number" className={styles.input} placeholder="npr. 16" {...register('requirements.age_min')} />
                </FieldWrapper>
                <FieldWrapper label="Max. godine">
                    <input type="number" className={styles.input} placeholder="npr. 26" {...register('requirements.age_max')} />
                </FieldWrapper>
            </div>
            <div className={styles.twoCol}>
                <FieldWrapper label="Državljanstvo / Pasoš">
                    <input className={styles.input} placeholder="npr. BiH, EU pasoš (HR)" {...register('requirements.citizenship')} />
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
                <TagInput value={attributes} onChange={v => { setAttributes(v); setValue('requirements.key_attributes', v); }} placeholder="npr. Visoka sprint brzina..." />
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
                    <input className={styles.input} placeholder="npr. InStat profil, Video" {...register('requirements.required_documents')} />
                </FieldWrapper>
            </div>
            <FieldWrapper label="Napomena" hint="Opcionalno">
                <textarea className={styles.textarea} rows={3} placeholder="npr. Proba na terenu obavezna..." {...register('requirements.agency_note')} />
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

export default function EditAdvertisementModal({ isOpen, onClose, ad }) {
    const { updateAdvertisement } = useAdvertismentPostMutations();

    const adType = roleToToken(ad?.creator?.role);
    const targetRole = roleToToken(ad?.target_roles?.[0]);
    const reqKey = `${adType}_${targetRole}`;
    const ReqComponent = REQ_COMPONENTS[reqKey] ?? null;

    const { register, handleSubmit, reset, setValue, getValues, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            title: ad?.title ?? '',
            description: ad?.description ?? '',
            sport: ad?.sport ?? '',
            location: ad?.location ?? '',
            requirements: ad?.requirements ?? {},
        },
    });

    useEffect(() => {
        if (ad) {
            reset({
                title: ad.title ?? '',
                description: ad.description ?? '',
                sport: ad.sport ?? '',
                location: ad.location ?? '',
                requirements: ad.requirements ?? {},
            });
        }
    }, [ad, reset]);

    const selectedSport = watch('sport');
    const { sports, locations, positions, isLoading } = useAdvertisementLookups(selectedSport);

    if (!isOpen) return null;

    function onSubmit(data) {
        updateAdvertisement({ id: ad.id, ...data });
        onClose();
    }

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>

                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>Uredi oglas</h2>
                        <p className={styles.subtitle}>{ad?.title}</p>
                    </div>
                    <button className={styles.closeBtn} type="button" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <form className={styles.body} onSubmit={handleSubmit(onSubmit)}>

                    <div className={styles.section}>
                        <p className={styles.sectionTitle}>Osnovne informacije</p>

                        <FieldWrapper label="Naslov oglasa" error={errors.title?.message} hint="Kratko, jasno, upadljivo.">
                            <input
                                className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                                {...register('title', {
                                    required: 'Naslov je obavezan',
                                    minLength: { value: 10, message: 'Minimalno 10 karaktera' },
                                })}
                            />
                        </FieldWrapper>

                        <FieldWrapper label="Opis" error={errors.description?.message}>
                            <textarea
                                rows={5}
                                className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
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

                            <FieldWrapper label="Lokacija" error={errors.location?.message}>
                                <div className={styles.inputIcon}>
                                    <MapPin size={16} />
                                    <LocationLookupInput
                                        register={register}
                                        name="location"
                                        rules={{ required: 'Lokacija je obavezna' }}
                                        locations={locations}
                                        listId="edit-ad-location-options"
                                        placeholder={isLoading ? 'Učitavanje...' : 'npr. Sarajevo'}
                                        className={styles.input}
                                        error={!!errors.location}
                                    />
                                </div>
                            </FieldWrapper>
                        </div>
                    </div>

                    {ReqComponent && (
                        <div className={styles.section}>
                            <p className={styles.sectionTitle}>Zahtjevi i detalji</p>
                            <ReqComponent
                                register={register}
                                errors={errors}
                                setValue={setValue}
                                getValues={getValues}
                                sportName={selectedSport}
                                positions={positions}
                            />
                        </div>
                    )}

                    <div className={styles.footer}>
                        <button type="button" className={styles.btnCancel} onClick={onClose}>
                            Odustani
                        </button>
                        <button type="submit" className={styles.btnSave} disabled={isSubmitting}>
                            {isSubmitting ? 'Čuvanje...' : 'Sačuvaj izmjene'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}