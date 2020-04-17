var express = require('express');
var router = express.Router();
const db = require("../../src/db.js");

// Index route
router.get("/", async (req, res) => {
    res.json(
        await db.fetchAll("person")
    );
});

router.get("/department", async (req, res) => {
    res.json(
        await db.fetchAll("person_department")
    );
});

// Person View route
router.get("/view/:name/:value", async (req, res) => {
    let name = req.params.name;
    let value = req.params.value;
    let where = `${name} = "${value}"`;

    res.json(
        await db.fetchAllWhere("person", where)
    );
});

// Person Update route
router.post("/update/:id",
    (req, res) => updatePerson(req, res));

async function updatePerson(req, res) {
    let where = `id = "${req.params.id}"`;

    res.json(
        await db.update("person", req.body, where)
    );
}

// Person Delete route
router.post("/delete/:id",
    (req, res) => deletePerson(req, res));

async function deletePerson(req, res) {
    let id = req.params.id;
    let where1 = `person_id = "${id}"`;
    let where2 = `id = "${id}"`;

    await db.deleteFrom("report", where1);

    res.json(
        await db.deleteFrom("person", where2)
    );
}

module.exports = router;
