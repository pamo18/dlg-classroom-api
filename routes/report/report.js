var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");

// Report Create route
router.post("/create",
    (req, res) => createReport(req, res));

async function createReport(req, res) {
    res.json(
        await db.insert("report", req.body)
    );
}

// Report View route
router.get("/check/:item&:id", async (req, res) => {
    let item = req.params.item;
    let id = req.params.id;
    let where = `item = "${item}" AND id = "${id}"`;

    res.json(
        await db.fetchAllWhere("report", where)
    );
});

module.exports = router;
