import type { CalendarEvent, EventColor } from "../types";

export const EVENT_COLORS: Record<
  EventColor,
  { label: string; bg: string; text: string; dot: string; block: string }
> = {
  red: { label: "Red", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", block: "bg-red-200/80 border-l-red-500" },
  gold: { label: "Gold", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", block: "bg-amber-200/80 border-l-amber-500" },
  green: { label: "Green", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", block: "bg-emerald-200/80 border-l-emerald-500" },
  orange: { label: "Orange", bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500", block: "bg-orange-200/80 border-l-orange-500" },
  blue: { label: "Blue", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500", block: "bg-blue-200/80 border-l-blue-500" },
  purple: { label: "Purple", bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500", block: "bg-purple-200/80 border-l-purple-500" },
};

function dateOf(day: number, hour = 9, minute = 0): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), day, hour, minute).toISOString();
}

function relative(offset: number, hour = 9, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const MOCK_EVENTS: CalendarEvent[] = [
  { id: "m1", title: "Team Standup", description: "Daily standup", location: "Room A1", startDate: dateOf(3, 9), endDate: dateOf(3, 9, 30), isAllDay: false, color: "blue" },
  { id: "m2", title: "Design Review", description: "Review new UI mockups", location: "Design Lab", startDate: dateOf(7, 14), endDate: dateOf(7, 15, 30), isAllDay: false, color: "purple" },
  { id: "m3", title: "Sprint Planning", description: "Plan next sprint", location: "Room B3", startDate: dateOf(10, 10), endDate: dateOf(10, 12), isAllDay: false, color: "green" },
  { id: "m4", title: "Company Holiday", description: "Office closed", location: "", startDate: dateOf(15), endDate: dateOf(15), isAllDay: true, color: "red" },
  { id: "m5", title: "Product Launch", description: "CatSpeak v2.0", location: "Main Auditorium", startDate: dateOf(20, 8), endDate: dateOf(20, 18), isAllDay: false, color: "gold" },
  { id: "m6", title: "Client Meeting", description: "Quarterly review", location: "Room C2", startDate: dateOf(22, 15), endDate: dateOf(22, 16), isAllDay: false, color: "orange" },
  { id: "m7", title: "Bug Bash", description: "Team bug fixing", location: "Open Space", startDate: dateOf(25, 13), endDate: dateOf(25, 17), isAllDay: false, color: "red" },
  { id: "m8", title: "Workshop", description: "React perf workshop", location: "Training Room", startDate: dateOf(28, 9), endDate: dateOf(28, 12), isAllDay: false, color: "blue" },
  // Relative events — always visible in current week
  { id: "r1", title: "Morning Sync", description: "Quick sync with team", location: "Room A1", startDate: relative(0, 9), endDate: relative(0, 9, 30), isAllDay: false, color: "blue" },
  { id: "r2", title: "Lunch & Learn", description: "AI tools demo session", location: "Cafeteria", startDate: relative(0, 12), endDate: relative(0, 13), isAllDay: false, color: "green" },
  { id: "r3", title: "Code Review", description: "PR review session", location: "Room B2", startDate: relative(0, 15), endDate: relative(0, 16), isAllDay: false, color: "purple" },
  { id: "r4", title: "1:1 with Manager", description: "Weekly check-in", location: "Manager's Office", startDate: relative(1, 10), endDate: relative(1, 10, 45), isAllDay: false, color: "gold" },
  { id: "r5", title: "API Design Workshop", description: "REST vs GraphQL discussion", location: "Room A3", startDate: relative(1, 14), endDate: relative(1, 16), isAllDay: false, color: "orange" },
  { id: "r6", title: "Deployment", description: "Deploy staging env", location: "DevOps Room", startDate: relative(2, 11), endDate: relative(2, 12, 30), isAllDay: false, color: "red" },
  { id: "r7", title: "Team Retro", description: "Sprint retrospective", location: "Room B3", startDate: relative(3, 15), endDate: relative(3, 16, 30), isAllDay: false, color: "green" },
  { id: "r8", title: "Planning Poker", description: "Estimate new stories", location: "Room A2", startDate: relative(-1, 10), endDate: relative(-1, 11, 30), isAllDay: false, color: "blue" },
  { id: "r9", title: "UX Research Review", description: "User testing results", location: "Design Lab", startDate: relative(-1, 14), endDate: relative(-1, 15), isAllDay: false, color: "purple" },
];

export function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
