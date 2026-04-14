import type { FunctionComponent } from "preact";
import { Script } from "../Script.js";

export const Page: FunctionComponent<{ title?: string; scripts?: string[] }> = ({
	children,
	title,
	scripts = [],
}) => (
	<html lang="en-GB" dir="ltr">
		<head>
			{title ? <title>{title}</title> : null}
			<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
			<link rel="stylesheet" href="/styles.css" />
		</head>
		<body class="dark:bg-mist-900">{children}</body>
		{scripts.map((scr) => (
			<Script code={scr} />
		))}
	</html>
);
