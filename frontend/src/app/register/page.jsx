'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from "@tanstack/react-query"
import { registerUser } from "../../api/auth"
import toast from 'react-hot-toast'
import AuthShell from '@/components/Auth/AuthShell'
import styles from './Register.module.css'
import { useRouter } from 'next/navigation';
import { getSports } from '@/api/sports'
import { getPositionsBySport } from '@/api/positions'

function StepIndicator({ current, total }) {
    return (
        <div className={styles.stepIndicator}>
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className={[
                        styles.stepDot,
                        i + 1 === current ? styles.stepDotActive : '',
                        i + 1 < current ? styles.stepDotDone : ''
                    ].join(' ')} />
                    {i < total - 1 && (
                        <div className={[
                            styles.stepConnector,
                            i + 1 < current ? styles.stepConnectorDone : ''
                        ].join(' ')} />
                    )}
                </div>
            ))}
        </div>
    )
}

function parseBackendError(error) {
    if (!error) return "Greška prilikom registracije"

    const data = error?.response?.data ?? error?.data

    if (data) {
        if (typeof data === 'string') return data
        if (typeof data === 'object') {
            if (data.detail) return typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)
            if (data.message) return data.message
            if (data.error) return data.error
        }
    }

    if (error?.message) return error.message

    return "Greška prilikom registracije"
}

function classifyError(message) {
    const msg = message.toLowerCase()
    if (msg.includes('nadimak') || msg.includes('nadimkom') || msg.includes('nickname') || msg.includes('username')) {
        return 'nickname'
    }
    if (msg.includes('email')) {
        return 'email'
    }
    return null
}

