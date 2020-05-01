var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");

// Device Routes--------------------------------------------------------------//

// Index route
router.get("/", async (req, res) => {
    res.json(
        await db.fetchAllDevices()
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
    let where = `${name} = "${value}"`;

    res.json(
        await db.fetchAllDevicesWhere(where)
    );
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
    let params = [];

    filteredColumns.forEach(key => {
        if (key === "solved") {
            if (data[key] === "OK") {
                having = "working = 1";
            } else {
                having = "working = 0";
            }
        } else {
            filter = `${key} = "${data[key]}"`;
            params.push(filter);
        }
    });

    let where = params.join(" AND ");

    if (!where && !having) {
        res.json(
            await db.fetchAllDevices()
        );
    } else if (having) {
        res.json(
            await db.fetchDevicesHaving(having, where)
        );
    } else {
        res.json(
            await db.fetchAllDevicesWhere(where)
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
    let where1 = `item_group = "device" AND item_id = "${id}"`;
    let where2 = `id = "${id}"`;

    await db.deleteFrom("report", where1);

    res.json(
        await db.deleteFrom("device", where2)
    );
}

// Device Available Routes----------------------------------------------------//

// Available Devices route
router.get("/available", async (req, res) => {
    res.json(
        await db.fetchAllDevicesAvailable()
    );
});

module.exports = router;
