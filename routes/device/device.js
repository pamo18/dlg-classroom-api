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

module.exports = router;
