import type { FunctionComponent } from "preact";

export const Page: FunctionComponent<{ title?: string }> = ({ children, title }) => (
	<html lang="en-GB" dir="ltr">
		<head>
			{title ? <title>{title}</title> : null}
			<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
			<link rel="stylesheet" href="/styles.css" />
		</head>
		<body class="dark:bg-mist-900">{children}</body>
	</html>
);
