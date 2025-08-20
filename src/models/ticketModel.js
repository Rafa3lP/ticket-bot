export default class TicketModel {
  constructor(id, status, dataCriacao, nomeCliente, empresa, assunto) {
    this.id = id;
    this.status = status;
    this.dataCriacao = dataCriacao;
    this.nomeCliente = nomeCliente;
    this.empresa = empresa;
    this.assunto = assunto;
  }

  formatMessage(urlHelpdesk) {
    return `**Cliente:** ${this.nomeCliente}\n**Empresa:** ${
      this.empresa
    }\n**Nome do Ticket:** ${this.assunto}\n**Data de Criação:** ${new Date(this.dataCriacao).toLocaleString("pt-BR")}\n\n[Visualizar](${urlHelpdesk}/${this.id})`;
  }
}
