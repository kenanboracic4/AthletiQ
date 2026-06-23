export function getOtherParticipant(chat, currentUserId) {
    if (!chat) return null;
    if (chat.first_user?.id === currentUserId) return chat.second_user;
    return chat.first_user;
}

export function getAvatarUrl(user) {
    if (user?.image) return user.image;
    return "/no-profile-picture.png";
}

export function formatMessageTime(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("bs-BA", {
        hour: "2-digit",
        minute: "2-digit",
    });
}