'use client'

import { useForm } from 'react-hook-form'
import { useMutation } from "@tanstack/react-query"
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import AuthShell from '@/components/Auth/AuthShell'
import styles from './Login.module.css'
import toast from 'react-hot-toast'

function NicknameIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
    )
}

function PasswordIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}

export default function Login() {
    const { login } = useAuth()
    const router = useRouter()

    const { register, handleSubmit, formState: { errors } } = useForm()

    const mutation = useMutation({
        mutationFn: login,
        onSuccess: () => {
            toast.success("Uspješno ste se prijavili!")
            setTimeout(() => {
                router.push('/feed')
            }, 1000)
        },
        onError: (error) => {
            const detail = error?.response?.data?.detail
            toast.error(detail || "Greška prilikom prijave")
        }
    })

    const onSubmit = (data) => {
        mutation.mutate(data)
    }

    return (
        <AuthShell
            title="Dobrodošao"
            titleAccent="natrag na teren."
            lead="Prijavi se i nastavi pratiti klubove, oglase i ljude iz svoje sportske zajednice."
            stats={["Objave", "Berza", "Chat", "Profil"]}
        >
            <div className={styles.logo}>AthletiQ</div>
            <div className={styles.subtitle}>Prijavite se na vaš profil</div>

            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Nadimak</label>
                        <div className={styles.inputWrapper}>
                            <input
                                className={[styles.input, errors.nickname ? styles.inputError : ''].join(' ')}
                                {...register("nickname", {
                                    required: "Nadimak je obavezan",
                                })}
                                placeholder="Unesite vaš nadimak"
                            />
                            <span className={styles.inputIcon}>
                                <NicknameIcon />
                            </span>
                        </div>
                        {errors.nickname && <p className={styles.error}>{errors.nickname.message}</p>}
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
                            <span className={styles.inputIcon}>
                                <PasswordIcon />
                            </span>
                        </div>
                        {errors.password && <p className={styles.error}>{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? "Prijava..." : "Prijavi se"}
                    </button>
                </form>

                <div className={styles.divider} />

                <button
                    type="button"
                    className={styles.registerBtn}
                    onClick={() => router.push('/register')}
                >
                    Registruj se
                </button>
        </AuthShell>
    )
}