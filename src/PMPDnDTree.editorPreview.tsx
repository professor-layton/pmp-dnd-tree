import { ReactElement, createElement } from "react";
import { PMPDnDTreePreviewProps } from "../typings/PMPDnDTreeProps";
import { sampleTreeData } from "./data/sampleData";
import { TreeTable } from "./components/TreeTable";

import "./ui/PMPDnDTree.css";

export function preview({}: PMPDnDTreePreviewProps): ReactElement {
    const handleNodeToggle = (nodeId: string) => {
        console.log("Preview - Node toggled:", nodeId);
    };

    const handleNodeSelect = (nodeId: string, selected: boolean) => {
        console.log("Preview - Node selected:", nodeId, selected);
    };

    return (
        <div className="pmp-dnd-tree-widget">
            <TreeTable 
                data={sampleTreeData} 
                onNodeToggle={handleNodeToggle}
                onNodeSelect={handleNodeSelect}
                className="group-plants-tree"
            />
        </div>
    );
}
