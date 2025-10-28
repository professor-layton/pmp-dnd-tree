import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";
import { PMPDnDTreePreviewProps } from "../typings/PMPDnDTreeProps";

export function preview({ sampleText }: PMPDnDTreePreviewProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText} />;
}

export function getPreviewCss(): string {
    return require("./ui/PMPDnDTree.css");
}
