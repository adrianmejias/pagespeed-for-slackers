const test = require("./index.js");

test.handler(
	{
		url: "https://www.google.com",
	},
	{
		succeed: (str) => console.log,
		fail: (err) => console.error,
	}
);
