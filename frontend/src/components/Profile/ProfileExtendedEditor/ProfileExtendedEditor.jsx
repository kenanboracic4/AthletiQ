"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { updateUser } from "@/api/user";
import {
  EMPTY_ACHIEVEMENT,
  EMPTY_CAREER,
  EMPTY_CERT,
  EMPTY_REGION,
  EMPTY_TROPHY,
} from "@/lib/profileHelpers";
import styles from "./ProfileExtendedEditor.module.css";

function ListEditor({ items, setItems, emptyTemplate, renderFields, addLabel }) {
  const addItem = () => setItems([...items, { ...emptyTemplate }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index, field, value) => {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  return (
    <div className={styles.block}>
      {items.map((item, index) => (
        <div key={item.id || index} className={styles.itemCard}>
          <div className={styles.itemHeader}>
            <span>{addLabel} #{index + 1}</span>
            <button type="button" className={styles.removeBtn} onClick={() => removeItem(index)}>
              Ukloni
            </button>
          </div>
          {renderFields(item, index, updateItem)}
        </div>
      ))}
      <button type="button" className={styles.addBtn} onClick={addItem}>
        + {addLabel}
      </button>
    </div>
  );
}

export default function ProfileExtendedEditor({ user, onClose, onSaved }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [careerEntries, setCareerEntries] = useState(user.career_entries || []);
  const [achievements, setAchievements] = useState(user.achievements || []);
  const [trophies, setTrophies] = useState(user.trophies || []);
  const [certifications, setCertifications] = useState(user.certifications || []);
  const [scoutRegions, setScoutRegions] = useState(user.scout_regions || []);
  const [league, setLeague] = useState(user.league || "");
  const [foundedYear, setFoundedYear] = useState(user.founded_year || "");
  const [homeVenue, setHomeVenue] = useState(user.home_venue || "");
  const [matchPreferences, setMatchPreferences] = useState(user.match_preferences || "");
  const [matchFields, setMatchFields] = useState({
    height: user.height ?? "",
    weight: user.weight ?? "",
    dominant_side: user.dominant_side ?? "",
    experience_level: user.experience_level ?? "",
    experience_years: user.experience_years ?? "",
    current_club: user.current_club ?? "",
    preferred_league: user.preferred_league ?? "",
    availability: user.availability ?? "",
    citizenship: user.citizenship ?? "",
    license: user.license ?? "",
    years_exp: user.years_exp ?? "",
    team_category: user.team_category ?? "",
    preferred_club_level: user.preferred_club_level ?? "",
    open_to_relocation: user.open_to_relocation ?? false,
    scouting_type: user.scouting_type ?? "",
    network_level: user.network_level ?? "",
    rec_sport: user.role === "RECREATIONAL_ATHLETE" ? (user.sport ?? "") : "",
    fitness_level: user.fitness_level ?? "",
    age_group: user.age_group ?? "",
    goals: user.goals ?? "",
  });

  const setField = (key, value) =>
    setMatchFields((prev) => ({ ...prev, [key]: value }));

  const numOrNull = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
  const strOrNull = (v) => (v && String(v).trim() ? String(v).trim() : null);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { role: user.role };

      payload.match_preferences = matchPreferences.trim() || null;

      if (user.role === "ATHLETE") {
        payload.height = numOrNull(matchFields.height);
        payload.weight = numOrNull(matchFields.weight);
        payload.dominant_side = strOrNull(matchFields.dominant_side);
        payload.experience_level = strOrNull(matchFields.experience_level);
        payload.experience_years = numOrNull(matchFields.experience_years);
        payload.current_club = strOrNull(matchFields.current_club);
        payload.preferred_league = strOrNull(matchFields.preferred_league);
        payload.availability = strOrNull(matchFields.availability);
        payload.citizenship = strOrNull(matchFields.citizenship);
      }
      if (user.role === "COACH") {
        payload.license = strOrNull(matchFields.license);
        payload.years_exp = numOrNull(matchFields.years_exp);
        payload.team_category = strOrNull(matchFields.team_category);
        payload.preferred_club_level = strOrNull(matchFields.preferred_club_level);
        payload.availability = strOrNull(matchFields.availability);
        payload.open_to_relocation = !!matchFields.open_to_relocation;
      }
      if (user.role === "SCOUT") {
        payload.years_exp = numOrNull(matchFields.years_exp);
        payload.scouting_type = strOrNull(matchFields.scouting_type);
        payload.network_level = strOrNull(matchFields.network_level);
        payload.availability = strOrNull(matchFields.availability);
      }
      if (user.role === "RECREATIONAL_ATHLETE") {
        payload.sport = strOrNull(matchFields.rec_sport);
        payload.fitness_level = strOrNull(matchFields.fitness_level);
        payload.age_group = strOrNull(matchFields.age_group);
        payload.goals = strOrNull(matchFields.goals);
      }

      if (["ATHLETE", "COACH", "RECREATIONAL_ATHLETE"].includes(user.role)) {
        payload.career_entries = careerEntries
          .filter((e) => e.organization && e.role_title && e.start_date)
          .map((e) => ({
            ...e,
            id: e.id || undefined,
            end_date: e.is_current ? null : e.end_date || null,
          }));
      }
      if (user.role === "ATHLETE") {
        payload.achievements = achievements.map((a) => ({
          ...a,
          id: a.id || undefined,
          year: a.year ? Number(a.year) : null,
        }));
      }
      if (user.role === "CLUB") {
        payload.league = league || null;
        payload.founded_year = foundedYear ? Number(foundedYear) : null;
        payload.home_venue = homeVenue || null;
        payload.trophies = trophies.map((t) => ({
          ...t,
          id: t.id || undefined,
          year: t.year ? Number(t.year) : null,
        }));
      }
      if (user.role === "COACH") {
        payload.certifications = certifications.map((c) => ({
          ...c,
          id: c.id || undefined,
          year: c.year ? Number(c.year) : null,
        }));
      }
      if (user.role === "SCOUT") {
        payload.scout_regions = scoutRegions.map((r) => ({
          ...r,
          id: r.id || undefined,
        }));
      }

      await updateUser(payload, user.nickname);
      toast.success("Detalji profila su sačuvani");
      onSaved?.();
      onClose();
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error("Greška prilikom čuvanja detalja");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Detalji profila</h2>
          <button type="button" className={styles.close} onClick={onClose}>×</button>
        </div>

        <div className={styles.body}>
          {user.role !== "ADMIN" && (
            <section>
              <h3>Šta tražiš na berzi (AI preporuke)</h3>
              <p className={styles.hint}>
                Opiši svojim riječima šta tražiš — npr. ciljeve, željenu ligu, lokaciju,
                tip angažmana ili saradnje. Ovaj tekst koristi AI da izračuna koliko ti
                oglasi na berzi odgovaraju.
              </p>
              <textarea
                className={styles.textarea}
                rows={4}
                placeholder="npr. Tražim klub iz Premijer lige u BiH, poziciju napadača, spreman na selidbu..."
                value={matchPreferences}
                onChange={(e) => setMatchPreferences(e.target.value)}
              />
            </section>
          )}

          {user.role === "ATHLETE" && (
            <section>
              <h3>Sportski atributi (za matching)</h3>
              <p className={styles.hint}>
                Ovi podaci se direktno porede sa uslovima oglasa (klubovi, treneri, skauti
                traže npr. poziciju, godine, visinu). Što više popuniš, to su preporuke tačnije.
              </p>
              <div className={styles.fields}>
                <div className={styles.row}>
                  <input className={styles.input} type="number" placeholder="Visina (cm)" value={matchFields.height} onChange={(e) => setField("height", e.target.value)} />
                  <input className={styles.input} type="number" placeholder="Težina (kg)" value={matchFields.weight} onChange={(e) => setField("weight", e.target.value)} />
                </div>
                <div className={styles.row}>
                  <select className={styles.input} value={matchFields.dominant_side} onChange={(e) => setField("dominant_side", e.target.value)}>
                    <option value="">Dominantna noga/ruka</option>
                    <option value="Lijeva">Lijeva</option>
                    <option value="Desna">Desna</option>
                    <option value="Obje">Obje</option>
                  </select>
                  <input className={styles.input} type="number" placeholder="Godine iskustva" value={matchFields.experience_years} onChange={(e) => setField("experience_years", e.target.value)} />
                </div>
                <input className={styles.input} placeholder="Nivo iskustva (npr. Senior, Juniori, Amater)" value={matchFields.experience_level} onChange={(e) => setField("experience_level", e.target.value)} />
                <input className={styles.input} placeholder="Trenutni klub" value={matchFields.current_club} onChange={(e) => setField("current_club", e.target.value)} />
                <input className={styles.input} placeholder="Željena liga / nivo" value={matchFields.preferred_league} onChange={(e) => setField("preferred_league", e.target.value)} />
                <input className={styles.input} placeholder="Državljanstvo" value={matchFields.citizenship} onChange={(e) => setField("citizenship", e.target.value)} />
                <input className={styles.input} placeholder="Dostupnost (npr. odmah, od ljeta)" value={matchFields.availability} onChange={(e) => setField("availability", e.target.value)} />
              </div>
            </section>
          )}

          {user.role === "COACH" && (
            <section>
              <h3>Trenerski atributi (za matching)</h3>
              <p className={styles.hint}>
                Klubovi u oglasima traže licencu, godine iskustva i kategoriju tima — popuni ih za tačnije preporuke.
              </p>
              <div className={styles.fields}>
                <div className={styles.row}>
                  <input className={styles.input} placeholder="Licenca (npr. UEFA A)" value={matchFields.license} onChange={(e) => setField("license", e.target.value)} />
                  <input className={styles.input} type="number" placeholder="Godine iskustva" value={matchFields.years_exp} onChange={(e) => setField("years_exp", e.target.value)} />
                </div>
                <input className={styles.input} placeholder="Kategorija tima (npr. Seniori, U17)" value={matchFields.team_category} onChange={(e) => setField("team_category", e.target.value)} />
                <input className={styles.input} placeholder="Željeni nivo kluba" value={matchFields.preferred_club_level} onChange={(e) => setField("preferred_club_level", e.target.value)} />
                <input className={styles.input} placeholder="Dostupnost" value={matchFields.availability} onChange={(e) => setField("availability", e.target.value)} />
                <label className={styles.check}>
                  <input type="checkbox" checked={!!matchFields.open_to_relocation} onChange={(e) => setField("open_to_relocation", e.target.checked)} />
                  Spreman na selidbu
                </label>
              </div>
            </section>
          )}

          {user.role === "SCOUT" && (
            <section>
              <h3>Skautski atributi (za matching)</h3>
              <p className={styles.hint}>
                Klubovi traže tip skautinga, mrežu kontakata i iskustvo.
              </p>
              <div className={styles.fields}>
                <input className={styles.input} type="number" placeholder="Godine iskustva" value={matchFields.years_exp} onChange={(e) => setField("years_exp", e.target.value)} />
                <input className={styles.input} placeholder="Tip skautinga (npr. terenski, video)" value={matchFields.scouting_type} onChange={(e) => setField("scouting_type", e.target.value)} />
                <input className={styles.input} placeholder="Nivo mreže kontakata (npr. lokalni, regionalni)" value={matchFields.network_level} onChange={(e) => setField("network_level", e.target.value)} />
                <input className={styles.input} placeholder="Dostupnost" value={matchFields.availability} onChange={(e) => setField("availability", e.target.value)} />
              </div>
            </section>
          )}

          {user.role === "RECREATIONAL_ATHLETE" && (
            <section>
              <h3>Atributi za matching</h3>
              <p className={styles.hint}>
                Treneri nude programe prema sportu, nivou kondicije i uzrastu.
              </p>
              <div className={styles.fields}>
                <input className={styles.input} placeholder="Sport" value={matchFields.rec_sport} onChange={(e) => setField("rec_sport", e.target.value)} />
                <input className={styles.input} placeholder="Nivo kondicije (npr. početnik, napredni)" value={matchFields.fitness_level} onChange={(e) => setField("fitness_level", e.target.value)} />
                <input className={styles.input} placeholder="Uzrasna grupa (npr. 25-35)" value={matchFields.age_group} onChange={(e) => setField("age_group", e.target.value)} />
                <input className={styles.input} placeholder="Ciljevi (npr. mršavljenje, kondicija)" value={matchFields.goals} onChange={(e) => setField("goals", e.target.value)} />
              </div>
            </section>
          )}

          {["ATHLETE", "COACH", "RECREATIONAL_ATHLETE"].includes(user.role) && (
            <section>
              <h3>Karijera</h3>
              <ListEditor
                items={careerEntries}
                setItems={setCareerEntries}
                emptyTemplate={EMPTY_CAREER}
                addLabel="Stavka karijere"
                renderFields={(item, index, update) => (
                  <div className={styles.fields}>
                    <input className={styles.input} placeholder="Uloga / pozicija" value={item.role_title} onChange={(e) => update(index, "role_title", e.target.value)} />
                    <input className={styles.input} placeholder="Klub / organizacija" value={item.organization} onChange={(e) => update(index, "organization", e.target.value)} />
                    <input className={styles.input} placeholder="Lokacija" value={item.location || ""} onChange={(e) => update(index, "location", e.target.value)} />
                    <div className={styles.row}>
                      <input className={styles.input} type="date" value={item.start_date || ""} onChange={(e) => update(index, "start_date", e.target.value)} />
                      <input className={styles.input} type="date" value={item.end_date || ""} disabled={item.is_current} onChange={(e) => update(index, "end_date", e.target.value)} />
                    </div>
                    <label className={styles.check}>
                      <input type="checkbox" checked={!!item.is_current} onChange={(e) => update(index, "is_current", e.target.checked)} />
                      Trenutno zaposlenje / angažman
                    </label>
                    <textarea className={styles.textarea} rows={2} placeholder="Opis" value={item.description || ""} onChange={(e) => update(index, "description", e.target.value)} />
                  </div>
                )}
              />
            </section>
          )}

          {user.role === "ATHLETE" && (
            <section>
              <h3>Dostignuća</h3>
              <ListEditor
                items={achievements}
                setItems={setAchievements}
                emptyTemplate={EMPTY_ACHIEVEMENT}
                addLabel="Dostignuće"
                renderFields={(item, index, update) => (
                  <div className={styles.fields}>
                    <input className={styles.input} placeholder="Naslov" value={item.title} onChange={(e) => update(index, "title", e.target.value)} />
                    <input className={styles.input} type="number" placeholder="Godina" value={item.year || ""} onChange={(e) => update(index, "year", e.target.value)} />
                    <textarea className={styles.textarea} rows={2} placeholder="Opis" value={item.description || ""} onChange={(e) => update(index, "description", e.target.value)} />
                  </div>
                )}
              />
            </section>
          )}

          {user.role === "CLUB" && (
            <>
              <section>
                <h3>Informacije o klubu</h3>
                <div className={styles.fields}>
                  <input className={styles.input} placeholder="Liga / takmičenje" value={league} onChange={(e) => setLeague(e.target.value)} />
                  <input className={styles.input} type="number" placeholder="Godina osnivanja" value={foundedYear} onChange={(e) => setFoundedYear(e.target.value)} />
                  <input className={styles.input} placeholder="Domaći teren / stadion" value={homeVenue} onChange={(e) => setHomeVenue(e.target.value)} />
                </div>
              </section>
              <section>
                <h3>Trofeji</h3>
                <ListEditor
                  items={trophies}
                  setItems={setTrophies}
                  emptyTemplate={EMPTY_TROPHY}
                  addLabel="Trofej"
                  renderFields={(item, index, update) => (
                    <div className={styles.fields}>
                      <input className={styles.input} placeholder="Naziv trofeja" value={item.title} onChange={(e) => update(index, "title", e.target.value)} />
                      <input className={styles.input} placeholder="Takmičenje" value={item.competition || ""} onChange={(e) => update(index, "competition", e.target.value)} />
                      <input className={styles.input} type="number" placeholder="Godina" value={item.year || ""} onChange={(e) => update(index, "year", e.target.value)} />
                    </div>
                  )}
                />
              </section>
            </>
          )}

          {user.role === "COACH" && (
            <section>
              <h3>Certifikati i licence</h3>
              <ListEditor
                items={certifications}
                setItems={setCertifications}
                emptyTemplate={EMPTY_CERT}
                addLabel="Certifikat"
                renderFields={(item, index, update) => (
                  <div className={styles.fields}>
                    <input className={styles.input} placeholder="Naziv certifikata" value={item.title} onChange={(e) => update(index, "title", e.target.value)} />
                    <input className={styles.input} placeholder="Izdavač" value={item.issuer || ""} onChange={(e) => update(index, "issuer", e.target.value)} />
                    <input className={styles.input} type="number" placeholder="Godina" value={item.year || ""} onChange={(e) => update(index, "year", e.target.value)} />
                  </div>
                )}
              />
            </section>
          )}

          {user.role === "SCOUT" && (
            <section>
              <h3>Regije praćenja</h3>
              <ListEditor
                items={scoutRegions}
                setItems={setScoutRegions}
                emptyTemplate={EMPTY_REGION}
                addLabel="Regija"
                renderFields={(item, index, update) => (
                  <input className={styles.input} placeholder="npr. Sarajevo, Hercegovina" value={item.region_name} onChange={(e) => update(index, "region_name", e.target.value)} />
                )}
              />
            </section>
          )}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancel} onClick={onClose}>Odustani</button>
          <button type="button" className={styles.save} onClick={handleSave} disabled={saving}>
            {saving ? "Čuvanje..." : "Sačuvaj detalje"}
          </button>
        </div>
      </div>
    </div>
  );
}
