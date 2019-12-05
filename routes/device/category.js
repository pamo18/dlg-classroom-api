var express = require('express');
var router = express.Router();
const classroom = require("../../src/classroom.js");

router.get("/", async (req, res) => {
    let data = {
        categories: await classroom.getCategories()
    };

    res.json({
        data: data
    });
});

module.exports = router;
