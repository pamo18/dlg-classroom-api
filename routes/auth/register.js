var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");
const bcrypt = require('bcryptjs');
const saltRounds = 10;

router.post("/",
    (req, res) => register(req, res));

async function register(req, res) {
    bcrypt.hash(req.body.password, saltRounds, async (err, hash) => {
        if (err) {
            return res.json({
                err: err
            });
        }

        req.body.password = hash;

        res.json(
            await db.insert("person", req.body)
        );
    });
};

module.exports = router;
