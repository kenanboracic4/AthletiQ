export function formatPeriod(startDate, endDate, isCurrent) {
  const start = startDate ? new Date(startDate).getFullYear() : "";
  const end = isCurrent ? "sada" : endDate ? new Date(endDate).getFullYear() : "";
  if (!start && !end) return "";
  if (!end) return `${start}`;
  return `${start} — ${end}`;
}

export function calcAge(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

export function sortCareerEntries(entries = []) {
  return [...entries].sort((a, b) => {
    const aDate = a.is_current ? "9999" : a.end_date || a.start_date || "";
    const bDate = b.is_current ? "9999" : b.end_date || b.start_date || "";
    return String(bDate).localeCompare(String(aDate));
  });
}

export function getProfileBio(user) {
  if (!user) return "";
  if (user.role === "ATHLETE") return user.bio;
  if (user.role === "CLUB" || user.role === "RECREATIONAL_ATHLETE") return user.description;
  return "";
}

export const EMPTY_CAREER = {
  organization: "",
  role_title: "",
  location: "",
  start_date: "",
  end_date: "",
  description: "",
  is_current: false,
};

export const EMPTY_ACHIEVEMENT = { title: "", year: "", description: "" };
export const EMPTY_TROPHY = { title: "", competition: "", year: "" };
export const EMPTY_CERT = { title: "", issuer: "", year: "" };
export const EMPTY_REGION = { region_name: "" };
