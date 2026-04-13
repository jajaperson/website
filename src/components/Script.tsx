import { FunctionComponent } from "preact";

export const Script: FunctionComponent<{ code: string }> = ({ code }) => (
	<script dangerouslySetInnerHTML={{ __html: code }} />
);
