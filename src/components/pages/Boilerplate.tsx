import type { FunctionComponent } from "preact";

export const BoilerPlate: FunctionComponent = ({ children }) => (
	<html lang="en-GB" dir="ltr">
		<head>
			<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
			<link rel="stylesheet" href="/styles.css" />
		</head>
		<body>{children}</body>
	</html>
);
