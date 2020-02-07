var express = require('express');
var router = express.Router();
const db = require("../../src/database.js");

router.post("/",
    (req, res) => getDevices(req.body, res));

async function getDevices(req, res) {
    res.json(
        await db.fetchAllJoinWhere(
            "device2classroom",
            "device",
            "device2classroom.device_id = device.id",
            `device2classroom.classroom_name = "${req.name}"`)
    );
}

module.exports = router;
