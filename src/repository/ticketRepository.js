import sqlite3 from "sqlite3";
const db = new sqlite3.Database("tickets.db");

db.run(`
  CREATE TABLE IF NOT EXISTS unresolvedTickets (
    id INTEGER PRIMARY KEY,
    status INTEGER,
    dataCriacao TEXT
  )
`);

export const TicketRepository = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM unresolvedTickets", (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },
  
  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM unresolvedTickets WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  insert: (ticket) => {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO unresolvedTickets (id, status, dataCriacao) VALUES (?, ?, ?)",
        [ticket.id, ticket.status, ticket.dataCriacao],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  update: (ticket) => {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE unresolvedTickets SET status = ?, dataCriacao = ? WHERE id = ?",
        [ticket.status, ticket.dataCriacao, ticket.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM unresolvedTickets WHERE id = ?", [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
};