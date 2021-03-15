"use strict";

exports.ucfirst = (str) => {
    if (typeof str !== "string") {
        return "";
    }

    return str.toLowerCase().charAt(0).toUpperCase() + str.slice(1);
};
