var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");

// Index route
router.get("/", async (req, res) => {
    let select = `
        SELECT
        report.id,
        report.name,
        report.item,
        report.message,
        report.action,
        report.solved,
        COALESCE (classroom.id, device2classroom.classroom_id) AS classroom_id,
        COALESCE (classroom.name, (SELECT name FROM classroom WHERE id = device2classroom.classroom_id)) AS classroom_name,
        device.id AS device_id,
        device.brand AS device_brand,
        device.model AS device_model,
        device.category AS device_category
    `;

    res.json(
        await db.fetchAllTrippleJoin(
            "report",
            "classroom",
            "device",
            "device2classroom",
            "report.item = 'classroom' AND report.item_id = classroom.id",
            "report.item = 'device' AND report.item_id = device.id",
            "device2classroom.device_id = device.id",
            select
        )
    );
});

// Report View route
router.get("/check/:item&:itemid", async (req, res) => {
    let item = req.params.item;
    let itemid = req.params.itemid;
    let where = `item = "${item}" AND item_id = "${itemid}"`;

    res.json(
        await db.fetchAllWhere("report", where)
    );
});

// Report View route
router.get("/view/:item&:itemid", async (req, res) => {
    let item = req.params.item;
    let itemid = req.params.itemid;
    let where = `item = "${item}" AND item_id = "${itemid}"`;

    res.json(
        await db.fetchAllWhere("report", where)
    );
});

// Report Create route
router.post("/create",
    (req, res) => createReport(req, res));

async function createReport(req, res) {
    res.json(
        await db.insert("report", req.body)
    );
}

// Report Update route
router.post("/update/:id",
    (req, res) => updateReport(req, res));

async function updateReport(req, res) {
    let where = `id = "${req.params.id}"`;

    res.json(
        await db.update("report", req.body, where)
    );
}

// Report Delete route
router.post("/delete/:id",
    (req, res) => deleteReport(req, res));

async function deleteReport(req, res) {
    let id = req.params.id;
    let where = `id = "${id}"`;

    res.json(
        await db.deleteFrom("report", where)
    );
}

module.exports = router;
