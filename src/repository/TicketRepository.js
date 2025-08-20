import sqlite3 from "sqlite3";

export class TicketRepository {
  constructor(dbFile = "tickets.db") {
    this.db = new sqlite3.Database(dbFile);
    this.initialize();
  }

  initialize() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS unresolvedTickets (
        id INTEGER PRIMARY KEY,
        status INTEGER,
        dataCriacao TEXT
      )
    `);
  }

  getAll() {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM unresolvedTickets", (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  getById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT * FROM unresolvedTickets WHERE id = ?",
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  insert(ticket) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO unresolvedTickets (id, status, dataCriacao) VALUES (?, ?, ?)",
        [ticket.id, ticket.status, ticket.dataCriacao],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  update(ticket) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "UPDATE unresolvedTickets SET status = ?, dataCriacao = ? WHERE id = ?",
        [ticket.status, ticket.dataCriacao, ticket.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  delete(id) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "DELETE FROM unresolvedTickets WHERE id = ?",
        [id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}