var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");

// All Classroom Routes

// Index route
router.get("/", async (req, res) => {
    res.json(await db.fetchAll("classroom"));
});

// Type Index route
router.get("/type", async (req, res) => {
    res.json(await db.fetchAll("classroom_type"));
});

// Create route
router.post("/create",
    (req, res) => createClassroom(req, res));

async function createClassroom(req, res) {
    res.json(
        await db.insert("classroom", req.body)
    );
}

// View route
router.get("/view/:id", async (req, res) => {
    let where = `id = "${req.params.id}"`;
    res.json(await db.fetchAllWhere("classroom", where));
});

// Device View route
router.get("/device/view/:id", async (req, res) => {
    let id = req.params.id;

    res.json(
        await db.fetchAllJoinWhere(
            "device2classroom",
            "device",
            "device2classroom.device_id = device.id",
            `device2classroom.classroom_id = "${id}"`)
    );
});

// Update route
router.post("/update/:id",
    (req, res) => updateClassroom(req, res));

async function updateClassroom(req, res) {
    let where = `id = "${req.params.id}"`;
    await db.update("classroom", req.body, where);
}

// Delete route
router.post("/delete/:id",
    (req, res) => deleteClassroom(req, res));

async function deleteClassroom(req, res) {
    let where = `id = "${req.params.id}"`;
    await db.deleteFrom("classroom", where);
}

module.exports = router;
