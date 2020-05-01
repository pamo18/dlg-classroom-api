var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");

// Classroom Routes-----------------------------------------------------------//

// Index route
router.get("/", async (req, res) => {
    res.json(
        await db.fetchAllClassrooms()
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
    let params = [];

    filteredColumns.forEach(key => {
        if (key === "solved") {
            if (data[key] === "OK") {
                having = "working = 1";
            } else {
                having = "working = 0";
            }
        } else {
            filter = `${key} = "${data[key]}"`;
            params.push(filter);
        }
    });

    let where = params.join(" AND ");

    if (!where && !having) {
        res.json(
            await db.fetchAllClassrooms()
        );
    } else if (having) {
        res.json(
            await db.fetchClassroomsHaving(having, where)
        );
    } else {
        res.json(
            await db.fetchAllClassroomsWhere(where)
        );
    }
}

// Classroom View route
router.get("/view/:name/:value", async (req, res) => {
    let name = req.params.name;
    let value = req.params.value;
    let where = `${name} = "${value}"`;

    res.json(
        await db.fetchAllClassroomsWhere(where)
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
    let where1 = `item_group = "classroom" AND item_id = "${id}"`;
    let where2 = `classroom_id = "${id}"`;
    let where3 = `id = "${id}"`;

    let device = {
        classroom_id: null
    };

    await db.deleteFrom("report", where1);

    await db.update("device", device, where2);

    res.json(
        await db.deleteFrom("classroom", where3)
    );
}

// Classroom Device Routes----------------------------------------------------//

// Classroom Device View route
router.get("/device/view/:name/:value", async (req, res) => {
    let name = req.params.name;
    let value = req.params.value;
    let where = `${name} = "${value}"`

    res.json(
        await db.fetchClassroomDevices(where)
    );
});

module.exports = router;
