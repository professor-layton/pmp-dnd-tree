import { ReactElement, createElement, useState, useCallback, useMemo, useEffect } from "react";
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

function getAllParentNodeIds(nodes: TreeNode[]): Set<string> {
    const parentIds = new Set<string>();
    
    function traverse(nodeArray: TreeNode[]) {
        for (const node of nodeArray) {
            if (node.children && node.children.length > 0) {
                parentIds.add(node.id);
                traverse(node.children);
            }
        }
    }
    
    traverse(nodes);
    return parentIds;
}

interface TreeRowProps {
    node: TreeNode;
    onToggle: (nodeId: string) => void;
    onSelect: (nodeId: string, selected: boolean) => void;
    onNodeClick?: (node: TreeNode) => void;
    onRowClick?: (node: TreeNode, event: React.MouseEvent) => void;
    isExpanded: boolean;
    isSelected: boolean;
    enableDragDrop: boolean;
    dragDropContext: DragDropContext;
    onDragStart: (node: TreeNode) => void;
    onDragOver: (e: React.DragEvent, node: TreeNode) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, node: TreeNode) => void;
    onDragEnd: () => void;
}

function TreeRow({ 
    node, 
    onToggle, 
    onSelect, 
    onNodeClick,
    onRowClick,
    isExpanded, 
    isSelected, 
    enableDragDrop,
    dragDropContext,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd
}: TreeRowProps): ReactElement {
    const hasChildren = node.children && node.children.length > 0;
    const indentLevel = node.level * 48; // 48px per level
    const isDraggable = enableDragDrop && canDragNode(node);
    const isDragging = dragDropContext.draggedNode?.id === node.id;
    // 移除isDropTarget，因为我们使用placeholder替代
    // const isDropTarget = dragDropContext.dropTargetNode?.id === node.id;

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

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        onDragLeave(e);
    }, [onDragLeave]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        if (enableDragDrop) {
            e.preventDefault();
            onDrop(e, node);
        }
    }, [enableDragDrop, node, onDrop]);

    const handleDragEnd = useCallback(() => {
        onDragEnd();
    }, [onDragEnd]);

    const handleNodeClick = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        if (onNodeClick) {
            onNodeClick(node);
        }
    }, [node, onNodeClick]);

    const handleRowClick = useCallback((e: React.MouseEvent) => {
        // 检查点击的是否是控制元素（checkbox, toggle button, drag handle, link）
        const target = e.target as HTMLElement;
        const isControlElement = (enableDragDrop && target.closest('.tree-checkbox')) ||
                                target.closest('.tree-toggle') ||
                                target.closest('.drag-handle') ||
                                target.closest('.tree-node-link');
        
        // 如果点击的不是控制元素，则触发行点击事件
        if (!isControlElement && onRowClick) {
            onRowClick(node, e);
        }
    }, [node, onRowClick, enableDragDrop]);

    const rowClassName = `tree-row ${isDragging ? 'dragging' : ''}`;
    const rowWidth = `calc(100% - ${indentLevel}px)`;

    return (
        <tr 
            className={rowClassName}
            data-level={node.level}
            draggable={isDraggable}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onClick={handleRowClick}
            style={{
                cursor: onRowClick ? 'pointer' : 'default',
                width: rowWidth,
                marginLeft: indentLevel,
                display: 'table',
                tableLayout: 'fixed',
                borderSpacing: '0px'
            }}
        >
            <td className="tree-cell tree-cell-content">
                <div className="tree-node-wrapper">
                    <div className="tree-node-controls">
                        {enableDragDrop && (
                            <input
                                type="checkbox"
                                className="tree-checkbox"
                                checked={isSelected}
                                onChange={handleSelect}
                                disabled={node.level === 0}
                                aria-label={`Select ${node.name}`}
                            />
                        )}
                        {hasChildren && (
                            <button
                                className={`tree-toggle ${isExpanded ? 'expanded' : 'collapsed'}`}
                                onClick={handleToggle}
                                type="button"
                                aria-label={isExpanded ? 'Collapse' : 'Expand'}
                            >
                                {isExpanded ? '›' : '›'}
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
                        <div className="tree-node-main">
                            <div className="tree-node-info">
                                <div className="tree-node-title">
                                    <a 
                                        href="#"
                                        className="tree-node-link"
                                        onClick={handleNodeClick}
                                        title={`Open ${node.name} details`}
                                    >
                                        {node.name}
                                    </a>
                                    {node.level === 0 && (
                                        <span className="pds-badge--info">ROOT</span>
                                    )}
                                </div>
                                {node.description && (
                                    <div className="tree-node-description">{node.description}</div>
                                )}
                                {node.uuid && (
                                    <div className="tree-node-uuid">UUID: {node.uuid}</div>
                                )}
                            </div>
                            <div className="tree-node-stats">
                                {typeof node.appCount === 'number' && (
                                    <div className="stat-item" title="Apps">
                                        <span className="stat-count">{node.appCount}</span>
                                        <span className="stat-icon pds-icon pds-icon--hierarchy-files"></span>
                                    </div>
                                )}
                                {typeof node.resourceCount === 'number' && (
                                    <div className="stat-item" title="Resources">
                                        <span className="stat-count">{node.resourceCount}</span>
                                        <span className="stat-icon pds-icon pds-icon--cube"></span>
                                    </div>
                                )}
                                <div className="stat-item" title="Subgroups">
                                    <span className="stat-count">{node.children ? node.children.length : 0}</span>
                                </div>
                            </div>
                        </div>
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
    onNodeClick,
    onRowClick,
    onNodeMove,
    onSelectionChange,
    clearSelection,
    className = "",
    enableDragDrop = false
}: TreeTableProps): ReactElement {
    // 计算所有父节点ID用于默认展开
    const defaultExpandedNodes = useMemo(() => getAllParentNodeIds(data), [data]);
    
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(defaultExpandedNodes);
    const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
    const [dragDropContext, setDragDropContext] = useState<DragDropContext>({
        draggedNode: null,
        dropTargetNode: null,
        dropPosition: null
    });

    // 当data变化时，更新expandedNodes为全部展开
    useEffect(() => {
        setExpandedNodes(defaultExpandedNodes);
    }, [defaultExpandedNodes]);

    // 处理清除选择
    useEffect(() => {
        if (clearSelection) {
            setSelectedNodes(new Set());
            if (onSelectionChange) {
                onSelectionChange([]);
            }
        }
    }, [clearSelection, onSelectionChange]);

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
            
            // 调用选择变化回调
            if (onSelectionChange) {
                onSelectionChange(Array.from(newSet));
            }
            
            return newSet;
        });
        
        if (onNodeSelect) {
            onNodeSelect(nodeId, selected);
        }
    }, [onNodeSelect, onSelectionChange]);

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
        
        // 特殊处理：如果拖拽的是子节点到其父节点，应该保持为子节点关系
        const isChildToParent = dragDropContext.draggedNode.parentId === node.id;
        
        if (isChildToParent) {
            // 子节点拖拽到父节点时，所有区域都应该被视为inside
            position = 'inside';
        } else {
            // 对于Root节点（level 0），大部分区域应该是inside
            if (node.level === 0) {
                if (y < height * 0.2) {
                    position = 'before';
                } else if (y > height * 0.8) {
                    position = 'after';
                } else {
                    position = 'inside'; // Root节点的中间大部分区域都是inside
                }
            } else {
                // 对于非Root节点，使用正常的判断逻辑
                if (y < height * 0.25) {
                    position = 'before';
                } else if (y > height * 0.75) {
                    position = 'after';
                } else {
                    position = 'inside';
                }
            }
        }
        
        if (canDropNode(dragDropContext.draggedNode, node, position)) {
            setDragDropContext(prev => ({
                ...prev,
                dropTargetNode: node,
                dropPosition: position
            }));
        } else {
            // 如果不能drop，清除drop target状态
            setDragDropContext(prev => ({
                ...prev,
                dropTargetNode: null,
                dropPosition: null
            }));
        }
    }, [dragDropContext.draggedNode]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        // 只有当鼠标真正离开当前元素时才清除状态
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDragDropContext(prev => ({
                ...prev,
                dropTargetNode: null,
                dropPosition: null
            }));
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetNode: TreeNode) => {
        e.preventDefault();
        
        if (!dragDropContext.draggedNode || !dragDropContext.dropPosition) {
            // 重置拖拽状态
            setDragDropContext({
                draggedNode: null,
                dropTargetNode: null,
                dropPosition: null
            });
            return;
        }
        
        if (canDropNode(dragDropContext.draggedNode, targetNode, dragDropContext.dropPosition)) {
            if (onNodeMove) {
                onNodeMove(dragDropContext.draggedNode.id, targetNode.id, dragDropContext.dropPosition);
            }
        } else {
            console.log('Drop operation canceled: invalid position');
        }
        
        // 无论是否成功，都重置拖拽状态
        setDragDropContext({
            draggedNode: null,
            dropTargetNode: null,
            dropPosition: null
        });
    }, [dragDropContext, onNodeMove]);

    // 添加dragend事件处理，确保拖拽状态总是被重置
    const handleDragEnd = useCallback(() => {
        setDragDropContext({
            draggedNode: null,
            dropTargetNode: null,
            dropPosition: null
        });
    }, []);

    const flattenedData = flattenTreeData(data, expandedNodes);

    // 创建Placeholder组件
    const renderPlaceholder = (position: 'before' | 'after' | 'inside', targetNode: TreeNode) => {
        const placeholderClass = `tree-placeholder ${position}`;
        const indentLevel = position === 'inside' ? (targetNode.level + 1) * 20 : targetNode.level * 20;
        
        return (
            <tr key={`placeholder-${targetNode.id}-${position}`} className="tree-placeholder-row">
                <td className="tree-cell">
                    <div 
                        className={placeholderClass}
                        style={{ marginLeft: indentLevel }}
                    />
                </td>
            </tr>
        );
    };

    // 生成带placeholder的渲染数据
    const generateRenderData = () => {
        const result: Array<{ type: 'node' | 'placeholder', data: TreeNode | { position: 'before' | 'after' | 'inside', targetNode: TreeNode }, key: string }> = [];
        
        flattenedData.forEach((node) => {
            // 检查是否需要在此节点前显示placeholder
            if (dragDropContext.dropTargetNode?.id === node.id && dragDropContext.dropPosition === 'before') {
                result.push({
                    type: 'placeholder',
                    data: { position: 'before', targetNode: node },
                    key: `placeholder-before-${node.id}`
                });
            }
            
            // 添加节点本身
            result.push({
                type: 'node',
                data: node,
                key: node.id
            });
            
            // 检查是否需要显示inside placeholder
            if (dragDropContext.dropTargetNode?.id === node.id && dragDropContext.dropPosition === 'inside') {
                result.push({
                    type: 'placeholder',
                    data: { position: 'inside', targetNode: node },
                    key: `placeholder-inside-${node.id}`
                });
            }
            
            // 检查是否需要在此节点后显示placeholder
            if (dragDropContext.dropTargetNode?.id === node.id && dragDropContext.dropPosition === 'after') {
                result.push({
                    type: 'placeholder',
                    data: { position: 'after', targetNode: node },
                    key: `placeholder-after-${node.id}`
                });
            }
        });
        
        return result;
    };

    const renderData = generateRenderData();

    return (
        <div className={`tree-table-container ${className} ${enableDragDrop ? 'drag-enabled' : ''}`}>
            <table className="tree-table">
                <tbody>
                    {renderData.map((item) => {
                        if (item.type === 'placeholder') {
                            const { position, targetNode } = item.data as { position: 'before' | 'after' | 'inside', targetNode: TreeNode };
                            return renderPlaceholder(position, targetNode);
                        } else {
                            const node = item.data as TreeNode;
                            return (
                                <TreeRow
                                    key={node.id}
                                    node={node}
                                    onToggle={handleToggle}
                                    onSelect={handleSelect}
                                    onNodeClick={onNodeClick}
                                    onRowClick={onRowClick}
                                    isExpanded={expandedNodes.has(node.id)}
                                    isSelected={selectedNodes.has(node.id)}
                                    enableDragDrop={enableDragDrop}
                                    dragDropContext={dragDropContext}
                                    onDragStart={handleDragStart}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onDragEnd={handleDragEnd}
                                />
                            );
                        }
                    })}
                </tbody>
            </table>
        </div>
    );
}