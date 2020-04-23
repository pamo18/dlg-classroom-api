var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");
const nodemailer = require('nodemailer');
const emailAuth = require("../../email.json");
let select = `
    SELECT
    report.*,
    (SELECT CONCAT(firstname, " ", lastname) FROM person WHERE id = report.person_id) AS person,
    classroom.id AS classroom_id,
    classroom.name AS classroom_name,
    classroom.type AS classroom_type,
    classroom.building AS classroom_building,
    classroom.level AS classroom_level,
    classroom.image AS classroom_image,
    device.id AS device_id,
    device.brand AS device_brand,
    device.model AS device_model,
    device.category AS device_category,
    device.url AS device_url
`;

// Index route
router.get("/", async (req, res) => {
    res.json(
        await db.fetchAllDoubleJoin(
            `report`,
            `classroom`,
            `device`,
            `COALESCE(
            (SELECT classroom_id FROM device2classroom WHERE report.item_group = "device" AND report.item_id = device_id) = classroom.id,
            report.item_group = "classroom" AND report.item_id = classroom.id
            )`,
            `report.item_group = "device" AND report.item_id = device.id`,
            select,
            "report.created DESC"
        )
    );
});

// Report classroom View route
router.get("/view/:name/:value", async (req, res) => {
    let name = req.params.name;
    let value = req.params.value;
    let where = `${name} = "${value}"`;

    res.json(
        await db.fetchAllDoubleJoinWhere(
            `report`,
            `classroom`,
            `device`,
            `COALESCE(
            (SELECT classroom_id FROM device2classroom WHERE report.item_group = "device" AND report.item_id = device_id) = classroom.id,
            report.item_group = "classroom" AND report.item_id = classroom.id
            )`,
            `report.item_group = "device" AND report.item_id = device.id`,
            where,
            select,
            "report.created DESC"
        )
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
            } else if (data[key] === "Åtgärdat") {
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
            await db.fetchAllDoubleJoin(
                `report`,
                `classroom`,
                `device`,
                `COALESCE(
                (SELECT classroom_id FROM device2classroom WHERE report.item_group = "device" AND report.item_id = device_id) = classroom.id,
                report.item_group = "classroom" AND report.item_id = classroom.id
                )`,
                `report.item_group = "device" AND report.item_id = device.id`,
                select,
                "report.created DESC"
            )
        );
    } else {
        res.json(
            await db.fetchAllDoubleJoinWhere(
                `report`,
                `classroom`,
                `device`,
                `COALESCE(
                (SELECT classroom_id FROM device2classroom WHERE report.item_group = "device" AND report.item_id = device_id) = classroom.id,
                report.item_group = "classroom" AND report.item_id = classroom.id
                )`,
                `report.item_group = "device" AND report.item_id = device.id`,
                where,
                select,
                "report.created DESC"
            )
        );
    }
};

// Report classroom View route
router.get("/classroom/view/:name/:itemid", async (req, res) => {
    let name = req.params.name;
    let itemid = req.params.itemid;
    let where = `item_group = "classroom" AND ${name} = "${itemid}"`;

    res.json(
        await db.fetchAllDoubleJoinWhere(
            `report`,
            `classroom`,
            `device`,
            `COALESCE(
            (SELECT classroom_id FROM device2classroom WHERE report.item_group = "device" AND report.item_id = device_id) = classroom.id,
            report.item_group = "classroom" AND report.item_id = classroom.id
            )`,
            `report.item_group = "device" AND report.item_id = device.id`,
            where,
            select,
            "report.created DESC"
        )
    );
});

// Report device View route
router.get("/device/view/:name/:itemid", async (req, res) => {
    let name = req.params.name;
    let itemid = req.params.itemid;
    let where = `item_group = "device" AND ${name} = "${itemid}"`;

    res.json(
        await db.fetchAllDoubleJoinWhere(
            `report`,
            `classroom`,
            `device`,
            `COALESCE(
            (SELECT classroom_id FROM device2classroom WHERE report.item_group = "device" AND report.item_id = device_id) = classroom.id,
            report.item_group = "classroom" AND report.item_id = classroom.id
            )`,
            `report.item_group = "device" AND report.item_id = device.id`,
            where,
            select,
            "report.created DESC"
        )
    );
});

// Report Check route
router.get("/check/:itemGroup/:itemid", async (req, res) => {
    let itemGroup = req.params.itemGroup;
    let itemid = req.params.itemid;

    if (itemGroup === "report") {
        res.json(
            await db.fetchAllWhere("report", `id = "${itemid}" AND solved IS NULL`)
        );
    } else {
        let where = `item_group = "${itemGroup}" AND item_id = "${itemid}" AND solved IS NULL`;

        if (itemGroup === "classroom") {
            let res1 = await db.fetchAllJoinWhere(
                `device2classroom`,
                `report`,
                `report.item_group = "device" AND report.item_id = device2classroom.device_id AND report.solved IS NULL`,
                `classroom_id = ${itemid} AND report.id IS NOT NULL`
            );

            if (res1.length > 0) {
                return res.json(res1);
            }
        }

        res.json(
            await db.fetchAllWhere("report", where)
        );
    }
});

// Report Filter route
router.get("/filter", async (req, res) => {

    res.json(
        [{solved: "Åtgärdat"}, {solved: "Att göra"}]
    );
});

// Report Create route
router.post("/create",
    (req, res, next) => createReport(req, res, next),
    (req, res, next) => getPerson(req, res, next),
    (req, res) => sendMail(req, res));

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

async function sendMail(req, res) {
    let report = req.body;
    let person = report.person;
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
        to: "pauljm80@gmail.com",
        subject: report.name,
        text: report.message,
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
            <p>${report.message}</p>
            <a class="button" href="https://dlg.klassrum.online/report/page/${report.id}/${report.item_group}/${report.item_id}">Läs mer</a>
            <p>Från:</p>
            <p>${person.firstname} ${person.lastname}</p>
            <p>${person.email}</p>
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

// Report Update route
router.post("/update/:id",
    (req, res) => updateReport(req, res));

async function updateReport(req, res) {
    let where = `id = "${req.params.id}"`;

    res.json(
        await db.update("report", req.body, where)
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
