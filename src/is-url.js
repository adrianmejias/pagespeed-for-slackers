"use strict";

exports.isUrl = (str) => {
    let url = {
        protocol: "",
    };

    try {
        url = new URL(str);
    } catch (err) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
};
