import { TicketRepository } from "../repository/TicketRepository.js";

export const TicketService = {
  getAllTickets: async () => {
    try {
      return await TicketRepository.getAll();
    } catch (error) {
      throw error;
    }
  },

  getTicketById: async (id) => {
    try {
      return await TicketRepository.getById(id);
    } catch (error) {
      throw error;
    }
  },

  createOrUpdateTicket: async (ticket) => {
    try {
      const existingTicket = await TicketRepository.getById(ticket.id);

      if (existingTicket) {
        await TicketRepository.update(ticket);
      } else {
        await TicketRepository.insert(ticket);
      }
    } catch (error) {
      throw error;
    }
  },

  deleteTicket: async (id) => {
    try {
      await TicketRepository.delete(id);
    } catch (error) {
      throw error;
    }
  },
};