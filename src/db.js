/**
 * A module exporting functions to access the classroom database.
 */
"use strict";

const error = require("./error.js");
const mysql  = require("promise-mysql");
const config = require("../config/db/config.json");

/**
 * Create a connection, make a query and close the connection.
 * @async
 * @returns object
 */
async function dbQuery(sql) {
    const db = await mysql.createConnection(config);
    let res;

    try {
        res = await db.query(sql);
    } catch (err) {
        console.log(err);
    } finally {
        await db.end();
    }

    return res;
};



/**
 * Get all items from the db table.
 * @async
 * @returns object
 */
async function fetchAll(table) {
    let sql = `SELECT * FROM ${table};`;
    let res = await dbQuery(sql);

    return res;
}



/**
 * Get all items from the db table with condition.
 * @async
 * @returns object
 */
async function fetchAllWhere(table, where) {
    let sql = `SELECT * FROM ${table} WHERE ${where};`;
    let res = await dbQuery(sql);

    return res;
}



/**
 * Get all items from the db tables with condition and join.
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

    let res = await dbQuery(sql);

    return res;
}



/**
 * Get all items from the db tables and join.
 * @async
 * @returns object
 */
async function fetchAllDoubleJoin(table1, table2, table3, on1, on2, select = "SELECT *") {
    let sql = `
        ${select}
        FROM ${table1}
        LEFT JOIN ${table2}
    	ON ${on1}
        LEFT JOIN ${table3}
    	ON ${on2};
        `;
    let res = await dbQuery(sql);

    return res;
}



/**
 * Get all items from the db tables and join.
 * @async
 * @returns object
 */
async function fetchAllDoubleJoinWhere(table1, table2, table3, on1, on2, where, select = "SELECT *") {
    let sql = `
        ${select}
        FROM ${table1}
        LEFT JOIN ${table2}
    	ON ${on1}
        LEFT JOIN ${table3}
    	ON ${on2}
        WHERE ${where};
        `;
    let res = await dbQuery(sql);

    return res;
}



/**
 * Get all items from the db tables and join.
 * @async
 * @returns object
 */
async function fetchAllTrippleJoin(table1, table2, table3, table4, on1, on2, on3, select = "SELECT *") {
    let sql = `
        ${select}
        FROM ${table1}
        LEFT JOIN ${table2}
    	ON ${on1}
        LEFT JOIN ${table3}
    	ON ${on2}
        LEFT JOIN ${table4}
    	ON ${on3};
        `;
    let res = await dbQuery(sql);

    return res;
}



/**
 * Get all items from the db tables and join.
 * @async
 * @returns object
 */
async function fetchAllTrippleJoinWhere(table1, table2, table3, table4, on1, on2, on3, where, select = "SELECT *") {
    let sql = `
        ${select}
        FROM ${table1}
        LEFT JOIN ${table2}
    	ON ${on1}
        LEFT JOIN ${table3}
    	ON ${on2}
        LEFT JOIN ${table4}
    	ON ${on3}
        WHERE ${where};
        `;
    let res = await dbQuery(sql);

    return res;
}



/**
 * Insert items to the db table.
 * @async
 * @returns object
 */
async function insert(table, data) {
    let columns = Object.keys(data).toString();
    let values = Object.values(data);
    let params = values.map(val => `'${val}'`).join(", ");

    let sql = `INSERT INTO ${table}(${columns}) VALUES (${params});`;
    let res = await dbQuery(sql);

    return res;
}



/**
 * Update items.
 * @async
 * @returns object
 */
async function update(table, data, where) {
    let columns = Object.keys(data);
    let values = Object.values(data);
    let params = columns.map(key => !data[key] ? `${key} = null` : `${key} = '${data[key]}'`).join(", ");

    let sql = `
        UPDATE ${table}
        SET ${params}
        WHERE ${where};
        `;
    let res = await dbQuery(sql);

    return res;
}



/**
 * Delete items.
 * @async
 * @returns object
 */
async function deleteFrom(table, where) {
    let sql = `
        DELETE FROM ${table}
        WHERE ${where};
        `;
    let res = await dbQuery(sql);

    return res;
}


module.exports = {
    fetchAll: fetchAll,
    fetchAllWhere: fetchAllWhere,
    fetchAllJoinWhere: fetchAllJoinWhere,
    fetchAllDoubleJoin: fetchAllDoubleJoin,
    fetchAllDoubleJoinWhere: fetchAllDoubleJoinWhere,
    fetchAllTrippleJoin: fetchAllTrippleJoin,
    fetchAllTrippleJoinWhere: fetchAllTrippleJoinWhere,
    insert: insert,
    update: update,
    deleteFrom: deleteFrom
}
