const error = {
    database: function(res, path, err) {
        return res.status(500).json({
            errors: {
                status: 500,
                source: path,
                title: "Database error",
                detail: err.message
            }
        });
    },
    token: function(res, path, err) {
        return res.status(500).json({
            errors: {
                status: 500,
                source: path,
                title: "Token invalid",
                detail: err.message
            }
        });
    },
    hash: function(res, path, err) {
        return res.status(500).json({
            errors: {
                status: 500,
                source: path,
                title: "Password invalid",
                detail: err.message
            }
        });
    }
};

module.exports = error;
