"use strict";

const config = require("../config.json");

exports.scoreColor = (score) => {
    if (score >= config.pagespeed.minGoodScore) {
        return "good";
    }

    if (score >= config.pagespeed.minWarningScore) {
        return "warning";
    }

    return "danger";
};
