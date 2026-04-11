export interface Macros {
	[name: string]: string | [string, number];
}

const renewCommandRegex = /\\(?:re)?newcommand{\\(\w+)}(?:\[(\d+)\])?(?:{(.+)})/;
const mathOperatorRegex = /\\DeclareMathOperator{\\(\w+)}{(.+)}/;

export function loadMacrosFromPreamble(preamble: string): Macros {
	const macros: Macros = {};
	preamble
		.split("\n")
		.map((line) => line.trim())
		.forEach((line) => {
			const command = line.match(renewCommandRegex);
			const operator = line.match(mathOperatorRegex);
			if (command) {
				const name = command[1];
				const args = Number(command[2]) || 0;
				const value = command[3];
				macros[name] = [value, args];
			} else if (operator) {
				const name = operator[1];
				const value = operator[2];
				macros[name] = `\\operatorname{${value}}`;
			}
		});
	return macros;
}
