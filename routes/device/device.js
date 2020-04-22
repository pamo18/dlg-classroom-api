var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");

// Device Routes--------------------------------------------------------------//

// Index route
router.get("/", async (req, res) => {
    res.json(
        await db.fetchAll("device")
    );
});

// Category Index route
router.get("/category", async (req, res) => {
    res.json(
        await db.fetchAll("device_category")
    );
});

// Brand Index route
router.get("/brand", async (req, res) => {
    res.json(
        await db.fetchAll("device_brand")
    );
});

// Device Create route
router.post("/create",
    (req, res) => createDevice(req.body, res));

async function createDevice(req, res) {
    res.json(
        await db.insert("device", req)
    );
}

// Device View route
router.get("/view/:name/:value", async (req, res) => {
    let name = req.params.name;
    let value = req.params.value;
    let select = `
        SELECT
        device.*,
        classroom.id AS classroom_id,
        classroom.name AS classroom_name
    `;

    if (value === "Alla") {
        res.json(
            await db.fetchAllDoubleJoin(
                "device",
                "device2classroom",
                "classroom",
                "device.id = device2classroom.device_id",
                "classroom.id = device2classroom.classroom_id",
                select
            )
        );
    } else {
        res.json(
            await db.fetchAllDoubleJoinWhere(
                "device",
                "device2classroom",
                "classroom",
                "device.id = device2classroom.device_id",
                "classroom.id = device2classroom.classroom_id",
                `device.${name} = "${value}"`,
                select
            )
        );
    }

});

// Device Update route
router.post("/view/where",
    (req, res) => filterDevice(req, res));

async function filterDevice(req, res) {
    let data = req.body;
    let columns = Object.keys(data);
    let filteredColumns = columns.filter((key) => data[key] != "Alla");
    let filter;
    let having;

    let params = filteredColumns.map(key => {
        if (key === "solved") {
            if (data[key] === "Alla") {
                filter = null;
            } else if (data[key] === "Åtgärdat") {
                filter = `r.id IS NOT NULL`;
                having = "= 0";
            } else {
                filter = `r.id IS NOT NULL`;
                having = "> 0";
            }
        } else {
            filter = `${key} = "${data[key]}"`
        }
        return filter;
    });

    let where = params.join(" AND ");
    let select = `
        SELECT device.*
    `;

    if (!where) {
        res.json(
            await db.fetchAll("device")
        );
    } else if (having) {
        res.json(
            await db.fetchAllJoinHaving(
                select,
                `device`,
                `report r`,
                `r.item_group = "device" AND r.item_id = device.id`,
                `(SELECT COUNT(*) FROM report WHERE item_group = "device" AND item_id = device.id AND solved IS NULL) ${having}`,
                where,
                `device.id`
            )
        );
    } else {
        res.json(
            await db.fetchAllWhere("device", where)
        );
    }
}

// Device Update route
router.post("/update/:id",
    (req, res) => updateClassroom(req, res));

async function updateClassroom(req, res) {
    let where = `id = "${req.params.id}"`;

    res.json(
        await db.update("device", req.body, where)
    );
}

// Device Delete route
router.post("/delete/:id",
    (req, res) => deleteClassroom(req, res));

async function deleteClassroom(req, res) {
    let id = req.params.id;
    let where1 = `device_id = "${id}"`;
    let where2 = `id = "${id}"`;

    await db.deleteFrom("device2classroom", where1);

    res.json(
        await db.deleteFrom("device", where2)
    );
}

// Device Available Routes----------------------------------------------------//

// Available Devices route
router.get("/available", async (req, res) => {
    res.json(
        await db.fetchAllJoinWhere(
            "device",
            "device2classroom",
            "device.id = device2classroom.device_id",
            "device2classroom.device_id IS NULL")
    );
});

module.exports = router;
