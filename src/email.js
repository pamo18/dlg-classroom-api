/**
 * A module to send emails
 */
"use strict";

const nodemailer = require('nodemailer');
const emailAuth = require("../email.json");

/**
 * Send an email
 * @async
 * @returns bool
 */
async function send(from, to, subject, text, html) {
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
        from: from,
        to: to,
        subject: subject,
        text: text,
        html: html
    }

    await transporter.verify();
    await transporter.sendMail(mailOptions, function(err, info) {
        if (err) {
            console.log(err);
            return false;
        } else {
            console.log('Email sent: ' + info.response);
            return true;
        }
    });
}

module.exports = {
    send: send
}
