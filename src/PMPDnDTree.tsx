import { ReactElement, createElement } from "react";
import { TreeTable } from "./components/TreeTable";
import { sampleTreeData } from "./data/sampleData";

import { PMPDnDTreeContainerProps } from "../typings/PMPDnDTreeProps";

import "./ui/PMPDnDTree.css";

export function PMPDnDTree({ sampleText }: PMPDnDTreeContainerProps): ReactElement {
    const handleNodeToggle = (nodeId: string) => {
        console.log("Node toggled:", nodeId);
    };

    const handleNodeSelect = (nodeId: string, selected: boolean) => {
        console.log("Node selected:", nodeId, selected);
    };

    return (
        <div className="pmp-dnd-tree-widget">
            <TreeTable 
                data={sampleTreeData} 
                onNodeToggle={handleNodeToggle}
                onNodeSelect={handleNodeSelect}
                className="group-plants-tree"
            />
            {sampleText && (
                <div className="sample-text">
                    Sample Text: {sampleText}
                </div>
            )}
        </div>
    );
}
