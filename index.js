const psi = require("psi");
const request = require("request");

const config = require("./config.json");

function colorForCategory(category) {
	if (category === "FAST") {
		return "good";
	}

	if (category === "AVERAGE") {
		return "warning";
	}

	return "danger";
}

function colorForScore(score) {
	if (score >= config.pagespeed.minGoodScore) {
		return "good";
	}

	if (score >= config.pagespeed.minWarningScore) {
		return "warning";
	}

	return "danger";
}

function createAttachment(data, strategy, url) {
	// performance, accessbility, best-practices, seo, pwa
	const score = data.lighthouseResult.categories.performance.score * 100;
	const pageStats = [
		{
			short: true,
			title: "Cumulative Layout Shift Score",
			value:
				data.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE
					.category,
			color: colorForCategory(
				data.loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE
					.category
			),
		},
		{
			short: true,
			title: "First Contentful Paint MS",
			value:
				data.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS
					.category,
			color: colorForCategory(
				data.loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS
					.category
			),
		},
		{
			short: true,
			title: "First Input Delay MS",
			value: data.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.category,
			color: colorForCategory(
				data.loadingExperience.metrics.FIRST_INPUT_DELAY_MS.category
			),
		},
		{
			short: true,
			title: "Largest Contentful Paint MS",
			value:
				data.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS
					.category,
			color: colorForCategory(
				data.loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS
					.category
			),
		},
		{
			short: true,
			title: "Overall",
			value: data.loadingExperience.overall_category,
			color: colorForCategory(data.loadingExperience.overall_category),
		},
	];
	return {
		fallback: `Google PageSpeed Score for ${strategy.toUpperCase()}: ${score}\nhttps://developers.google.com/speed/pagespeed/insights/?url=${url}&tab=${
			config.pagespeed.strategy
		}`,
		title: `Google PageSpeed Score for ${strategy.toUpperCase()}: ${score}`,
		title_link: `https://developers.google.com/speed/pagespeed/insights/?url=${url}&tab=${strategy}`,
		fields: pageStats,
		color: colorForScore(score),
		text: url,
	};
}

function postToSlack(context, attachments) {
	request(
		{
			url: config.slack.incomingWebHook,
			method: "POST",
			json: true,
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: {
				channel: config.slack.channel,
				attachments: attachments,
			},
		},
		(err, res, body) => {
			if (!err && res.statusCode === 200) {
				context.succeed(body);
			} else {
				context.fail(JSON.stringify(res, null, 2));
			}
		}
	);
}

exports.handler = (e, context) => {
	if (e.hasOwnProperty("url")) {
		if (!config.pagespeed.key) {
			context.fail("Config pagespeed did not include 'key' property.");
			return;
		}

		Promise.all(
			config.pagespeed.strategy.map((strategy) => {
				return psi(e.url, {
					key: config.pagespeed.key,
					strategy: strategy,
					threshold: config.pagespeed.warningScore,
				}).then((res) => {
					return createAttachment(res.data, strategy, e.url);
				});
			})
		)
			.then((attachments) => postToSlack(context, attachments))
			.catch((err) => {
				context.fail(err);
			});
	} else {
		context.fail("Event data did not include 'url' property.");
	}
};
