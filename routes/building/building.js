var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");

router.get("/", async (req, res) => {
    res.json(
        await db.fetchAll("building")
    );
});

module.exports = router;
