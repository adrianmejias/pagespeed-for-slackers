"use strict";

const axios = require("axios").default;

const config = require("./config.json");
const { isUrl } = require("./src/is-url");
const { getAttachments } = require("./src/attachments");

exports.handler = async (event, context, callback) => {
    if (!event.hasOwnProperty("url")) {
        context.fail("No url property specified.");
        return;
    }

    if (!isUrl(event.url)) {
        context.fail("Invalid url property specified.");
        return;
    }

    if (!config.pagespeed.key) {
        context.fail("No pagespeed api key specified.");
        return;
    }

    let attachments = null;

    try {
        attachments = await getAttachments(event.url);
    } catch (err) {
        context.fail(err.message);
        return;
    }

    let result = null;

    try {
        result = await axios.post(
            config.slack.incomingWebHook,
            {
                channel: config.slack.channel,
                attachments: attachments,
            },
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (err) {
        context.fail(err.message);
        return;
    }

    context.succeed(
        JSON.stringify({
            success: true,
            url: event.url,
            strategy: config.pagespeed.strategy,
            result: result,
        })
    );
};
