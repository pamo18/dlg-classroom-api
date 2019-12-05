
const utils = {
    date: function(str = true) {
        let now = new Date();
        let yr = now.getFullYear();
        let mth = ((now.getMonth() + 1) < 10 ? "0" + (now.getMonth() + 1) : now.getMonth() + 1);
        let day = (now.getDate() >= 10 ? now.getDate() : "0" + now.getDate());
        let hr = (now.getHours() >= 10 ? now.getHours() : "0" + now.getHours());
        let min = (now.getMinutes() >= 10 ? now.getMinutes() : "0" + now.getMinutes());
        let sec = (now.getSeconds() >= 10 ? now.getSeconds() : "0" + now.getSeconds());
        let d = `${day}/${mth}/${yr}, ${hr}:${min}:${sec}`;

        if (str) {
            return d;
        }

        return now;
    }
};

module.exports = utils;
