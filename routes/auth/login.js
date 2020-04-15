/*eslint max-len: ["error", { "code": 200 }]*/
var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post("/",
    (req, res) => login(req, res));

async function login(req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let where = `email = "${email}"`;

    let person = await db.fetchAllWhere("person", where);

    if (!person) {
         return res.json({
                person: false,
                email: false,
                password: false,
                token: null
            });
    }

    let personData = person[0];
    let hash = personData.password;

    bcrypt.compare(password, hash, function(err, match) {
        if (err) {
            return res.json({
                err: err
            });
        }

        if (match) {
            const payload = { email: personData.email };
            const secret = process.env.JWT_SECRET;
            const token = jwt.sign(payload, secret, { expiresIn: '48h'});

            res.json({
                person: personData,
                email: true,
                password: true,
                token: token
            });
        } else {
            res.json({
                person: false,
                email: true,
                password: false,
                token: null
            });
        }
    });
};

module.exports = router;
