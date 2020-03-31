var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");
let select = `
    SELECT
    report.*,
    classroom.id AS classroom_id,
    classroom.name AS classroom_name,
    classroom.type AS classroom_type,
    classroom.location AS classroom_location,
    classroom.level AS classroom_level,
    classroom.image AS classroom_image,
    device.id AS device_id,
    device.brand AS device_brand,
    device.model AS device_model,
    device.category AS device_category,
    device.url AS device_url
`;

// Index route
router.get("/", async (req, res) => {
    res.json(
        await db.fetchAllDoubleJoin(
            `report`,
            `classroom`,
            `device`,
            `COALESCE(
            (SELECT classroom_id FROM device2classroom WHERE report.item_group = "device" AND report.item_id = device_id) = classroom.id,
            report.item_group = "classroom" AND report.item_id = classroom.id
            )`,
            `report.item_group = "device" AND report.item_id = device.id`,
            select
        )
    );
});

// Report classroom View route
router.get("/view/:name&:itemid", async (req, res) => {
    let name = req.params.name;
    let itemid = req.params.itemid;
    let where = `${name} = "${itemid}"`;

    res.json(
        await db.fetchAllDoubleJoinWhere(
            `report`,
            `classroom`,
            `device`,
            `COALESCE(
            (SELECT classroom_id FROM device2classroom WHERE report.item_group = "device" AND report.item_id = device_id) = classroom.id,
            report.item_group = "classroom" AND report.item_id = classroom.id
            )`,
            `report.item_group = "device" AND report.item_id = device.id`,
            where,
            select
        )
    );
});

// Report classroom View route
router.get("/classroom/view/:name&:itemid", async (req, res) => {
    let name = req.params.name;
    let itemid = req.params.itemid;
    let where = `item_group = "classroom" AND ${name} = "${itemid}"`;

    res.json(
        await db.fetchAllDoubleJoinWhere(
            `report`,
            `classroom`,
            `device`,
            `COALESCE(
            (SELECT classroom_id FROM device2classroom WHERE report.item_group = "device" AND report.item_id = device_id) = classroom.id,
            report.item_group = "classroom" AND report.item_id = classroom.id
            )`,
            `report.item_group = "device" AND report.item_id = device.id`,
            where,
            select
        )
    );
});

// Report device View route
router.get("/device/view/:name&:itemid", async (req, res) => {
    let name = req.params.name;
    let itemid = req.params.itemid;
    let where = `item_group = "device" AND ${name} = "${itemid}"`;

    res.json(
        await db.fetchAllDoubleJoinWhere(
            `report`,
            `classroom`,
            `device`,
            `COALESCE(
            (SELECT classroom_id FROM device2classroom WHERE report.item_group = "device" AND report.item_id = device_id) = classroom.id,
            report.item_group = "classroom" AND report.item_id = classroom.id
            )`,
            `report.item_group = "device" AND report.item_id = device.id`,
            where,
            select
        )
    );
});

// Report Check route
router.get("/check/:itemGroup&:itemid", async (req, res) => {
    let itemGroup = req.params.itemGroup;
    let itemid = req.params.itemid;
    let where = `item_group = "${itemGroup}" AND item_id = "${itemid}"`;

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
