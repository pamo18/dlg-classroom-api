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

// Classroom Create route
router.post("/create",
    (req, res) => createClassroom(req, res));

async function createClassroom(req, res) {
    res.json(
        await db.insert("classroom", req.body)
    );
}

// Classroom View route
router.get("/view/:id", async (req, res) => {
    let where = `id = "${req.params.id}"`;
    res.json(await db.fetchAllWhere("classroom", where));
});

// Classroom Update route
router.post("/update/:id",
    (req, res) => updateClassroom(req, res));

async function updateClassroom(req, res) {
    let where = `id = "${req.params.id}"`;
    await db.update("classroom", req.body, where);
}

// Classroom Delete route
router.post("/delete/:id",
    (req, res) => deleteClassroom(req, res));

async function deleteClassroom(req, res) {
    let where = `id = "${req.params.id}"`;
    await db.deleteFrom("classroom", where);
}

// Classroom Device View route
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

// Add Device to Classroom
router.post("/device/create",
    (req, res) => addClassroomDevice(req, res));

async function addClassroomDevice(req, res) {
    res.json(
        await db.insert("device2classroom", req.body)
    );
}

// Remove Device from Classroom
router.post("/device/delete/:classroomid&:deviceid",
    (req, res) => deleteClassroomDevice(req, res));

async function deleteClassroomDevice(req, res) {
    let where = `classroom_id = "${req.params.classroomid}" AND device_id = "${req.params.deviceid}"`;
    await db.deleteFrom("device2classroom", where);
}

module.exports = router;
