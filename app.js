/**
 * An Express server.
 */

"use strict";

const port = 8333;
const express = require("express");
const app = express();
const cors = require('cors');
const bodyParser = require("body-parser");
 // Home route
const index = require('./routes/index.js');
// Device routes
const device = require('./routes/device/device.js');
// Classroom routes
const classroom = require('./routes/classroom/classroom.js');
const building = require('./routes/building/building.js');
// Person route
const person = require('./routes/person/person.js');
// Report routes
const report = require('./routes/report/report.js');

// This is middleware called for all routes.
// Middleware takes three parameters.
app.use((req, res, next) => {
    console.log(req.method);
    console.log(req.path);
    next();
});

app.use(cors()); //Cross-Origin Resource Sharing (CORS)

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use("/", index);
app.use("/device", device);
app.use("/classroom", classroom);
app.use("/building", building);
app.use("/person", person);
app.use("/report", report);

// Add routes for 404 and error handling
// Catch 404 and forward to error handler
// Put this last
app.use((req, res, next) => {
    var err = new Error("Not Found");

    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        "errors": [
            {
                "status": err.status,
                "title":  err.message,
                "detail": err.message
            }
        ]
    });
});

// Start up server
const server = app.listen(port, () => console.log(`Example API listening on port ${port}!`));

module.exports = server;
