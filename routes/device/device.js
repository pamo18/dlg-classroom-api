var express = require('express');
var router = express.Router();
const db = require("../../src/database.js");

router.get("/", async (req, res) => {
    res.json({
        data: {
            device: await db.fetchAll("device")
        }
    });
});

module.exports = router;
