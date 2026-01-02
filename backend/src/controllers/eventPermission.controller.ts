import { Request, Response } from "express";
import prisma from "../config/db";
import { generateRescheduleSuggestions } from "../services/reschedule.service";

export const getAllPermissions = async (req: Request, res: Response) => {
    try {
        const data = await prisma.eventPermission.findMany();
        res.json(data);
    } catch (error) { res.status(500).json({ error: "Fetch failed" }); }
};

export const applyEvent = async (req: Request, res: Response) => {
    try {
        const { eventDate, venue } = req.body;

        const existingEvent = await prisma.eventPermission.findFirst({
            where: { eventDate, venue, status: { in: ["APPROVED", "PENDING_HOD"] } },
        });

        if (existingEvent) {
            const suggestions = await generateRescheduleSuggestions(eventDate, venue);
            const event = await prisma.eventPermission.create({
                data: {
                    ...req.body,
                    status: "COLLISION",
                    collisionReason: `Conflict with "${existingEvent.title}"`,
                    rescheduleSuggestions: suggestions,
                },
            });
            return res.status(200).json(event);
        }

        const event = await prisma.eventPermission.create({
            data: { ...req.body, status: "PENDING_HOD" },
        });
        res.status(201).json(event);
    } catch (error) { res.status(500).json({ error: "Apply failed" }); }
};

export const updatePermission = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const data = req.body;
        if (data.eventDate || data.venue) {
            const clash = await prisma.eventPermission.findFirst({
                where: { eventDate: data.eventDate, venue: data.venue, status: { in: ["APPROVED", "PENDING_HOD"] }, NOT: { id } },
            });
            if (clash) {
                const suggestions = await generateRescheduleSuggestions(data.eventDate, data.venue);
                const updated = await prisma.eventPermission.update({
                    where: { id },
                    data: { ...data, status: "COLLISION", rescheduleSuggestions: suggestions }
                });
                return res.json(updated);
            }
        }
        const updated = await prisma.eventPermission.update({ where: { id }, data });
        res.json(updated);
    } catch (error) { res.status(500).json({ error: "Update failed" }); }
};

export const deletePermission = async (req: Request, res: Response) => {
    try {
        await prisma.eventPermission.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: "Deleted" });
    } catch (error) { res.status(500).json({ error: "Delete failed" }); }
};