import dotenv from "dotenv";
import { NotificationService } from "./services/DiscordNotificationService.js";
import { UpdateTickets } from "./use-cases/UpdateTickets.js";
import { TicketRepository } from "./repository/TicketRepository.js";

dotenv.config();

const {
  URL_TICKETS,
  DISCORD_WEBHOOK_URL,
  HELPKIT_SESSION_COOKIE,
  INTERVALO_EM_MINUTOS,
  URL_HELPDESK,
} = process.env;

const headers = {
  "Accept-Encoding": "gzip, deflate, br",
  accept: "application/json, text/javascript, */*; q=0.01",
  "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  Cookie: `_helpkit_session=${HELPKIT_SESSION_COOKIE}`,
};

const ticketRepository = new TicketRepository();
const notificationService = new NotificationService(DISCORD_WEBHOOK_URL);

const updateTickets = new UpdateTickets({
  ticketRepository,
  notificationService,
  config: { URL_TICKETS, headers, URL_HELPDESK },
});

async function init() {
  await updateTickets.execute();
  setInterval(
    async () => await updateTickets.execute(),
    parseInt(INTERVALO_EM_MINUTOS) * 60 * 1000
  );
}

init();
