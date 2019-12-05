/**
 * A module exporting functions to access the classroom database.
 */
"use strict";

const error = require("./error.js");
const mysql  = require("promise-mysql");
const config = require("../config/db/config.json");
let db;



/**
 * Main function.
 * @async
 * @returns void
 */
(async function() {
    db = await mysql.createConnection(config);

    process.on("exit", () => {
        db.end();
    });
})();



async function getDevices() {
    let sql = "SELECT * FROM device";
    let res;

    res = await db.query(sql);

    return res;
}



async function getBrands() {
    let sql = "SELECT * FROM brand";
    let res;

    res = await db.query(sql);

    return res;
}



async function getCategories() {
    let sql = "SELECT * FROM category";
    let res;

    res = await db.query(sql);

    return res;
}




module.exports = {
    getDevices: getDevices,
    getBrands: getBrands,
    getCategories: getCategories
}
