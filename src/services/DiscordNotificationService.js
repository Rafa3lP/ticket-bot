import { WebhookClient } from "discord.js";

export class NotificationService {
  constructor(webhookUrl) {
    this.webhookClient = new WebhookClient({ url: webhookUrl });
  }

  async notify(message) {
    try {
      //await this.webhookClient.send(message);
      console.log("Notificação enviada para o Discord");
      console.log(message)
    } catch (err) {
      console.error("Erro ao enviar notificação:", err);
    }
  }
}