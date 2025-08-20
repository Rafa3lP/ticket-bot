import axios from "axios";
import TicketModel from "../models/TicketModel";

export class UpdateTickets {
  constructor({ ticketRepository, notificationService, config }) {
    this.ticketRepository = ticketRepository;
    this.notificationService = notificationService;
    this.config = config;
  }

  async execute() {
    console.log("Buscando novas informações");
    const tickets = await this.fetchTickets();
    console.log(tickets.length + " Tickets encontrados");
    const ticketsNaTabela = await this.ticketRepository.getAll();
    console.log(ticketsNaTabela.length + " Tickets na tabela");
    const novosTickets = tickets.filter(
      (ticket) => !ticketsNaTabela.find((t) => ticket.id === t.id)
    );

    for (const ticket of novosTickets) {
      await this.ticketRepository.insert(ticket);
      await this.notificationService.notify(
        ticket.formatMessage(this.config.URL_HELPDESK)
      );
    }

    const ticketsToDelete = ticketsNaTabela.filter(
      (ticket) => !tickets.find((t) => ticket.id === t.id)
    );
    for (const { id } of ticketsToDelete) {
      await this.ticketRepository.delete(id);
    }

    for (const ticket of tickets) {
      await this.ticketRepository.update(ticket);
    }
  }

  async fetchTickets() {
    const response = await axios.get(this.config.URL_TICKETS, {
      headers: this.config.headers,
    });
    const ticketsServer = response.data.tickets;
    return ticketsServer.map(
      (t) =>
        new TicketModel(
          t.id,
          t.status,
          t.created_at,
          t.requester?.name,
          t.company?.name,
          subject
        )
    );
  }
}
