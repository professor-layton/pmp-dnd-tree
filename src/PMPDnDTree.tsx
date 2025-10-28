import { ReactElement, createElement, useState, useCallback } from "react";
import { TreeTable } from "./components/TreeTable";
import { sampleTreeData } from "./data/sampleData";
import { moveNode } from "./utils/treeRestructure";
import { TreeNode } from "./types/TreeTypes";

import { PMPDnDTreeContainerProps } from "../typings/PMPDnDTreeProps";

import "./ui/PMPDnDTree.css";

export function PMPDnDTree({ sampleText }: PMPDnDTreeContainerProps): ReactElement {
    const [treeData, setTreeData] = useState<TreeNode[]>(sampleTreeData);

    const handleNodeToggle = useCallback((nodeId: string) => {
        console.log("Node toggled:", nodeId);
    }, []);

    const handleNodeSelect = useCallback((nodeId: string, selected: boolean) => {
        console.log("Node selected:", nodeId, selected);
    }, []);

    const handleNodeMove = useCallback((draggedNodeId: string, targetNodeId: string, position: 'before' | 'after' | 'inside') => {
        console.log(`Moving node ${draggedNodeId} ${position} ${targetNodeId}`);
        
        const newTreeData = moveNode(treeData, draggedNodeId, targetNodeId, position);
        setTreeData(newTreeData);
        
        console.log("Tree restructured successfully");
    }, [treeData]);

    return (
        <div className="pmp-dnd-tree-widget">
            <TreeTable 
                data={treeData} 
                onNodeToggle={handleNodeToggle}
                onNodeSelect={handleNodeSelect}
                onNodeMove={handleNodeMove}
                enableDragDrop={true}
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
