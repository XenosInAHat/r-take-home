const express = require('express');
const _ = require('lodash');
const sqlite3 = require('sqlite3').verbose();
const utils = require('./utils.js');

const app = express();
const port = 3000;
const INTERNAL_ERROR = 500;
const BAD_REQUEST = 400;

// Note: The node-sqlite3 team said best practice was to open connection to
// database on app startup and then close connection on app shutdown. Granted,
// this was in 2014, so best practices may have changed:
// https://github.com/mapbox/node-sqlite3/issues/286
let db = new sqlite3.Database('./data/sqlite.db', sqlite3.OPEN_READONLY,
  (err) => {
    if (err) console.log(err.message);
    console.log('Connected to database.');
  }
);

/*
 * Query params: sex, income, living, age, user_id
 */
app.get('/', (req, res) => {
  // Limit filters to columns in the users table
  let filters = utils.getFilters(req.query);
  let messages = [];

  // If we don't have any filters, just send back all messages
  if (_.isEmpty(filters)) {
    const sql = `SELECT text
           FROM messages`;

    try {
      db.serialize(() => {
        db.each(sql, [], (err, row) => {
          if (err) console.log(err);
          messages.push(row.text);
        }, (err, rows) => {
          res.send(messages);
          return;
        });
      });
    } catch (error) {
      console.error(error);
      res.sendStatus(INTERNAL_ERROR);
      return;
    }
  } else { // Otherwise, filter users and group messages

    // If we have a bad filter (e.g. income age: -1), bail early. We could
    // optionally just ignore that filter, but that could lead to the consumer
    // attempting to find insight in incomplete data.
    if (!utils.validateFilters(filters)) {
      res.status(BAD_REQUEST).send('Invalid filters')
      return;
    }

    // If we fail to build out our SQL statement, bail early
    let sql = utils.getSql(filters);
    if (!sql) {
      res.status(INTERNAL_ERROR).send('Failed to build user SQL statement')
      return;
    }

    try {
      db.serialize(() => {
        db.each(sql, [], (err, row) => {
          messages.push(row.text);
        }, (err, rowCount) => {
          res.send(messages);
          return;
        });
      });
    } catch (err) {
      console.error(err);
      res.sendStatus(INTERNAL_ERROR);
      return;
    }
  }
});

let server = app.listen(port, () => console.log(`Listening on port ${port}`));

let gracefulClose = () => {
  console.log('Shutting down server.')
  db.close();
  server.close();
}

process.on('SIGTERM', gracefulClose);
process.on('SIGINT', gracefulClose);
