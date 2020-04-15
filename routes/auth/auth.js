var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');

router.post("/", (req, res) => {
    const token = req.headers['x-access-token'];
    const secret = process.env.JWT_SECRET;

    // eslint-disable-next-line no-unused-vars
    jwt.verify(token, secret, function(err, decoded) {
        let active;

        if (err) {
            active = false;
        } else {
            active = true;
        }

        return res.json({
            active: active
        });
    });
});

module.exports = router;
