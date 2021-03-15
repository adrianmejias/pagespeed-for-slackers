"use strict";

const chai = require("chai");
const expect = chai.expect;
const LambdaTester = require("lambda-tester");
const lambdaFunction = require("../index.js").handler;

describe("lambdaFunction", async () => {
    it("Successful Invocation of https://www.google.com/", async () => {
        LambdaTester(lambdaFunction)
            .event({
                url: "https://www.google.com/",
            })
            .expectSucceed(async (result) => {
                expect(result.success).to.be.true;
            });
    });

    it("Unsuccessful Invocation of empty url property", async () => {
        LambdaTester(lambdaFunction)
            .event({})
            .expectFail((err) =>
                expect(err.message).to.equal("No url property specified.")
            );
    });

    it("Unsuccessful Invocation of an invalid url property", async () => {
        LambdaTester(lambdaFunction)
            .event({
                url: "_this_is_an_invalid_url_",
            })
            .expectFail((err) =>
                expect(err.message).to.equal("Invalid url property specified.")
            );
    });
});
