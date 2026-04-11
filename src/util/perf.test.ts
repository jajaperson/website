import { beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import { PerfTimer } from "./perf.js";

describe("PerfTimer", () => {
	let perf: PerfTimer;

	beforeEach(() => {
		perf = new PerfTimer();
	});

	it("should record `start` event", () => {
		perf.timeSince("start");
	});

	it("should throw ReferenceError nonexistant event", () => {
		assert.throws(() => perf.timeSince("genesis"), ReferenceError);
	});

	it("should record events", () => {
		perf.addEvent("event1");
		perf.addEvent("event2");
		perf.timeSince("event1");
		perf.timeSince("event2");
	});
});
