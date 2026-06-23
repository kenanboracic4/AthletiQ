"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
    MapPin, Plus, Send, MoreHorizontal, Camera,
    UserPlus, UserCheck, UserX, Clock, Lock, Globe
} from "lucide-react";
import styles from "./UserProfileCard.module.css";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { handleFollow } from "@/api/follow";
import FollowersModal from "@/components/FollowersModal/FollowersModal";
import { useUser } from "@/hooks/User";
import { useFriendRequest } from "@/hooks/FriendRequest";
import { useChat } from '@/hooks/Chat';
import { getRealUser } from "@/api/user";

const ROLE_BANNERS = {
    ATHLETE: "linear-gradient(135deg, #1a237e 0%, #3949ab 100%)",
    RECREATIONAL_ATHLETE: "linear-gradient(135deg, #059669 0%, #0891b2 100%)",
    CLUB: "linear-gradient(135deg, #dc2626 0%, #9f1239 100%)",
    COACH: "linear-gradient(135deg, #b45309 0%, #92400e 100%)",
    SCOUT: "linear-gradient(135deg, #374151 0%, #111827 100%)",
};

function HandleRole(role) {
    switch (role) {
        case "ATHLETE": return "Sportista";
        case "RECREATIONAL_ATHLETE": return "Rekreativni sportista";
        case "CLUB": return "Klub";
        case "COACH": return "Trener";
        case "SCOUT": return "Skaut";
        default: return role;
    }
}
export default function UserProfileCard({ user }) {
    const { user: loggedInUser, isLoading } = useAuth();
    const { submitProfileUpdate, submitFollow, submitPrivacy, uploadCoverImageFn } = useUser();
    const {
        sendRequestFn, acceptRequestFn, declineRequestFn, cancelRequestFn, removeFriendFn,
        isSending, isAccepting, isDeclining, isCancelling, isRemoving,
    } = useFriendRequest(user?.nickname);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [followerType, setFollowerType] = useState("");
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showMoreModal, setShowMoreModal] = useState(false);
    const [userData, setUserData] = useState(user);
    const [friendStatus, setFriendStatus] = useState(user?.friendship_status ?? "none");
    const [isPrivate, setIsPrivate] = useState(user?.is_private ?? false);
    const [previewImage, setPreviewImage] = useState(user.image ?? "/no-profile-picture.png");
    const [imageFile, setImageFile] = useState(null);
    const [previewCover, setPreviewCover] = useState(user.cover_image ?? null);
    const [coverImageFile, setCoverImageFile] = useState(null);
    const [coverUploading, setCoverUploading] = useState(false);
    const router = useRouter();
    const { createChatAsync, isCreating } = useChat();

    const { register, handleSubmit, formState: { errors } } = useForm();

    const handleMessageClick = async () => {
        if (!loggedInUser) return;

        const second_user = await getRealUser(user.nickname);
        const data = {
            advertisment_id: null,
            first_user_id: loggedInUser?.id,
            second_user_id: second_user?.id,
        };
        console.log(second_user);
        console.log(data);

        try {
            const newChat = await createChatAsync(data);
            router.push(`/chat/${newChat.id}`);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        setUserData(user);
        setFriendStatus(user?.friendship_status ?? "none");
        setIsPrivate(user?.is_private ?? false);
        setPreviewCover(user?.cover_image ?? null);
    }, [user]);

    useEffect(() => {
        setIsOwnProfile(loggedInUser?.nickname === user?.nickname);
    }, [loggedInUser, user, isLoading]);

    const friendActionInProgress = isSending || isAccepting || isDeclining || isCancelling || isRemoving;

    const handleFriendAction = () => {
        if (!loggedInUser) {
            router.push("/login");
            return;
        }
        const nick = user?.nickname;

        if (friendStatus === "none") {
            sendRequestFn(nick, { onSuccess: () => setFriendStatus("request_sent") });
        } else if (friendStatus === "request_sent") {
            cancelRequestFn(nick, { onSuccess: () => setFriendStatus("none") });
        } else if (friendStatus === "request_received") {
            acceptRequestFn(nick, { onSuccess: () => setFriendStatus("friends") });
        } else if (friendStatus === "friends") {
            removeFriendFn(nick, { onSuccess: () => setFriendStatus("none") });
        }
    };

    const handleDeclineFriend = () => {
        declineRequestFn(user?.nickname, { onSuccess: () => setFriendStatus("none") });
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setPreviewImage(URL.createObjectURL(file));
    };

    const handleCoverChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverImageFile(file);
        setPreviewCover(URL.createObjectURL(file));
        e.target.value = "";
    };

    const handleCoverUploadNow = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !isOwnProfile) return;
        e.target.value = "";

        setCoverUploading(true);
        setPreviewCover(URL.createObjectURL(file));

        try {
            const formData = new FormData();
            formData.append("file", file);
            const uploadRes = await uploadCoverImageFn({ formData, nick: user.nickname });
            setUserData((prev) => ({ ...prev, cover_image: uploadRes.cover_image }));
            setPreviewCover(uploadRes.cover_image);
            toast.success("Pozadina profila je ažurirana");
            router.refresh();
        } catch {
            setPreviewCover(userData?.cover_image ?? user?.cover_image ?? null);
            toast.error("Greška prilikom uploada pozadine");
        } finally {
            setCoverUploading(false);
        }
    };

    const onSubmit = async (data) => {
        if (isPrivate !== (user?.is_private ?? false)) {
            await submitPrivacy(isPrivate);
        }
        await submitProfileUpdate(data, user, imageFile, coverImageFile);
        setShowEditModal(false);
        setCoverImageFile(null);
    };

    const displayCover = previewCover || userData?.cover_image || user?.cover_image;
    const bannerGradient = ROLE_BANNERS[user.role] || ROLE_BANNERS.ATHLETE;

    const handleFollowClick = () => {
        submitFollow(user?.nickname, userData, setUserData);
    };

    if (!user) return null;
    const actionsNode = (isLoading && !loggedInUser) ? (
        <div className={styles.actions}>
            <div style={{ width: 100, height: 34, borderRadius: 4, background: "#f3f4f6" }} />
        </div>
    ) : isOwnProfile ? (
        <div className={styles.actions}>
            <button className={styles.btnPrimary} onClick={() => setShowEditModal(true)}>
                <Plus size={15} strokeWidth={2.5} /> Uredi profil
            </button>
            <button className={styles.btnMore} onClick={() => setShowMoreModal(true)}>
                <MoreHorizontal size={18} />
            </button>
        </div>
    ) : (
        <div className={styles.actions}>
            {user.is_private ? (
                friendStatus === "friends" ? (
                    <button onClick={handleFriendAction} className={styles.btnOutline} disabled={friendActionInProgress}>
                        <UserCheck size={15} strokeWidth={2.5} /> Prijatelji
                    </button>
                ) : friendStatus === "request_sent" ? (
                    <button onClick={handleFriendAction} className={styles.btnOutline} disabled={friendActionInProgress}>
                        <Clock size={15} strokeWidth={2.5} /> Zahtjev poslan
                    </button>
                ) : friendStatus === "request_received" ? (
                    <>
                        <button onClick={handleFriendAction} className={styles.btnPrimary} disabled={friendActionInProgress}>
                            <UserCheck size={15} strokeWidth={2.5} /> Prihvati zahtjev
                        </button>
                        <button onClick={handleDeclineFriend} className={styles.btnOutline} disabled={friendActionInProgress}>
                            <UserX size={15} strokeWidth={2.5} /> Odbij
                        </button>
                    </>
                ) : (
                    <button onClick={handleFriendAction} className={styles.btnPrimary} disabled={friendActionInProgress}>
                        <UserPlus size={15} strokeWidth={2.5} /> Dodaj prijatelja
                    </button>
                )
            ) : (
                userData?.is_following ? (
                    <button onClick={handleFollowClick} className={styles.btnOutline}>
                        <Plus size={15} strokeWidth={2.5} /> Otprati
                    </button>
                ) : (
                    <button onClick={handleFollowClick} className={styles.btnPrimary}>
                        <Plus size={15} strokeWidth={2.5} /> Zaprati
                    </button>
                )
            )}
            <button
                className={styles.btnOutline}
                onClick={handleMessageClick}
                disabled={isCreating}
            >
                <Send size={13} strokeWidth={2} />
                {isCreating ? 'Učitavanje...' : 'Poruka'}
            </button>
            <button className={styles.btnMore}><MoreHorizontal size={18} /></button>
        </div>
    );

    return (
        <div className={styles.card}>
            <div
                className={styles.banner}
                style={!displayCover ? { background: bannerGradient } : undefined}
            >
                {displayCover && (
                    <img src={displayCover} alt="" className={styles.bannerImage} />
                )}
                <div className={styles.bannerOverlay} />
                <div className={styles.bannerGrid} />
                {isOwnProfile && (
                    <>
                        <label
                            htmlFor="cover-upload-banner"
                            className={`${styles.bannerEditBtn} ${coverUploading ? styles.bannerEditBtnBusy : ""}`}
                        >
                            <Camera size={15} />
                            {coverUploading ? "Upload..." : "Promijeni pozadinu"}
                        </label>
                        <input
                            id="cover-upload-banner"
                            type="file"
                            accept="image/*"
                            className={styles.hiddenInput}
                            disabled={coverUploading}
                            onChange={handleCoverUploadNow}
                        />
                    </>
                )}
            </div>

            <div className={styles.body}>
                <div className={styles.avatarRow}>
                    <img
                        src={user.image ?? "/no-profile-picture.png"}
                        alt={user.nickname}
                        className={styles.avatar}
                    />
                </div>

                <div className={styles.nameActionsRow}>
                    <div className={styles.nameLine}>
                        <h1 className={styles.name}>{user?.full_name || user?.club_name || user?.nickname}</h1>
                        <p className={styles.roleName}>{HandleRole(user?.role)}</p>
                    </div>
                    {actionsNode}
                </div>

                <p className={styles.nickname}>
                    @{user.nickname}
                    {user.is_private && (
                        <span className={styles.privateBadge}>
                            <Lock size={11} /> Privatni
                        </span>
                    )}
                </p>

                {user.location && (
                    <div className={styles.locationRow}>
                        <MapPin size={14} />
                        <span>{user.location}</span>
                    </div>
                )}

                {(user.sport?.name || user.position?.name || user.league) && (
                    <div className={styles.detailPills}>
                        {user.sport?.name && <span className={styles.pill}>{user.sport.name}</span>}
                        {user.position?.name && <span className={styles.pill}>{user.position.name}</span>}
                        {user.league && <span className={styles.pill}>{user.league}</span>}
                    </div>
                )}

                <div className={styles.statsBar}>
                    <div className={styles.statItem} onClick={() => { setFollowerType("followers"); setShowFollowersModal(true); }}>
                        <span className={styles.statNumber}>{userData.followers_count ?? 0}</span>
                        <span className={styles.statLabel}>Pratioci</span>
                    </div>
                    <div className={styles.statItem} onClick={() => { setFollowerType("following"); setShowFollowersModal(true); }}>
                        <span className={styles.statNumber}>{userData.following_count ?? 0}</span>
                        <span className={styles.statLabel}>Prati</span>
                    </div>
                </div>
            </div>

            {showEditModal && (
                <div className={styles.overlay} onClick={() => setShowEditModal(false)}>
                    <div className={styles.modalBig} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Uredi profil</h2>
                            <button className={styles.modalClose} onClick={() => setShowEditModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className={styles.modalBody}>

                                <div className={styles.coverUpload}>
                                    <label className={styles.fieldLabel}>Pozadinska slika</label>
                                    <div
                                        className={styles.coverPreview}
                                        style={!previewCover ? { background: bannerGradient } : undefined}
                                    >
                                        {previewCover && (
                                            <img src={previewCover} alt="Pozadina profila" className={styles.coverPreviewImg} />
                                        )}
                                        <label htmlFor="cover-upload-modal" className={styles.coverOverlay}>
                                            <Camera size={18} />
                                            <span>Promijeni pozadinu</span>
                                        </label>
                                        <input
                                            id="cover-upload-modal"
                                            type="file"
                                            accept="image/*"
                                            className={styles.hiddenInput}
                                            onChange={handleCoverChange}
                                        />
                                    </div>
                                    {coverImageFile && <p className={styles.coverFileName}>{coverImageFile.name}</p>}
                                </div>

                                <div className={styles.avatarUpload}>
                                    <div className={styles.avatarPreview}>
                                        <img src={previewImage ?? "/no-profile-picture.png"} alt="Profilna" className={styles.avatarPreviewImg} />
                                        <label htmlFor="avatar-upload" className={styles.avatarOverlay}>
                                            <Camera size={18} />
                                            <span>Promijeni</span>
                                        </label>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            style={{ display: "none" }}
                                            onChange={handleImageChange}
                                        />
                                    </div>
                                    {imageFile && <p className={styles.avatarFileName}>{imageFile.name}</p>}
                                </div>

                                {user.role !== "CLUB" && (
                                    <div className={styles.privacyRow}>
                                        <div className={styles.privacyInfo}>
                                            <span className={styles.privacyIcon}>
                                                {isPrivate ? <Lock size={16} /> : <Globe size={16} />}
                                            </span>
                                            <div>
                                                <p className={styles.privacyTitle}>{isPrivate ? "Privatni profil" : "Javni profil"}</p>
                                                <p className={styles.privacyHint}>
                                                    {isPrivate
                                                        ? "Samo prijatelji mogu slati zahtjev i vidjeti tvoje objave."
                                                        : "Svako te može zapratiti i vidjeti tvoj profil."}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className={`${styles.toggle} ${isPrivate ? styles.toggleOn : ""}`}
                                            onClick={() => setIsPrivate((prev) => !prev)}
                                            aria-pressed={isPrivate}
                                        >
                                            <span className={styles.toggleKnob} />
                                        </button>
                                    </div>
                                )}

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Nickname</label>
                                    <input className={styles.fieldInput} type="text" defaultValue={user.nickname} placeholder="@nickname"
                                        {...register("nickname", { minLength: { value: 3, message: "Nickname mora imati najmanje 3 znaka" } })} />
                                    {errors.nickname && <span className={styles.fieldError}>{errors.nickname.message}</span>}
                                </div>

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Email</label>
                                    <input className={styles.fieldInput} type="text" defaultValue={user.email} placeholder="email@primjer.ba"
                                        {...register("email", { pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Email nije validan" } })} />
                                    {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
                                </div>

                                {user.role === "ATHLETE" && (<>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Puno ime</label><input className={styles.fieldInput} type="text" defaultValue={user.full_name} placeholder="Ime i prezime" {...register("full_name")} /></div>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Datum rođenja</label><input className={styles.fieldInput} type="date" defaultValue={user.birth_date} {...register("birth_date")} /></div>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Lokacija</label><input className={styles.fieldInput} type="text" defaultValue={user.location} placeholder="npr. Sarajevo, BiH" {...register("location")} /></div>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Bio</label><textarea className={styles.fieldInput} defaultValue={user.bio} placeholder="Kratko o sebi..." rows={3} {...register("bio", { maxLength: { value: 500, message: "Bio ne može biti duži od 500 znakova" } })} />{errors.bio && <span className={styles.fieldError}>{errors.bio.message}</span>}</div>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Visina (cm)</label><input className={styles.fieldInput} type="number" defaultValue={user.height} placeholder="npr. 182" {...register("height", { min: { value: 100, message: "Min 100 cm" }, max: { value: 250, message: "Max 250 cm" } })} />{errors.height && <span className={styles.fieldError}>{errors.height.message}</span>}</div>
                                </>)}

                                {user.role === "COACH" && (<>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Puno ime</label><input className={styles.fieldInput} type="text" defaultValue={user.full_name} placeholder="Ime i prezime" {...register("full_name")} /></div>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Filozofija</label><textarea className={styles.fieldInput} defaultValue={user.philosophy} placeholder="Vaša trenerska filozofija..." rows={3} {...register("philosophy", { maxLength: { value: 500, message: "Max 500 znakova" } })} />{errors.philosophy && <span className={styles.fieldError}>{errors.philosophy.message}</span>}</div>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Iskustvo</label><textarea className={styles.fieldInput} defaultValue={user.experience} placeholder="Opišite vaše iskustvo..." rows={3} {...register("experience")} /></div>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Kontakt broj</label><input className={styles.fieldInput} type="tel" defaultValue={user.contact_number} placeholder="+387 61 000 000" {...register("contact_number", { pattern: { value: /^[+]?[0-9\s\-]{7,15}$/, message: "Broj telefona nije validan" } })} />{errors.contact_number && <span className={styles.fieldError}>{errors.contact_number.message}</span>}</div>
                                </>)}

                                {user.role === "CLUB" && (<>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Naziv kluba</label><input className={styles.fieldInput} type="text" defaultValue={user.club_name} placeholder="Naziv kluba" {...register("club_name")} /></div>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Lokacija</label><input className={styles.fieldInput} type="text" defaultValue={user.location} placeholder="npr. Sarajevo, BiH" {...register("location")} /></div>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Opis kluba</label><textarea className={styles.fieldInput} defaultValue={user.description} placeholder="Kratki opis kluba..." rows={3} {...register("description", { maxLength: { value: 500, message: "Max 500 znakova" } })} />{errors.description && <span className={styles.fieldError}>{errors.description.message}</span>}</div>
                                </>)}

                                {user.role === "SCOUT" && (<>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Puno ime</label><input className={styles.fieldInput} type="text" defaultValue={user.full_name} placeholder="Ime i prezime" {...register("full_name")} /></div>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Organizacija</label><input className={styles.fieldInput} type="text" defaultValue={user.organization} placeholder="Naziv organizacije" {...register("organization")} /></div>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Tražena pozicija</label><input className={styles.fieldInput} type="text" defaultValue={user.sought_position} placeholder="npr. Napadač, Golman..." {...register("sought_position")} /></div>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Kontakt broj</label><input className={styles.fieldInput} type="tel" defaultValue={user.contact_number} placeholder="+387 61 000 000" {...register("contact_number", { pattern: { value: /^[+]?[0-9\s\-]{7,15}$/, message: "Broj telefona nije validan" } })} />{errors.contact_number && <span className={styles.fieldError}>{errors.contact_number.message}</span>}</div>
                                </>)}

                                {user.role === "RECREATIONAL_ATHLETE" && (<>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Puno ime</label><input className={styles.fieldInput} type="text" defaultValue={user.full_name} placeholder="Ime i prezime" {...register("full_name")} /></div>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Lokacija</label><input className={styles.fieldInput} type="text" defaultValue={user.location} placeholder="npr. Sarajevo, BiH" {...register("location")} /></div>
                                    <div className={styles.fieldGroup}><label className={styles.fieldLabel}>Opis</label><textarea className={styles.fieldInput} defaultValue={user.description} placeholder="Kratko o sebi..." rows={3} {...register("description", { maxLength: { value: 500, message: "Max 500 znakova" } })} />{errors.description && <span className={styles.fieldError}>{errors.description.message}</span>}</div>
                                </>)}

                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.btnCancel} onClick={() => setShowEditModal(false)}>Odustani</button>
                                <button type="submit" className={styles.btnSave}>Sačuvaj promjene</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showFollowersModal && (
                <FollowersModal
                    nickname={user.nickname}
                    onClose={() => setShowFollowersModal(false)}
                    type={followerType}
                    count={followerType === "followers" ? userData.followers_count : userData.following_count}
                    handleUnfollow={handleFollowClick}
                />
            )}

            {showMoreModal && (
                <div className={styles.overlay} onClick={() => setShowMoreModal(false)}>
                    <div className={styles.modalBig} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2 className={styles.modalTitle}>Opcije</h2>
                            <button className={styles.modalClose} onClick={() => setShowMoreModal(false)}>×</button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Email</label>
                                <input className={styles.fieldInput} type="text" value={user?.email} disabled />
                            </div>
                            <div className={styles.fieldGroup}>
                                <label className={styles.fieldLabel}>Podijeli profil</label>
                                <input className={styles.fieldInput} type="text" value={`https://sportapp.ba/profile/${user.nickname}`} disabled />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.btnCancel} onClick={() => setShowMoreModal(false)}>Zatvori</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}