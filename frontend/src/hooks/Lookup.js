import { useQuery } from "@tanstack/react-query";
import { getSports } from "@/api/sports";
import { getPositionsBySport } from "@/api/positions";
import { getLocations } from "@/api/locations";
import { queryKeys } from "@/lib/queryKeys";

export function useSportsLookup() {
    return useQuery({
        queryKey: queryKeys.sports,
        queryFn: getSports,
    });
}

export function useLocationsLookup() {
    return useQuery({
        queryKey: queryKeys.locations,
        queryFn: getLocations,
    });
}

export function usePositionsBySportName(sportName) {
    const { data: sports } = useSportsLookup();

    const sportId = sports?.find((sport) => sport.name === sportName)?.id;

    return useQuery({
        queryKey: queryKeys.positionsBySport(sportId),
        queryFn: () => getPositionsBySport(sportId),
        enabled: !!sportId,
    });
}

export function useAdvertisementLookups(sportName) {
    const sportsQuery = useSportsLookup();
    const locationsQuery = useLocationsLookup();
    const positionsQuery = usePositionsBySportName(sportName);

    return {
        sports: sportsQuery.data ?? [],
        locations: locationsQuery.data ?? [],
        positions: positionsQuery.data ?? [],
        isLoading: sportsQuery.isLoading || locationsQuery.isLoading,
        isLoadingPositions: positionsQuery.isLoading,
    };
}
