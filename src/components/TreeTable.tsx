import { ReactElement, createElement, useState, useCallback } from "react";
import { TreeNode, TreeTableProps } from "../types/TreeTypes";

function flattenTreeData(nodes: TreeNode[], expandedNodes: Set<string>): TreeNode[] {
    const result: TreeNode[] = [];
    
    function traverse(nodeArray: TreeNode[]) {
        for (const node of nodeArray) {
            result.push(node);
            if (node.children && expandedNodes.has(node.id)) {
                traverse(node.children);
            }
        }
    }
    
    traverse(nodes);
    return result;
}

interface TreeRowProps {
    node: TreeNode;
    onToggle: (nodeId: string) => void;
    onSelect: (nodeId: string, selected: boolean) => void;
    isExpanded: boolean;
    isSelected: boolean;
}

function TreeRow({ node, onToggle, onSelect, isExpanded, isSelected }: TreeRowProps): ReactElement {
    const hasChildren = node.children && node.children.length > 0;
    const indentLevel = node.level * 20; // 20px per level

    const handleToggle = useCallback(() => {
        if (hasChildren) {
            onToggle(node.id);
        }
    }, [hasChildren, node.id, onToggle]);

    const handleSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        onSelect(node.id, event.target.checked);
    }, [node.id, onSelect]);

    return (
        <tr className="tree-row" data-level={node.level}>
            <td className="tree-cell tree-cell-content">
                <div className="tree-node-wrapper" style={{ paddingLeft: indentLevel }}>
                    <div className="tree-node-controls">
                        <input
                            type="checkbox"
                            className="tree-checkbox"
                            checked={isSelected}
                            onChange={handleSelect}
                            aria-label={`Select ${node.name}`}
                        />
                        {hasChildren && (
                            <button
                                className={`tree-toggle ${isExpanded ? 'expanded' : 'collapsed'}`}
                                onClick={handleToggle}
                                type="button"
                                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                            >
                                {isExpanded ? '▼' : '▶'}
                            </button>
                        )}
                        {!hasChildren && <span className="tree-spacer" />}
                    </div>
                    <div className="tree-node-content">
                        <div className="tree-node-title">{node.name}</div>
                        {node.description && (
                            <div className="tree-node-description">{node.description}</div>
                        )}
                        {node.uuid && (
                            <div className="tree-node-uuid">UUID: {node.uuid}</div>
                        )}
                    </div>
                </div>
            </td>
        </tr>
    );
}

export function TreeTable({ data, onNodeToggle, onNodeSelect, className = "" }: TreeTableProps): ReactElement {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());

    const handleToggle = useCallback((nodeId: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet.delete(nodeId);
            } else {
                newSet.add(nodeId);
            }
            return newSet;
        });
        
        if (onNodeToggle) {
            onNodeToggle(nodeId);
        }
    }, [onNodeToggle]);

    const handleSelect = useCallback((nodeId: string, selected: boolean) => {
        setSelectedNodes(prev => {
            const newSet = new Set(prev);
            if (selected) {
                newSet.add(nodeId);
            } else {
                newSet.delete(nodeId);
            }
            return newSet;
        });
        
        if (onNodeSelect) {
            onNodeSelect(nodeId, selected);
        }
    }, [onNodeSelect]);

    const flattenedData = flattenTreeData(data, expandedNodes);

    return (
        <div className={`tree-table-container ${className}`}>
            <table className="tree-table">
                <thead>
                    <tr>
                        <th className="tree-header">Group Plants</th>
                    </tr>
                </thead>
                <tbody>
                    {flattenedData.map(node => (
                        <TreeRow
                            key={node.id}
                            node={node}
                            onToggle={handleToggle}
                            onSelect={handleSelect}
                            isExpanded={expandedNodes.has(node.id)}
                            isSelected={selectedNodes.has(node.id)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}