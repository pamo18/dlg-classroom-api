var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");
const email = require("../../src/email.js");

// Index route
router.get("/", async (req, res) => {
    res.json(
        await db.fetchAllReports()
    );
});

// Report classroom View route
router.get("/view/:name/:value", async (req, res) => {
    let name = req.params.name;
    let value = req.params.value;
    let where = `${name} = "${value}"`;

    res.json(
        await db.fetchAllReportsWhere(where)
    );
});

// Report classroom View route
router.post("/view/where",
    (req, res) => filterReport(req, res));

async function filterReport(req, res) {
    let data = req.body;
    let columns = Object.keys(data);
    let filteredColumns = columns.filter((key) => data[key] != "Alla");
    let filter;

    let params = filteredColumns.map(key => {
        if (key === "solved") {
            if (data[key] === "Alla") {
                filter = null;
            } else if (data[key] === "OK") {
                filter = `report.solved IS NOT NULL`;
            } else {
                filter = `report.solved IS NULL`;
            }
        } else {
            filter = `${key} = "${data[key]}"`
        }
        return filter;
    });

    let where = params.join(" AND ");

    if (!where) {
        res.json(
            await db.fetchAllReports()
        );
    } else {
        res.json(
            await db.fetchAllReportsWhere(where)
        );
    }
};

// Report classroom View route
router.get("/classroom/view/:name/:itemid", async (req, res) => {
    let name = req.params.name;
    let itemid = req.params.itemid;
    let where = `item_group = "classroom" AND ${name} = "${itemid}"`;

    res.json(
        await db.fetchAllReportsWhere(where)
    );
});

// Report device View route
router.get("/device/view/:name/:itemid", async (req, res) => {
    let name = req.params.name;
    let itemid = req.params.itemid;
    let where = `item_group = "device" AND ${name} = "${itemid}"`;

    res.json(
        await db.fetchAllReportsWhere(where)
    );
});

// Report Filter route
router.get("/filter", async (req, res) => {

    res.json(
        [{solved: "OK"}, {solved: "Att göra"}]
    );
});

// Report Create route
router.post("/create",
    (req, res, next) => createReport(req, res, next),
    (req, res, next) => getPerson(req, res, next),
    (req, res) => sendCreateEmail(req, res));

async function createReport(req, res, next) {
    let result = await db.insert("report", req.body);

    req.body.id = result.insertId;

    res.json(result);

    next();
}

async function getPerson(req, res, next) {
    let personid = req.body.person_id;
    let where = `id = "${personid}"`;
    let person = await db.fetchAllWhere("person", where);

    req.body.person = person[0];

    next();
}

async function sendCreateEmail(req, res) {
    let report = req.body;
    let person = report.person;
    let from = "paul@pamosystems.com";
    let to = "pauljm80@gmail.com";
    let subject = report.name;
    let text = report.message;
    let html =`
        <head>
            <style type = text/css>
                p {
                    text-align: left;
                }

                .button {
                    width: 20rem;
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
            <h1>${report.name}</h1>
            <p>${report.message}</p>
            <a class="button" href="https://dlg.klassrum.online/report/page/${report.id}/${report.item_group}/${report.item_id}">Läs mer</a>
            <p>
                Från:</br>
                ${person.firstname} ${person.lastname}</br>
                ${person.email}
            </p>
        </body>`;

    email.send(from, to, subject, text, html);
};

// Report Solved route
router.post("/solved/:id",
    (req, res, next) => updateSolvedReport(req, res, next),
    (req, res, next) => getPerson(req, res, next),
    (req, res) => sendSolvedEmail(req, res));

async function updateSolvedReport(req, res, next) {
    let where = `id = "${req.params.id}"`;
    let data = {
        name: req.body.name,
        message: req.body.message,
        action: req.body.action,
        solved: req.body.solved
    };

    res.json(
        await db.update("report", data, where)
    );

    next();
}

async function sendSolvedEmail(req, res) {
    let report = req.body;
    let person = report.person;
    let from = "paul@pamosystems.com";
    let to = person.email;
    let subject = `Åtgärdat: ${report.name}`;
    let text = report.action;
    let html =`
        <head>
            <style type = text/css>
                p {
                    text-align: left;
                }

                .title {
                    font-weight: bold;
                    font-size: 14px;
                }

                .button {
                    width: 20rem;
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
            <h1>Din ärende är nu åtgärdat!</h1>
            <p>${report.action}</p>
            <h2>Om ärendet</h2>
            <p>
                <span class="title">${report.name}</span></br>
                ${report.message}
            </p>
            <a class="button" href="https://dlg.klassrum.online/report/page/${report.id}/${report.item_group}/${report.item_id}">Läs mer</a>
            <p>
                Hälsningar</br>
                ${report.from.firstname} ${report.from.lastname}</br>
                ${report.from.email}
            </p>
        </body>`;

        email.send(from, to, subject, text, html);
}

// Report Update route
router.post("/update/:id",
    (req, res) => updateReport(req, res));

async function updateReport(req, res) {
    let where = `id = "${req.params.id}"`;
    let data = {
        name: req.body.name,
        message: req.body.message,
        action: req.body.action,
        solved: req.body.solved
    };

    res.json(
        await db.update("report", data, where)
    );
}

// Report Delete route
router.post("/delete/:id",
    (req, res) => deleteReport(req, res));

async function deleteReport(req, res) {
    let id = req.params.id;
    let where = `id = "${id}"`;

    res.json(
        await db.deleteFrom("report", where)
    );
}

module.exports = router;
