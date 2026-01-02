import { Request, Response } from "express";
import prisma from "../config/db";
import { generateRescheduleSuggestions } from "../services/reschedule.service";

export const approveEventByPrincipal = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    const event = await prisma.eventPermission.findUnique({
      where: { id },
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // 🔥 COLLISION CHECK (same date + venue, already approved)
    const collision = await prisma.eventPermission.findFirst({
      where: {
        eventDate: event.eventDate,
        venue: event.venue,
        status: "APPROVED",
        NOT: { id },
      },
    });

    // ❌ COLLISION FOUND → CANCEL + SUGGEST
    if (collision) {
      const suggestions = await generateRescheduleSuggestions(
        event.eventDate!,
        event.venue!
      );

      await prisma.eventPermission.update({
        where: { id },
        data: {
          status: "CANCELLED",
          principalStatus: "TERMINATED",
          collisionReason: `Collision with "${collision.title}"`,
          rescheduleSuggestions: suggestions,
        },
      });

      return res.json({
        message: "Event cancelled due to collision",
        collisionWith: collision.title,
        suggestions,
      });
    }

    // ✅ NO COLLISION → APPROVE EVENT
    await prisma.eventPermission.update({
      where: { id },
      data: {
        status: "APPROVED",
        principalStatus: "APPROVED",
        collisionReason: null,
        rescheduleSuggestions: [],
      },
    });

    return res.json({ message: "Event approved successfully" });
  } catch (error) {
    console.error("Principal approval error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
