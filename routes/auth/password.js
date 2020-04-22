/*eslint max-len: ["error", { "code": 200 }]*/
var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const nodemailer = require('nodemailer');
const emailAuth = require("../../email.json");

router.post("/change",
    (req, res) => changePassword(req, res));

async function changePassword(req, res) {
    let id = req.body.id;
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;
    let where = `id = "${id}"`;

    let person = await db.fetchAllWhere("person", where);

    if (!person.length > 0) {
         return res.json({ err: "Personen hittades inte." });
    }

    let personData = person[0];
    let hash = personData.password;

    bcrypt.compare(oldPassword, hash, function(err, match) {
        if (err) {
            return res.json({
                err: err
            });
        }

        if (match) {
            bcrypt.hash(newPassword, saltRounds, async (err, hash) => {
                if (err) {
                    return res.json({
                        err: err
                    });
                }

                res.json(
                    await db.update("person", { password: hash }, where)
                );
            });
        } else {
            res.json({ err: "Gammal lösenord ogiltid!" });
        }
    });
};

router.post("/forgot",
    (req, res) => forgotPassword(req, res));

async function forgotPassword(req, res) {
    let email = req.body.email;
    let where = `email = "${email}"`;

    let person = await db.fetchAllWhere("person", where);

    if (!person.length > 0) {
        return res.json({ err: "Personen hittades inte." });
    } else {
        res.json({ success: true });
    }

    let personData = person[0];

    const payload = { email: personData.email };
    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret, { expiresIn: '1m'});

    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: "OAuth2",
            user: "paul@pamosystems.com",
            serviceClient: emailAuth.client_id,
            privateKey: emailAuth.private_key
        }
    });

    let mailOptions = {
        from: "paul@pamosystems.com",
        to: personData.email,
        subject: "Återställa Lösenord",
        text: `Klicka på länken nedan för att återställa ditt lösenord.
            https://dlg.klassrum.online/reset/${token}`,
        html: `
        <head>
            <style type = text/css>
                p {
                    text-align: center;
                }

                .button {
                    width: 20rem;
                    margin: 0 auto;
                    font-size: 1.5rem;
                    padding: 0.6rem;
                    -webkit-transition-duration: 0.2s;
                    transition-duration: 0.2s;
                    background-color: rgb(46, 174, 52, 0.7);
                    color: white;
                    box-sizing: border-box;
                    display: block;
                    text-align: center;
                    text-decoration: none;
                    border-radius: 5px;
                    border: none;
                    cursor: pointer;
                }

                .button:hover {
                    background-color: rgb(46, 174, 52, 1);
                }
            </style>
        </head>
        <body>
            <p>Klicka på länken nedan för att återställa din lösenord.</p>
            <a class="button" href="https://dlg.klassrum.online/reset/${token}">Återställ Lösenord</a>
        </body>`
    };

    await transporter.verify();
    await transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

router.post("/reset",
    (req, res) => resetPassword(req, res));

async function resetPassword(req, res) {
    const token = req.headers['x-access-token'];
    const secret = process.env.JWT_SECRET;
    let email = req.body.email;
    let password = req.body.password;
    let where = `email = "${email}"`;

    let person = await db.fetchAllWhere("person", where);

    if (!person.length > 0) {
         return res.json({
             err: "Personen hittades inte."
         });
    }

    let personData = person[0];

    // eslint-disable-next-line no-unused-vars
    jwt.verify(token, secret, function(err, decoded) {
        if (err) {
            return res.json({
                err: "Denna länk är gammal eller ogiltid, skicka efter en ny länk."
            });
        } else {
            bcrypt.hash(password, saltRounds, async (error, hash) => {
                if (error) {
                    return res.json({
                        err: error
                    });
                }

                return res.json(
                    await db.update("person", { password: hash }, where)
                );
            });
        }
    });
};

module.exports = router;
