import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { queryKeys } from "@/lib/queryKeys";
import { createApplication, getApplicationsByAdvertisement, deleteApplication, acceptApplicationStatus, rejectApplicationStatus, getMyApplications } from "@/api/application";

export const useApplication = (advertisementId) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { mutate: createApplicationFn, isPending: isLoading } = useMutation({
        mutationFn: (data) => createApplication(data),
        onSuccess: () => {
            toast.success('Prijava uspješno kreirana!');

            queryClient.invalidateQueries({ queryKey: queryKeys.applications(advertisementId) });
        },
        onError: (error) => {
            const serverMessage = error.response?.data?.detail || "Greška prilikom slanja prijave!";
            toast.error(serverMessage);
        },
    });

    const { data: applications } = useQuery({

        queryKey: queryKeys.applications(advertisementId),

        queryFn: () => getApplicationsByAdvertisement(advertisementId),
        enabled: !!advertisementId,
    });

    const { mutate: deleteApplicationFn, isPending: isDeleting } = useMutation({
        mutationFn: (applicationId) => deleteApplication(applicationId),
        onSuccess: () => {
            toast.success('Prijava uspješno obrisana!');
            queryClient.invalidateQueries({ queryKey: queryKeys.applications(advertisementId) });
        },
        onError: (error) => {
            const serverMessage = error.response?.data?.detail || "Greška prilikom brisanja prijave!";
            toast.error(serverMessage);
        },
    });

    const { mutate: deleteMyApplicationFn, isPending: isDeletingMy } = useMutation({
        mutationFn: (applicationId) => deleteApplication(applicationId),
        onSuccess: () => {
            toast.success('Prijava uspješno povučena!');
            queryClient.invalidateQueries({ queryKey: queryKeys.myApplications });
        },
        onError: (error) => {
            const serverMessage = error.response?.data?.detail || "Greška prilikom povlačenja prijave!";
            toast.error(serverMessage);
        },
    });

    const { mutate: acceptApplicationStatusFn, isPending: isAccepting } = useMutation({
        mutationFn: (data) => acceptApplicationStatus(data),
        onSuccess: () => {
            toast.success('Prijava uspješno ažurirana!');

            queryClient.invalidateQueries({
                queryKey: queryKeys.applications(advertisementId)
            });
        },
        onError: (error) => {
            const serverMessage = error.response?.data?.detail || "Greška prilikom ažuriranja prijave!";
            toast.error(serverMessage);
        },
    });

    const { mutate: rejectApplicationStatusFn, isPending: isRejecting } = useMutation({
        mutationFn: (data) => rejectApplicationStatus(data),
        onSuccess: () => {
            toast.success('Prijava uspješno odbijena!');

            queryClient.invalidateQueries({
                queryKey: queryKeys.applications(advertisementId)
            });
        },
        onError: (error) => {
            const serverMessage = error.response?.data?.detail || "Greška prilikom odbijanja prijave!";
            toast.error(serverMessage);
        },
    });

    const { data: myApplications, isLoading: isLoadingMyApplications } = useQuery({
        queryKey: queryKeys.myApplications,
        queryFn: () => getMyApplications(),
        enabled: !!user?.id,
    });

    return {
        createApplicationFn, isLoading,
        deleteApplicationFn, isDeleting,
        applications,
        acceptApplicationStatusFn, isAccepting,
        rejectApplicationStatusFn, isRejecting,
        myApplications, isLoadingMyApplications,
        deleteMyApplicationFn, isDeletingMy
    };
};