export default function Register() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [sportIdpar, setSportId] = useState(null)
    const { register, watch, trigger, handleSubmit, formState: { errors }, setError } = useForm()
    const role = watch('role')
    const sportId = watch('sport_id')

    const { data: sports } = useQuery({
        queryKey: ['sports'],
        queryFn: getSports,
    })

    const { data: positions } = useQuery({
        queryKey: ['positions', sportIdpar],
        queryFn: () => getPositionsBySport(sportIdpar),
        enabled: !!sportIdpar,
    })

    const mutation = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            setTimeout(() => {
                toast.success("Registracija je uspješna")
                router.push('/login')
            }, 1500);
        },
        onError: (error) => {
            const message = parseBackendError(error)
            toast.error(message)

            const field = classifyError(message)
            if (field === 'nickname' || field === 'email') {
                setStep(1)
                setError(field, { type: 'server', message })
            }
        }
    })

    useEffect(() => {
        if (sportId) {
            setSportId(sportId)
        }
    }, [sportId])

    const handleNext = async (fields) => {
        const isValid = await trigger(fields)
        if (isValid) setStep(s => s + 1)
    }

    const onSubmit = (data) => {
        mutation.mutate(data)
    }

    return (
        <AuthShell
            title="Postani dio"
            titleAccent="sportske mreže."
            lead="Registracija traje par minuta. Izaberi ulogu, sport i lokaciju — i odmah si u toku sa zajednicom."
            stats={["Sportista", "Trener", "Klub", "Skaut"]}
        >
            <div className={styles.logo}>AthletiQ</div>
            <div className={styles.subtitle}>Kreirajte vaš profil</div>

            <StepIndicator current={step} total={3} />

            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>

                {step === 1 && (
                    <div className={styles.form}>
                        <div className={styles.stepTitle}>Osnovni podaci</div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Nadimak</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    className={[styles.input, errors.nickname ? styles.inputError : ''].join(' ')}
                                    {...register("nickname", { required: "Nadimak je obavezan" })}
                                    placeholder="Unesite vaš nadimak"
                                />
                            </div>
                            {errors.nickname && <p className={styles.error}>{errors.nickname.message}</p>}
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Email</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    className={[styles.input, errors.email ? styles.inputError : ''].join(' ')}
                                    {...register("email", {
                                        required: "Email je obavezan",
                                        pattern: { value: /^\S+@\S+\.\S+$/, message: "Neispravan format emaila" }
                                    })}
                                    placeholder="Unesite vaš email"
                                />
                            </div>
                            {errors.email && <p className={styles.error}>{errors.email.message}</p>}
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Lozinka</label>
                            <div className={styles.inputWrapper}>
                                <input
                                    className={[styles.input, errors.password ? styles.inputError : ''].join(' ')}
                                    {...register("password", {
                                        required: "Lozinka je obavezna",
                                        minLength: { value: 6, message: "Minimum 6 karaktera" }
                                    })}
                                    type="password"
                                    placeholder="Unesite vašu lozinku"
                                />
                            </div>
                            {errors.password && <p className={styles.error}>{errors.password.message}</p>}
                        </div>

                        <button
                            type="button"
                            className={styles.btnNext}
                            onClick={() => handleNext(["nickname", "email", "password"])}
                        >
                            Dalje →
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className={styles.form}>
                        <div className={styles.stepTitle}>Odabir uloge</div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.label}>Uloga</label>
                            <select
                                className={styles.select}
                                {...register("role", { required: "Obavezan je odabir uloge" })}
                            >
                                <option value="">Odaberi ulogu...</option>
                                <option value="ATHLETE">Sportista</option>
                                <option value="RECREATIONAL_ATHLETE">Rekreativni sportista</option>
                                <option value="SCOUT">Skaut</option>
                                <option value="CLUB">Klub</option>
                                <option value="COACH">Trener</option>
                            </select>
                            {errors.role && <p className={styles.error}>{errors.role.message}</p>}
                        </div>

                        <div className={styles.btnRow}>
                            <button type="button" className={styles.btnBack} onClick={() => setStep(1)}>← Nazad</button>
                            <button type="button" className={styles.btnNext} onClick={() => handleNext(["role"])}>Dalje →</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className={styles.form}>
                        <div className={styles.stepTitle}>Podaci profila</div>

                        {role === "ATHLETE" && (
                            <>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Ime i prezime</label>
                                    <input className={styles.input} {...register("full_name", { required: "Ime je obavezno" })} placeholder="Ime i prezime" />
                                    {errors.full_name && <p className={styles.error}>{errors.full_name.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Datum rođenja</label>
                                    <input className={styles.input} {...register("birth_date", { required: "Datum je obavezan" })} type="date" />
                                    {errors.birth_date && <p className={styles.error}>{errors.birth_date.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Lokacija</label>
                                    <input className={styles.input} {...register("location", { required: "Lokacija je obavezna", minLength: { value: 3, message: "Minimalno 3 karaktera" } })} placeholder="Lokacija" />
                                    {errors.location && <p className={styles.error}>{errors.location.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Visina (cm)</label>
                                    <input className={styles.input} {...register("height", { min: { value: 50, message: "Minimalna visina je 50 cm" }, max: { value: 250, message: "Maksimalna visina je 250 cm" } })} type="number" placeholder="Visina (cm)" />
                                    {errors.height && <p className={styles.error}>{errors.height.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Sport</label>
                                    <select
                                        className={styles.select}
                                        {...register("sport_id", { required: "Obavezan je odabir sporta" })}
                                    >
                                        <option value="">Odaberi sport...</option>
                                        {sports && sports.map((sport) => (
                                            <option key={sport.id} value={sport.id}>{sport.name}</option>
                                        ))}
                                    </select>
                                    {errors.sport_id && <p className={styles.error}>{errors.sport_id.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Pozicija</label>
                                    <select className={styles.select} {...register("position_id", { required: "Obavezan je odabir pozicije" })}>
                                        <option value="">Odaberi poziciju...</option>
                                        {positions && positions.map((position) => (
                                            <option key={position.id} value={position.id}>{position.name}</option>
                                        ))}
                                    </select>
                                    {errors.position_id && <p className={styles.error}>{errors.position_id.message}</p>}
                                </div>
                            </>
                        )}

                        {role === "COACH" && (
                            <>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Ime i prezime</label>
                                    <input className={styles.input} {...register("full_name", { required: "Ime je obavezno" })} placeholder="Ime i prezime" />
                                    {errors.full_name && <p className={styles.error}>{errors.full_name.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Sport</label>
                                    <select
                                        className={styles.select}
                                        {...register("sport_id", { required: "Obavezan je odabir sporta" })}
                                    >
                                        <option value="">Odaberi sport...</option>
                                        {sports && sports.map((sport) => (
                                            <option key={sport.id} value={sport.id}>{sport.name}</option>
                                        ))}
                                    </select>
                                    {errors.sport_id && <p className={styles.error}>{errors.sport_id.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Filozofija treniranja</label>
                                    <input className={styles.input} {...register("philosophy", { required: "Filozofija je obavezna" })} placeholder="Filozofija treniranja" />
                                    {errors.philosophy && <p className={styles.error}>{errors.philosophy.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Iskustvo</label>
                                    <input className={styles.input} {...register("experience", { required: "Iskustvo je obavezno" })} placeholder="Iskustvo" />
                                    {errors.experience && <p className={styles.error}>{errors.experience.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Broj telefona</label>
                                    <input className={styles.input} {...register("contact_number", { required: "Broj telefona je obavezan" })} placeholder="Broj telefona" />
                                    {errors.contact_number && <p className={styles.error}>{errors.contact_number.message}</p>}
                                </div>
                            </>
                        )}

                        {role === "SCOUT" && (
                            <>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Ime i prezime</label>
                                    <input className={styles.input} {...register("full_name", { required: "Ime je obavezno" })} placeholder="Ime i prezime" />
                                    {errors.full_name && <p className={styles.error}>{errors.full_name.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Organizacija</label>
                                    <input className={styles.input} {...register("organization", { required: "Organizacija je obavezna" })} placeholder="Organizacija" />
                                    {errors.organization && <p className={styles.error}>{errors.organization.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Sport</label>
                                    <select
                                        className={styles.select}
                                        {...register("sport_id", { required: "Obavezan je odabir sporta" })}
                                    >
                                        <option value="">Odaberi sport...</option>
                                        {sports && sports.map((sport) => (
                                            <option key={sport.id} value={sport.id}>{sport.name}</option>
                                        ))}
                                    </select>
                                    {errors.sport_id && <p className={styles.error}>{errors.sport_id.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Tražena pozicija</label>
                                    <input className={styles.input} {...register("sought_position", { required: "Tražena pozicija je obavezna" })} placeholder="Tražena pozicija" />
                                    {errors.sought_position && <p className={styles.error}>{errors.sought_position.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Broj telefona</label>
                                    <input className={styles.input} {...register("contact_number", { required: "Broj telefona je obavezan" })} placeholder="Broj telefona" />
                                    {errors.contact_number && <p className={styles.error}>{errors.contact_number.message}</p>}
                                </div>
                            </>
                        )}

                        {role === "CLUB" && (
                            <>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Naziv kluba</label>
                                    <input className={styles.input} {...register("club_name", { required: "Naziv kluba je obavezan" })} placeholder="Naziv kluba" />
                                    {errors.club_name && <p className={styles.error}>{errors.club_name.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Sport</label>
                                    <select
                                        className={styles.select}
                                        {...register("sport_id", { required: "Obavezan je odabir sporta" })}
                                    >
                                        <option value="">Odaberi sport...</option>
                                        {sports && sports.map((sport) => (
                                            <option key={sport.id} value={sport.id}>{sport.name}</option>
                                        ))}
                                    </select>
                                    {errors.sport_id && <p className={styles.error}>{errors.sport_id.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Lokacija</label>
                                    <input className={styles.input} {...register("location", { required: "Lokacija je obavezna" })} placeholder="Lokacija" />
                                    {errors.location && <p className={styles.error}>{errors.location.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Opis</label>
                                    <input className={styles.input} {...register("description", { required: "Opis je obavezan" })} placeholder="Opis" />
                                    {errors.description && <p className={styles.error}>{errors.description.message}</p>}
                                </div>
                            </>
                        )}

                        {role === "RECREATIONAL_ATHLETE" && (
                            <>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Ime i prezime</label>
                                    <input className={styles.input} {...register("full_name", { required: "Ime je obavezno" })} placeholder="Ime i prezime" />
                                    {errors.full_name && <p className={styles.error}>{errors.full_name.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Lokacija</label>
                                    <input className={styles.input} {...register("location", { required: "Lokacija je obavezna" })} placeholder="Lokacija" />
                                    {errors.location && <p className={styles.error}>{errors.location.message}</p>}
                                </div>
                                <div className={styles.fieldGroup}>
                                    <label className={styles.label}>Opis</label>
                                    <input className={styles.input} {...register("description", { required: "Opis je obavezan" })} placeholder="Opis" />
                                    {errors.description && <p className={styles.error}>{errors.description.message}</p>}
                                </div>
                            </>
                        )}

                        <div className={styles.btnRow}>
                            <button type="button" className={styles.btnBack} onClick={() => setStep(2)}>← Nazad</button>
                            <button type="submit" className={styles.btnNext} disabled={mutation.isPending}>
                                {mutation.isPending ? "Slanje..." : "Registruj se"}
                            </button>
                        </div>
                    </div>
                )}

            </form>
        </AuthShell>
    )
}