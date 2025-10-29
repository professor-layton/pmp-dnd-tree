import { ReactElement, createElement, useState, useCallback } from "react";
import { TreeTable } from "./components/TreeTable";
import { sampleTreeData } from "./data/sampleData";
import { moveNode } from "./utils/treeRestructure";
import { TreeNode } from "./types/TreeTypes";
import { buildTreeFromMendixGroups, fetchGroupsFromMendix } from "./utils/mendixDataBuilder";

import { PMPDnDTreeContainerProps } from "../typings/PMPDnDTreeProps";

import "./ui/PMPDnDTree.css";

export function PMPDnDTree({ sampleText }: PMPDnDTreeContainerProps): ReactElement {
    const [treeData, setTreeData] = useState<TreeNode[]>(sampleTreeData);
    const [isLoadingMendixData, setIsLoadingMendixData] = useState(false);

    // 可选：从Mendix加载真实数据的函数
    const loadMendixData = useCallback(async () => {
        setIsLoadingMendixData(true);
        try {
            const mendixGroups = await fetchGroupsFromMendix();
            const builtTreeData = buildTreeFromMendixGroups(mendixGroups);
            setTreeData(builtTreeData);
            console.log("Successfully loaded and built tree from Mendix data");
        } catch (error) {
            console.error("Error loading Mendix data:", error);
            // 发生错误时回退到示例数据
        } finally {
            setIsLoadingMendixData(false);
        }
    }, []);

    // 可选：在组件挂载时自动加载Mendix数据
    // 取消下面的注释来启用自动加载
    /*
    useEffect(() => {
        loadMendixData();
    }, [loadMendixData]);
    */

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
            <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                    onClick={loadMendixData}
                    disabled={isLoadingMendixData}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoadingMendixData ? 'not-allowed' : 'pointer',
                        opacity: isLoadingMendixData ? 0.6 : 1
                    }}
                >
                    {isLoadingMendixData ? 'Loading...' : 'Load from Mendix ATM_Company'}
                </button>
                <span style={{ fontSize: '12px', color: '#666' }}>
                    Click to build tree from Mendix Group entities
                </span>
            </div>
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
