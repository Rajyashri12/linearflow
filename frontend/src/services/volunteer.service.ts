import { api } from "./api";

export const VolunteerService = {
  // Fetch all students registered in the system
  getAllVolunteers: () => api.get("/users?role=student"),
  
  // Fetch event-specific volunteer applications
  getVolunteerRequests: () => api.get("/volunteers?status=PENDING"),
};