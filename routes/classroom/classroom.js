var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");

// Classroom Routes-----------------------------------------------------------//

// Index route
router.get("/", async (req, res) => {
    res.json(
        await db.fetchAll("classroom")
    );
});

router.get("/building", async (req, res) => {
    res.json(
        await db.fetchAll("classroom_building")
    );
});

// Type Index route
router.get("/type", async (req, res) => {
    res.json(
        await db.fetchAll("classroom_type")
    );
});

// Classroom Create route
router.post("/create",
    (req, res) => createClassroom(req, res));

async function createClassroom(req, res) {
    res.json(
        await db.insert("classroom", req.body)
    );
}

// Classroom view where route
router.post("/view/where",
    (req, res) => filterClassroom(req, res));

async function filterClassroom(req, res) {
    let data = req.body;
    let columns = Object.keys(data);
    let filteredColumns = columns.filter((key) => data[key] != "Alla");
    let filter;
    let having;

    let params = filteredColumns.map(key => {
        if (key === "solved") {
            if (data[key] === "Alla") {
                filter = null;
            } else if (data[key] === "Åtgärdat") {
                filter = `r.id IS NOT NULL`;
                having = "= 0";
            } else {
                filter = `r.id IS NOT NULL`;
                having = "> 0";
            }
        } else {
            filter = `${key} = "${data[key]}"`
        }
        return filter;
    });

    let where = params.join(" AND ");
    let select = `
        SELECT classroom.*
    `;

    if (!where) {
        res.json(
            await db.fetchAll("classroom")
        );
    } else if (having) {
        res.json(
            await db.fetchAllDoubleJoinHaving(
                select,
                `classroom`,
                `device2classroom dc`,
                `report r`,
                `dc.classroom_id = classroom.id`,
                `COALESCE(
                (r.item_group = "classroom" AND r.item_id = classroom.id),
                (r.item_group = "device" AND r.item_id = dc.device_id))`,
                `SUM((SELECT COUNT(*) FROM report WHERE item_group = "classroom" AND item_id = classroom.id AND solved IS NULL) +
                (SELECT COUNT(*) FROM report WHERE item_group = "device" AND item_id = dc.device_id AND solved IS NULL)) ${having}`,
                where,
                `classroom.id`
            )
        );
    } else {
        res.json(
            await db.fetchAllWhere("classroom", where)
        );
    }
}

// Classroom View route
router.get("/view/:name/:value/:name2?/:value2?", async (req, res) => {
    let name = req.params.name;
    let value = req.params.value;
    let where = `${name} = "${value}"`;

    res.json(
        await db.fetchAllWhere("classroom", where)
    );
});

// Classroom Update route
router.post("/update/:id",
    (req, res) => updateClassroom(req, res));

async function updateClassroom(req, res) {
    let where = `id = "${req.params.id}"`;

    res.json(
        await db.update("classroom", req.body, where)
    );
}

// Classroom Delete route
router.post("/delete/:id",
    (req, res) => deleteClassroom(req, res));

async function deleteClassroom(req, res) {
    let id = req.params.id;
    let where1 = `classroom_id = "${id}"`;
    let where2 = `id = "${id}"`;

    await db.deleteFrom("device2classroom", where1);

    res.json(
        await db.deleteFrom("classroom", where2)
    );
}

// Classroom Device Routes----------------------------------------------------//

// Classroom Device View route
router.get("/device/view/:name/:value/:name2?/:value2?", async (req, res) => {
    let name = req.params.name;
    let value = req.params.value;

    res.json(
        await db.fetchAllJoinWhere(
            "device2classroom",
            "device",
            "device2classroom.device_id = device.id",
            `device2classroom.${name} = "${value}"`)
    );
});

// Add Device to Classroom
router.post("/device/create",
    (req, res) => addClassroomDevice(req, res));

async function addClassroomDevice(req, res) {
    res.json(
        await db.insert("device2classroom", req.body)
    );
}

// Update Device from Classroom
router.post("/device/update/:classroomFrom/:deviceid",
    (req, res) => updateClassroomDevice(req, res));

async function updateClassroomDevice(req, res) {
    let where = `classroom_id = "${req.params.classroomFrom}" AND device_id = "${req.params.deviceid}"`;

    res.json(
        await db.update("device2classroom", req.body, where)
    );
}

// Remove Device from Classroom
router.post("/device/delete/:classroomid/:deviceid",
    (req, res) => deleteClassroomDevice(req, res));

async function deleteClassroomDevice(req, res) {
    let where = `classroom_id = "${req.params.classroomid}" AND device_id = "${req.params.deviceid}"`;

    res.json(
        await db.deleteFrom("device2classroom", where)
    );
}

module.exports = router;
