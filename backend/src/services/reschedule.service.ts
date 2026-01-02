import prisma from "../config/db";

// Ensure these match your dropdown venue options exactly
const VENUES = ["C-510", "Main Auditorium", "Seminar Hall", "Ground", "College Ground"];

export const generateRescheduleSuggestions = async (date: string, venue: string): Promise<string[]> => {
    const suggestions: string[] = [];
    const originalDate = new Date(date);

    // 1. Check same venue for the next 7 days
    for (let i = 1; i <= 7; i++) {
        const d = new Date(originalDate);
        d.setDate(originalDate.getDate() + i);
        const dateStr = d.toISOString().split("T")[0];

        const clash = await prisma.eventPermission.findFirst({
            where: { eventDate: dateStr, venue: venue, status: { in: ["APPROVED", "PENDING_HOD"] } }
        });

        if (!clash) suggestions.push(`${venue} on ${dateStr}`);
        if (suggestions.length >= 3) break;
    }

    // 2. Check other venues on the same date
    for (const v of VENUES) {
        if (v === venue) continue;
        const clash = await prisma.eventPermission.findFirst({
            where: { eventDate: date, venue: v, status: { in: ["APPROVED", "PENDING_HOD"] } }
        });
        if (!clash) suggestions.push(`${v} on ${date}`);
        if (suggestions.length >= 5) break;
    }

    return suggestions;
};