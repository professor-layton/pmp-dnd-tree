export interface TreeNode {
    id: string;
    name: string;
    description?: string;
    uuid?: string;
    level: number;
    children?: TreeNode[];
    isExpanded?: boolean;
    isSelected?: boolean;
    parentId?: string;
    isDragging?: boolean;
    isDropTarget?: boolean;
}

export interface DragDropContext {
    draggedNode: TreeNode | null;
    dropTargetNode: TreeNode | null;
    dropPosition: 'before' | 'after' | 'inside' | null;
}

export interface TreeTableProps {
    data: TreeNode[];
    onNodeToggle?: (nodeId: string) => void;
    onNodeSelect?: (nodeId: string, selected: boolean) => void;
    onNodeMove?: (draggedNodeId: string, targetNodeId: string, position: 'before' | 'after' | 'inside') => void;
    className?: string;
    enableDragDrop?: boolean;
}