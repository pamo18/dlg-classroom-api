var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");

// Index route
router.get("/", async (req, res) => {
    res.json(await db.fetchAll("device"));
});

// Index Category route
router.get("/category", async (req, res) => {
    res.json(await db.fetchAll("category"));
});

// Index Brand route
router.get("/brand", async (req, res) => {
    res.json(await db.fetchAll("brand"));
});

// Create route
router.post("/create",
    (req, res) => createDevice(req.body, res));

async function createDevice(req, res) {
    res.json(
        await db.insert("device", req)
    );
}

// View route
router.get("/view/:id", async (req, res) => {
    let where = `id = "${req.params.id}"`;
    res.json(await db.fetchAllWhere("device", where));
});

// Update route
router.post("/update/:id",
    (req, res) => updateClassroom(req, res));

async function updateClassroom(req, res) {
    let where = `id = "${req.params.id}"`;
    await db.update("device", req.body, where);
}

// Delete route
router.post("/delete/:id",
    (req, res) => deleteClassroom(req, res));

async function deleteClassroom(req, res) {
    let where = `id = "${req.params.id}"`;
    await db.deleteFrom("device", where);
}

module.exports = router;
