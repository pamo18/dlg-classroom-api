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
        await db.fetchAll("category")
    );
});

// Brand Index route
router.get("/brand", async (req, res) => {
    res.json(
        await db.fetchAll("brand")
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
router.get("/view/:name&:value", async (req, res) => {
    let name = req.params.name;
    let value = req.params.value;

    if (value === "all") {
        res.json(
            await db.fetchAllDoubleJoin(
                "device",
                "device2classroom",
                "classroom",
                "device.id = device2classroom.device_id",
                "classroom.id = device2classroom.classroom_id"
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
                `device.${name} = "${value}"`
            )
        );
    }

});

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
    let id = req.params.id;

    res.json(
        await db.fetchAllJoinWhere(
            "device",
            "device2classroom",
            "device.id = device2classroom.device_id",
            "device2classroom.device_id IS NULL")
    );
});

module.exports = router;
