import { Globe, Users, Lock } from "lucide-react";

export const POST_VISIBILITY = {
    PUBLIC: "public",
    FRIENDS: "friends",
    PRIVATE: "private",
};

export const POST_VISIBILITY_OPTIONS = [
    {
        value: POST_VISIBILITY.PUBLIC,
        label: "Javno",
        hint: "Vidi svako",
        icon: Globe,
    },
    {
        value: POST_VISIBILITY.FRIENDS,
        label: "Prijatelji",
        hint: "Samo tvoja mreža",
        icon: Users,
    },
    {
        value: POST_VISIBILITY.PRIVATE,
        label: "Samo ja",
        hint: "Samo ti vidiš",
        icon: Lock,
    },
];

export function getVisibilityOption(value) {
    return POST_VISIBILITY_OPTIONS.find((option) => option.value === value) ?? POST_VISIBILITY_OPTIONS[0];
}
