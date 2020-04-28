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
 * Get the person if exists
 * @async
 * @returns object
 */
async function login(email) {
    let sql = `
        SELECT *
        FROM person
        WHERE
        email = "${email}";`;
    let res = await dbQuery(sql);

    return res;
}



/**
 * Get all items from the db table.
 * @async
 * @returns object
 */
async function fetchAllClassrooms() {
    let sql = `
        SELECT
        classroom.*,
        SUM(
        (SELECT COUNT(*) FROM report WHERE item_group = "classroom" AND item_id = classroom.id AND solved IS NULL) +
        (SELECT COUNT(*) FROM report WHERE item_group = "device" AND item_id = device2classroom.device_id AND solved IS NULL)
        ) = 0 AS working

        FROM classroom

        LEFT JOIN device2classroom
        ON device2classroom.classroom_id = classroom.id

        GROUP BY classroom.id;
        `;
    let res = await dbQuery(sql);

    return res;
}



/**
 * Get all items from the db table.
 * @async
 * @returns object
 */
async function fetchAllClassroomsWhere(where) {
    let sql = `
        SELECT
        classroom.*,
        SUM(
        (SELECT COUNT(*) FROM report WHERE item_group = "classroom" AND item_id = classroom.id AND solved IS NULL) +
        (SELECT COUNT(*) FROM report WHERE item_group = "device" AND item_id = device2classroom.device_id AND solved IS NULL)
        ) = 0 AS working

        FROM classroom

        LEFT JOIN device2classroom
        ON device2classroom.classroom_id = classroom.id

        WHERE ${where}
        GROUP BY classroom.id;
        `;
    let res = await dbQuery(sql);

    return res;
}



/**
 * Get all items from the db tables and join.
 * @async
 * @returns object
 */
async function fetchClassroomsHaving(having, where = null) {
    let sql = `
        SELECT
        classroom.*,
        SUM(
        (SELECT COUNT(*) FROM report WHERE item_group = "classroom" AND item_id = classroom.id AND solved IS NULL) +
        (SELECT COUNT(*) FROM report WHERE item_group = "device" AND item_id = device2classroom.device_id AND solved IS NULL)
        ) = 0 AS working

        FROM classroom

        LEFT JOIN device2classroom
    	ON device2classroom.classroom_id = classroom.id

        ${where ? 'WHERE ' + where : ""}
        GROUP BY classroom.id

        HAVING ${having};
        `;
    let res = await dbQuery(sql);

    return res;
}



/**
 * Get all items from the db tables with condition and join.
 * @async
 * @returns object
 */
async function fetchClassroomDevices(where) {
    let sql = `
        SELECT
        *,
        (SELECT COUNT(*) FROM report WHERE item_group = "device" AND item_id = device.id AND solved IS NULL) = 0 AS working,
        (
            SELECT (name)
            FROM classroom
            LEFT JOIN device2classroom
            ON device2classroom.classroom_id = classroom.id
            WHERE device2classroom.device_id = device.id

        ) AS classroom_name

        FROM device2classroom

        LEFT JOIN device
    	ON device2classroom.device_id = device.id

        WHERE ${where};
        `;

    let res = await dbQuery(sql);

    return res;
}



/**
 * Get all items from the db table.
 * @async
 * @returns object
 */
async function fetchAllDevices() {
    let sql = `
        SELECT
        device.*,
        (SELECT COUNT(*) FROM report WHERE item_group = "device" AND item_id = device.id AND solved IS NULL) = 0 AS working,
        (
            SELECT (name)
            FROM classroom
            LEFT JOIN device2classroom
            ON device2classroom.classroom_id = classroom.id
            WHERE device2classroom.device_id = device.id

        ) AS classroom_name

        FROM device;
        `;
    let res = await dbQuery(sql);

    return res;
}



/**
 * Get all items from the db table.
 * @async
 * @returns object
 */
