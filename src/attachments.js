"use strict";

const psi = require("psi");

const config = require("../config.json");
const { ucfirst } = require("./ucfirst");
const { scoreColor } = require("./score-color");

const createAttachment = (data, strategy, url) => {
    const score = Math.round(
        data.lighthouseResult.categories.performance.score * 100
    );
    const scores = [
        {
            title: "Accessibility",
            key: "accessibility",
        },
        {
            title: "Best Practices",
            key: "best-practices",
        },
        {
            title: "SEO",
            key: "seo",
        },
        {
            title: "PWA",
            key: "pwa",
        },
    ].map((category) => {
        if (data.lighthouseResult.categories.hasOwnProperty(category.key)) {
            return {
                short: true,
                title: category.title,
                value: Math.round(
                    data.lighthouseResult.categories[category.key].score * 100
                ),
            };
        }
    });

    return {
        fallback: `Google PageSpeed Score for ${ucfirst(
            strategy
        )}: ${score}\nhttps://developers.google.com/speed/pagespeed/insights/?url=${encodeURI(
            url
        )}&tab=${strategy}`,
        title: `Google PageSpeed Score for ${ucfirst(strategy)}: ${score}`,
        title_link: `https://developers.google.com/speed/pagespeed/insights/?url=${encodeURI(
            url
        )}&tab=${strategy}`,
        fields: scores,
        color: scoreColor(score),
        text: url,
    };
};

exports.createAttachment = createAttachment;

exports.getAttachments = async (url) => {
    return await Promise.all(
        config.pagespeed.strategy.map(async (strategy) => {
            return await psi(url, {
                key: config.pagespeed.key,
                strategy: strategy,
                threshold: config.pagespeed.minWarningScore,
            }).then((response) =>
                createAttachment(response.data, strategy, url)
            );
        })
    );
};
