import type { FunctionComponent } from "preact";
import { BoilerPlate } from "./Boilerplate.js";

export const ContentPage: FunctionComponent = ({ children }) => (
	<BoilerPlate>
		<article class="prose m-8">{children}</article>
	</BoilerPlate>
);
