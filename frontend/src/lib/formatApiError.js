export function formatApiError(error) {
    const detail = error?.response?.data?.detail;
    if (!detail) return null;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
        return detail.map((item) => item.msg || item).join(", ");
    }
    return String(detail);
}