async function fetchAllDevicesWhere(where) {
    let sql = `
        SELECT
        device.*,
        (SELECT COUNT(*) FROM report WHERE item_group = "device" AND item_id = device.id AND solved IS NULL) = 0 AS working,
        (
            SELECT (name)
            FROM classroom
            LEFT JOIN device2classroom
            ON device2classroom.classroom_id = classroom.id
            WHERE device2classroom.device_id = device.id

        ) AS classroom_name

        FROM device

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
async function fetchDevicesHaving(having, where = null) {
    let sql = `
        SELECT
        device.*,
        (SELECT COUNT(*) FROM report WHERE item_group = "device" AND item_id = device.id AND solved IS NULL) = 0 AS working,
        (
            SELECT (name)
            FROM classroom
            LEFT JOIN device2classroom
            ON device2classroom.classroom_id = classroom.id
            WHERE device2classroom.device_id = device.id

        ) AS classroom_name

        FROM device

        ${where ? 'WHERE ' + where : ""}
        GROUP BY device.id
        HAVING ${having};
        `;
    let res = await dbQuery(sql);

    return res;
}



/**
 * Get all items from the db tables with condition and join.
 * @async
 * @returns object
 */
async function fetchAllDevicesAvailable() {
    let sql = `
        SELECT
        *,
        (SELECT COUNT(*) FROM report WHERE item_group = "device" AND item_id = device.id AND solved IS NULL) = 0 AS working
        FROM device

        LEFT JOIN device2classroom
    	ON device.id = device2classroom.device_id

        WHERE device2classroom.device_id IS NULL;
        `;

    let res = await dbQuery(sql);

    return res;
}



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
 * Report Select statement
 *
 * @returns string
 */
function reportSelect() {
    return `
        SELECT
        report.*,
        (SELECT CONCAT(firstname, " ", lastname) FROM person WHERE id = report.person_id) AS person,
        classroom.id AS classroom_id,
        classroom.name AS classroom_name,
        classroom.type AS classroom_type,
        classroom.building AS classroom_building,
        classroom.level AS classroom_level,
        classroom.image AS classroom_image,
        device.id AS device_id,
        device.brand AS device_brand,
        device.model AS device_model,
        device.category AS device_category,
        device.url AS device_url
    `;
}



/**
 * Get all items from the db tables and join.
 * @async
 * @returns object
 */
async function fetchAllReports() {
    let select = reportSelect();
    let sql = `
        ${select}
        FROM report

        LEFT JOIN classroom
    	ON COALESCE(
        (SELECT classroom_id FROM device2classroom WHERE report.item_group = "device" AND report.item_id = device_id) = classroom.id,
        report.item_group = "classroom" AND report.item_id = classroom.id)

        LEFT JOIN device
    	ON report.item_group = "device" AND report.item_id = device.id
        ORDER BY report.created DESC;
        `;
    let res = await dbQuery(sql);

    return res;
}



/**
 * Get all items from the db tables and join.
 * @async
 * @returns object
 */
async function fetchAllReportsWhere(where) {
    let select = reportSelect();
    let sql = `
        ${select}
        FROM report

        LEFT JOIN classroom
    	ON COALESCE(
        (SELECT classroom_id FROM device2classroom WHERE report.item_group = "device" AND report.item_id = device_id) = classroom.id,
        report.item_group = "classroom" AND report.item_id = classroom.id)

        LEFT JOIN device
    	ON report.item_group = "device" AND report.item_id = device.id
        WHERE ${where}
        ORDER BY report.created DESC;
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
    fetchAllClassrooms: fetchAllClassrooms,
    fetchAllClassroomsWhere: fetchAllClassroomsWhere,
    fetchClassroomsHaving: fetchClassroomsHaving,
    fetchClassroomDevices:fetchClassroomDevices,
    fetchAllDevices: fetchAllDevices,
    fetchAllDevicesWhere:fetchAllDevicesWhere,
    fetchDevicesHaving: fetchDevicesHaving,
    fetchAllDevicesAvailable: fetchAllDevicesAvailable,
    fetchAll: fetchAll,
    fetchAllWhere: fetchAllWhere,
    fetchAllReports: fetchAllReports,
    fetchAllReportsWhere: fetchAllReportsWhere,
    insert: insert,
    update: update,
    deleteFrom: deleteFrom
}
