import { api } from "./api";

const VENUES = ["C-510", "Main Auditorium", "Seminar Hall", "Ground", "College Ground"];

export const generateRescheduleSuggestions = async (originalDate: string, currentVenue: string): Promise<string[]> => {
  try {
    const response = await api.get("/eventPermissions");
    const allEvents = response.data || response;
    const suggestions: string[] = [];
    const dateObj = new Date(originalDate);

    // 1. Check SAME VENUE for the next 5 days
    for (let i = 1; i <= 5; i++) {
      const nextDate = new Date(dateObj);
      nextDate.setDate(dateObj.getDate() + i);
      const dateStr = nextDate.toISOString().split("T")[0];

      const isBusy = allEvents.find((e: any) => 
        e.eventDate === dateStr && e.venue === currentVenue && e.status !== "CANCELLED"
      );

      if (!isBusy) suggestions.push(`${currentVenue} on ${dateStr}`);
      if (suggestions.length >= 3) break;
    }

    // 2. Check OTHER VENUES on the SAME DATE
    for (const v of VENUES) {
      if (v === currentVenue) continue;
      const isBusy = allEvents.find((e: any) => 
        e.eventDate === originalDate && e.venue === v && e.status !== "CANCELLED"
      );

      if (!isBusy) suggestions.push(`${v} on ${originalDate}`);
      if (suggestions.length >= 5) break;
    }

    return suggestions;
  } catch (error) {
    return [];
  }
};