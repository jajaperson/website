/**
 * Based on <https://github.com/jackyzha0/quartz/blob/v4/quartz/util/perf.ts>
 */

import pretty from "pretty-time";
import { styleText } from "util";

/**
 * Keeps track of events in the build pipeline, including an event `"start"`
 * recorded on construction.
 */
export class PerfTimer {
	#evts: Map<string, [number, number]>;

	constructor() {
		this.#evts = new Map();
		this.addEvent("start");
	}

	/**
	 * Records an event.
	 *
	 * @param evtName event to record
	 */
	addEvent(evtName: string) {
		this.#evts.set(evtName, process.hrtime());
	}

	/**
	 * Get the elapsed time since an event
	 *
	 * @param evtName event to check
	 * @returns formatted string of elapsed time since `evtName`
	 * @throws {ReferenceError}
	 *   This exception is thrown if no event by the name `evtName` was recorded.
	 */
	timeSince(evtName = "start"): string {
		const event = this.#evts.get(evtName);
		if (event === undefined) throw new ReferenceError(`event \`${evtName}\` never recorded`);
		return styleText("yellow", pretty(process.hrtime(event)));
	}
}
