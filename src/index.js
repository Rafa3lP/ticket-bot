import axios from "axios";
import dotenv from "dotenv";
import { WebhookClient } from "discord.js";
import { TicketService } from "./services/ticketService.js";
import TicketModel from "./models/ticketModel.js";

dotenv.config();

const {
  URL_TICKETS,
  DISCORD_WEBHOOK_URL,
  HELPKIT_SESSION_COOKIE,
  INTERVALO_EM_MINUTOS,
} = process.env;

const webhookClient = new WebhookClient({ url: DISCORD_WEBHOOK_URL });

const headers = {
  "Accept-Encoding": "gzip, deflate, br",
  accept: "application/json, text/javascript, */*; q=0.01",
  "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  Cookie: `_helpkit_session=${HELPKIT_SESSION_COOKIE}`,
};

async function atualizarInformacoes() {
  try {
    console.log("Buscando novas informações");
    const tickets = await obterTickets();
    const ticketsNaTabela = await TicketService.getAllTickets();

    const novosTickets = tickets.filter(
      (t) => !ticketsNaTabela.find((ticket) => t.id === ticket.id)
    );

    for (const ticket of novosTickets) {
      const { id, status, created_at } = ticket;
      await TicketService.createOrUpdateTicket(
        new TicketModel(id, status, created_at)
      );
      notificarDiscord(
        `>>> ## Novo ticket\n\n${formatarMensagemTicket(ticket)}\n\n`
      );
    }

    const ticketsToDelete = ticketsNaTabela.filter(
      (t) => !tickets.find((ticket) => t.id === ticket.id)
    );

    for (const { id } of ticketsToDelete) {
      await TicketService.deleteTicket(id);
    }

    const ticketsToUpdate = tickets.filter(
      (t) => !!ticketsNaTabela.find((ticket) => t.id === ticket.id)
    );

    for (const ticket of ticketsToUpdate) {
      const { id, status, created_at } = ticket;
      await TicketService.createOrUpdateTicket(
        new TicketModel(id, status, created_at)
      );
    }
  } catch (err) {
    console.error("Erro ao atualizar tickets: ", err.message);
    notificarDiscord("Erro ao atualizar tickets: " + err.message);
  }
}

async function obterTickets() {
  const response = await axios.get(URL_TICKETS, { headers });
  return response.data.tickets;
}

function notificarDiscord(mensagem) {
  webhookClient
    .send(mensagem)
    .then(() => console.log("Notificação enviada para o Discord"))
    .catch((err) =>
      console.error("Erro ao enviar notificação para o Discord:", err)
    );
}

function getDateString(date) {
  return new Date(date).toLocaleString("pt-BR");
}

function formatarMensagemTicket(ticket) {
  return `**Cliente:** ${ticket?.requester?.name}\n**Empresa:** ${
    ticket?.company?.name
  }\n**Nome do Ticket:** ${
    ticket?.subject
  }\n**Data de Criação:** ${getDateString(ticket["created_at"])}`;
}

async function intit() {
  const ticketsNaTabela = await TicketService.getAllTickets();

  if (ticketsNaTabela.length === 0) {
    const tickets = await obterTickets();

    for (const ticket of tickets) {
      const { id, status, created_at } = ticket;
      await TicketService.createOrUpdateTicket(
        new TicketModel(id, status, created_at)
      );
    }
  }

  await atualizarInformacoes();
  setInterval(atualizarInformacoes, parseInt(INTERVALO_EM_MINUTOS) * 60 * 1000);
}

intit();
