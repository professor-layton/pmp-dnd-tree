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
}

export interface TreeTableProps {
    data: TreeNode[];
    onNodeToggle?: (nodeId: string) => void;
    onNodeSelect?: (nodeId: string, selected: boolean) => void;
    className?: string;
}