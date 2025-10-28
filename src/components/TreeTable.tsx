import { ReactElement, createElement, useState, useCallback } from "react";
import { TreeNode, TreeTableProps, DragDropContext } from "../types/TreeTypes";
import { canDragNode, canDropNode } from "../utils/dragDropUtils";

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
    enableDragDrop: boolean;
    dragDropContext: DragDropContext;
    onDragStart: (node: TreeNode) => void;
    onDragOver: (e: React.DragEvent, node: TreeNode) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent, node: TreeNode) => void;
}

function TreeRow({ 
    node, 
    onToggle, 
    onSelect, 
    isExpanded, 
    isSelected, 
    enableDragDrop,
    dragDropContext,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop
}: TreeRowProps): ReactElement {
    const hasChildren = node.children && node.children.length > 0;
    const indentLevel = node.level * 20; // 20px per level
    const isDraggable = enableDragDrop && canDragNode(node);
    const isDragging = dragDropContext.draggedNode?.id === node.id;
    const isDropTarget = dragDropContext.dropTargetNode?.id === node.id;

    const handleToggle = useCallback(() => {
        if (hasChildren) {
            onToggle(node.id);
        }
    }, [hasChildren, node.id, onToggle]);

    const handleSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        onSelect(node.id, event.target.checked);
    }, [node.id, onSelect]);

    const handleDragStart = useCallback((e: React.DragEvent) => {
        if (isDraggable) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', node.id);
            onDragStart(node);
        }
    }, [isDraggable, node, onDragStart]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        if (enableDragDrop && dragDropContext.draggedNode) {
            e.preventDefault();
            onDragOver(e, node);
        }
    }, [enableDragDrop, dragDropContext.draggedNode, node, onDragOver]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        if (enableDragDrop) {
            e.preventDefault();
            onDrop(e, node);
        }
    }, [enableDragDrop, node, onDrop]);

    const rowClassName = `tree-row ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''}`;

    return (
        <tr 
            className={rowClassName}
            data-level={node.level}
            draggable={isDraggable}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={onDragLeave}
            onDrop={handleDrop}
        >
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
                        {isDraggable && (
                            <span className="drag-handle" aria-label="Drag to move">
                                ⋮⋮
                            </span>
                        )}
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

export function TreeTable({ 
    data, 
    onNodeToggle, 
    onNodeSelect, 
    onNodeMove,
    className = "",
    enableDragDrop = false
}: TreeTableProps): ReactElement {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
    const [dragDropContext, setDragDropContext] = useState<DragDropContext>({
        draggedNode: null,
        dropTargetNode: null,
        dropPosition: null
    });

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

    const handleDragStart = useCallback((node: TreeNode) => {
        setDragDropContext({
            draggedNode: node,
            dropTargetNode: null,
            dropPosition: null
        });
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, node: TreeNode) => {
        if (!dragDropContext.draggedNode) return;
        
        // 确定拖拽位置
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;
        
        let position: 'before' | 'after' | 'inside' = 'inside';
        if (y < height * 0.25) {
            position = 'before';
        } else if (y > height * 0.75) {
            position = 'after';
        }
        
        if (canDropNode(dragDropContext.draggedNode, node, position)) {
            setDragDropContext(prev => ({
                ...prev,
                dropTargetNode: node,
                dropPosition: position
            }));
        }
    }, [dragDropContext.draggedNode]);

    const handleDragLeave = useCallback(() => {
        setDragDropContext(prev => ({
            ...prev,
            dropTargetNode: null,
            dropPosition: null
        }));
    }, []);

    const handleDrop = useCallback((_e: React.DragEvent, targetNode: TreeNode) => {
        if (!dragDropContext.draggedNode || !dragDropContext.dropPosition) return;
        
        if (canDropNode(dragDropContext.draggedNode, targetNode, dragDropContext.dropPosition)) {
            if (onNodeMove) {
                onNodeMove(dragDropContext.draggedNode.id, targetNode.id, dragDropContext.dropPosition);
            }
        }
        
        setDragDropContext({
            draggedNode: null,
            dropTargetNode: null,
            dropPosition: null
        });
    }, [dragDropContext, onNodeMove]);

    const flattenedData = flattenTreeData(data, expandedNodes);

    return (
        <div className={`tree-table-container ${className} ${enableDragDrop ? 'drag-enabled' : ''}`}>
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
                            enableDragDrop={enableDragDrop}
                            dragDropContext={dragDropContext}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}