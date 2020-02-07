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
    let sql = `SELECT * FROM ${table};`;
    let res = await db.query(sql);

    return res;
}



/**
 * Get all items from the db table with condition.
 * @async
 * @returns object
 */
async function fetchAllWhere(table, where) {
    let sql = `SELECT * FROM ${table} WHERE ${where};`;
    let res = await db.query(sql);

    return res;
}



/**
 * Get all items from the db table with condition and join.
 * @async
 * @returns object
 */
async function fetchAllJoinWhere(table1, table2, on, where) {
    let sql = `
        SELECT * FROM ${table1}
        LEFT JOIN ${table2}
    	ON ${on}
        WHERE ${where};
        `;

    let res = await db.query(sql);

    return res;
}


module.exports = {
    fetchAll: fetchAll,
    fetchAllWhere: fetchAllWhere,
    fetchAllJoinWhere: fetchAllJoinWhere
}
