/**
 * A module exporting functions to access the classroom database.
 */
"use strict";

const error = require("./error.js");
const mysql  = require("promise-mysql");
const config = require("../config/db/config.json");
let db;
connect();


/**
 * Create a connection.
 * @async
 * @returns void
 */
async function connect() {
    db = await mysql.createConnection(config);

    process.on("exit", () => {
        db.end();
    });
};


/**
 * Get all items from the db table.
 * @async
 * @returns object
 */
async function fetchAll(table) {
    let sql = `SELECT * FROM ${table}`;
    let res;

    res = await db.query(sql);

    return res;
}


module.exports = {
    fetchAll: fetchAll
}
