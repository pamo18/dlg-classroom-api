var express = require('express');
var router = express.Router();
const classroom = require("../../src/classroom.js");

router.get("/", async (req, res) => {
    res.json({
        data: {
            device: await classroom.getDevices()
        }
    });
});

module.exports = router;
