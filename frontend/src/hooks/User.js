import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { queryKeys } from "@/lib/queryKeys";
import { getUserByNickname, updateUser, getSuggestedPeople, getSuggestedClubs, uploadProfileImage, uploadCoverImage, getUserPosts, updatePrivacy } from "@/api/user";
import { handleFollow } from "@/api/follow";
import { useRouter } from "next/navigation";

export const useUser = (nickname = '', userId = null, offset = 0, limit = 10) => {
    const { user, updateAuthUser } = useAuth();
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: suggestedPeople, isLoading: isLoadingSuggestedPeople } = useQuery({
        queryKey: queryKeys.suggestedPeople,
        queryFn: () => getSuggestedPeople(1, 5, false),
        enabled: !!user?.id,
    });

    const { data: suggestedClubs, isLoading: isLoadingSuggestedClubs } = useQuery({
        queryKey: queryKeys.suggestedClubs,
        queryFn: () => getSuggestedClubs(1, 5),
        enabled: !!user?.id,
    });

    const { data: profileUser, isLoading: isLoadingProfile } = useQuery({
        queryKey: queryKeys.userProfile(nickname),
        queryFn: () => getUserByNickname(nickname),
        enabled: !!nickname,

    });

    const { data: userPosts, isLoading: isLoadingUserPosts } = useQuery({
        queryKey: queryKeys.userPosts(nickname, offset, limit),
        queryFn: () => getUserPosts(nickname, offset, limit),
        enabled: !!nickname,
    });

    const { mutateAsync: updateUserFn } = useMutation({
        mutationFn: ({ payload, nick }) => updateUser(payload, nick),
        onSuccess: () => {
            queryClient.invalidateQueries(queryKeys.userProfile(nickname));
        },
        onError: () => {
            toast.error("Greška prilikom ažuriranja profila");
        },
    });

    const { mutateAsync: uploadImageFn } = useMutation({
        mutationFn: ({ formData, nick }) => uploadProfileImage(formData, nick),
        onError: () => {
            toast.error("Greška prilikom uploada slike");
        },
    });

    const { mutateAsync: uploadCoverImageFn } = useMutation({
        mutationFn: ({ formData, nick }) => uploadCoverImage(formData, nick),
        onError: () => {
            toast.error("Greška prilikom uploada pozadine");
        },
    });

    const { mutate: followUserFn } = useMutation({
        mutationFn: (nick) => handleFollow(nick),
        onError: (error) => {
            const message = error?.response?.data?.detail || error?.message;
            toast.error(message);
        },
    });

    const { mutateAsync: updatePrivacyFn } = useMutation({
        mutationFn: (isPrivate) => updatePrivacy(isPrivate),
        onError: (error) => {
            const message = error?.response?.data?.detail || "Greška prilikom promjene privatnosti";
            toast.error(message);
        },
    });

    const submitProfileUpdate = async (data, currentUser, imageFile, coverImageFile) => {
        try {
            const cleaned = Object.fromEntries(
                Object.entries(data).filter(([, val]) => val !== "" && val !== null && val !== undefined)
            );

            if (imageFile) {
                const formData = new FormData();
                formData.append("file", imageFile);
                const uploadRes = await uploadImageFn({ formData, nick: currentUser.nickname });
                cleaned.image = uploadRes.image;
            }

            if (coverImageFile) {
                const formData = new FormData();
                formData.append("file", coverImageFile);
                const uploadRes = await uploadCoverImageFn({ formData, nick: currentUser.nickname });
                cleaned.cover_image = uploadRes.cover_image;
            }

            const payload = { role: currentUser.role, ...cleaned };
            await updateUserFn({ payload, nick: currentUser.nickname });

            updateAuthUser(cleaned);
            toast.success("Profil je uspješno ažuriran");

            if (cleaned.nickname && cleaned.nickname !== currentUser.nickname) {
                router.push(`/profile/${cleaned.nickname}`);
            } else {
                router.refresh();
            }
        } catch (e) {
            console.log(e);
            toast.error("Greška prilikom ažuriranja profila");
        }
    };

    const submitFollowSuggested = (targetNickname, currentData, onSuccess) => {
        if (!user) {
            router.push("/login");
            return;
        }
        followUserFn(targetNickname, {
            onSuccess: (data) => {
                toast.success(data.detail);
                onSuccess?.(data);
            },
        });
    };

    const submitFollow = (targetNickname, userData, setUserData) => {
        if (!user) {
            router.push("/login");
            return;
        }
        followUserFn(targetNickname, {
            onSuccess: (data) => {
                toast.success(data.detail);
                const isNowFollowing = data.status === "follow";
                setUserData({
                    ...userData,
                    is_following: isNowFollowing,
                    followers_count: isNowFollowing
                        ? userData.followers_count + 1
                        : Math.max(0, userData.followers_count - 1),
                });
                router.refresh();
            },
        });
    };

    const submitPrivacy = async (isPrivate) => {
        try {
            await updatePrivacyFn(isPrivate);
            return true;
        } catch (e) {
            return false;
        }
    };

    return {
        suggestedPeople,
        isLoadingSuggestedPeople,
        suggestedClubs,
        isLoadingSuggestedClubs,
        profileUser,
        isLoadingProfile,
        submitProfileUpdate,
        uploadCoverImageFn,
        submitFollow,
        submitFollowSuggested,
        submitPrivacy,
        userPosts,
        isLoadingUserPosts
    };
};