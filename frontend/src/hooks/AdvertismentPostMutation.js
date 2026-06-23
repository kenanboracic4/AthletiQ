import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

import { createAdvertisment, deleteAdvertisment, updateAdvertisment, getMyAdvertisments } from "@/api/adverisment";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { queryKeys } from "@/lib/queryKeys";
import { useRouter } from "next/navigation";

export const useAdvertismentPostMutations = () => {

    const { user } = useAuth();
    const router = useRouter();
    const queryClient = useQueryClient();

    const { mutate: createAdvertisement } = useMutation({
        mutationFn: (data) => createAdvertisment(data),
        onSuccess: () => {
            toast.success('Oglas uspješno kreiran!');
            queryClient.invalidateQueries(queryKeys.advertisements);
        },
        onError: (error) => {
            const serverMessage = error.response?.data?.detail || "Greška prilikom kreiranja oglasa!";
            toast.error(serverMessage);
        },
    });

    const { mutate: deleteAdvertisementFn } = useMutation({
        mutationFn: (id) => deleteAdvertisment(id),
        onSuccess: () => {
            toast.success('Oglas uspješno obrisan!');
            router.push("/market-place");
            queryClient.invalidateQueries(queryKeys.advertisements);
        },
        onError: (error) => {
            const serverMessage = error.response?.data?.detail || "Greška prilikom brisanja oglasa!";
            toast.error(serverMessage);
        },
    });

    const { mutate: updateAdvertisement } = useMutation({
        mutationFn: ({ id, ...data }) => updateAdvertisment(id, data),
        onSuccess: () => {
            toast.success('Oglas uspješno ažuriran!');
            queryClient.invalidateQueries(queryKeys.advertisements);
            router.refresh();
        },
        onError: (error) => {
            const serverMessage = error.response?.data?.detail || "Greška prilikom ažuriranja oglasa!";
            toast.error(serverMessage);
        },
    });

    const { data: myAdvertisments, isLoading: isLoadingMyAdvertisments } = useQuery({
        queryKey: queryKeys.advertisements,
        queryFn: () => getMyAdvertisments(),
        enabled: !!user?.id,
    });

    return {
        createAdvertisement,
        deleteAdvertisementFn,
        updateAdvertisement,
        myAdvertisments, isLoadingMyAdvertisments

    };

};