var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");
let select = `
    SELECT
    report.*,
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
    (req, res) => createReport(req, res));

async function createReport(req, res) {
    res.json(
        await db.insert("report", req.body)
    );
}

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
