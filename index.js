import dotenv from "dotenv";
import axios from "axios";
import { WebhookClient } from "discord.js";
import sqlite3 from "sqlite3";

dotenv.config();

const {
  INTERVALO_EM_MINUTOS,
  URL_TICKETS,
  DATABASE_PATH,
  DISCORD_WEBHOOK_URL,
  HELPKIT_SESSION_COOKIE,
} = process.env;

const webhookClient = new WebhookClient({ url: DISCORD_WEBHOOK_URL });

const db = new sqlite3.Database(DATABASE_PATH);

const headers = {
  "Accept-Encoding": "gzip, deflate, br",
  accept: "application/json, text/javascript, */*; q=0.01",
  "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  Cookie: `_helpkit_session=${HELPKIT_SESSION_COOKIE}`,
};

async function obterTickets() {
  try {
    const response = await axios.get(URL_TICKETS, { headers });

    const numeroDeTickets = response.data.tickets.length;

    console.log(`Número de tickets em aberto: ${numeroDeTickets}`);

    const numeroAnterior = await lerNumeroDeTickets();

    console.log("Numero no banco: ", numeroAnterior);

    if (numeroDeTickets > numeroAnterior) {
      notificarDiscord(
        `Novos tickets não resolvidos. ${numeroDeTickets} no total!`
      );
    }

    await salvarNumeroDeTickets(numeroDeTickets);
  } catch (error) {
    console.error("Erro ao obter tickets:", error.message);
  }
}

function notificarDiscord(mensagem) {
  webhookClient
    .send(mensagem)
    .then(() => console.log("Notificação enviada para o Discord"))
    .catch((err) =>
      console.error("Erro ao enviar notificação para o Discord:", err)
    );
}

function salvarNumeroDeTickets(numeroDeTickets) {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE tickets SET numeroDeTickets = ?",
      [numeroDeTickets],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

function lerNumeroDeTickets() {
  return new Promise((resolve, reject) => {
    db.get("SELECT numeroDeTickets FROM tickets", (err, row) => {
      if (err) {
        console.log(err);
        reject(err);
      } else resolve(row ? row.numeroDeTickets : 0);
    });
  });
}

async function criarTabela() {
  await new Promise((resolve, reject) =>
    db.run(
      "CREATE TABLE IF NOT EXISTS tickets (numeroDeTickets INTEGER)",
      (err) => {
        if (err) reject(err);
        resolve();
      }
    )
  );

  const count = await new Promise((resolve, reject) =>
    db.get("SELECT COUNT(*) AS count FROM tickets", (err, row) => {
      if (err) reject(err);
      resolve(row.count);
    })
  );

  if (count === 0) {
    await new Promise((resolve, reject) =>
      db.run(
        "INSERT INTO tickets ('numeroDeTickets') VALUES (0)",
        (res, err) => {
          if (err) reject(err);
          resolve(res);
        }
      )
    );
  }
}

criarTabela().then(() => {
  obterTickets().then(() => {
    setInterval(obterTickets, parseInt(INTERVALO_EM_MINUTOS) * 60 * 1000);
  });
});
