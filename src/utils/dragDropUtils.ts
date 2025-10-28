import { TreeNode } from "../types/TreeTypes";

// 检查节点是否可以被拖拽（排除root节点）
export function canDragNode(node: TreeNode): boolean {
    return node.level > 0; // 只有非root节点可以被拖拽
}

// 检查是否可以将节点拖拽到目标位置
export function canDropNode(draggedNode: TreeNode, targetNode: TreeNode, position: 'before' | 'after' | 'inside'): boolean {
    // 不能拖拽到自己身上
    if (draggedNode.id === targetNode.id) {
        return false;
    }
    
    // 不能将父节点拖拽到自己的子节点下
    if (isDescendant(targetNode, draggedNode)) {
        return false;
    }
    
    // 其他位置限制可以根据需要添加
    console.log(`Checking drop: ${draggedNode.name} ${position} ${targetNode.name}`);
    
    return true;
}

// 检查target是否是source的后代节点
function isDescendant(target: TreeNode, source: TreeNode): boolean {
    if (!source.children) return false;
    
    for (const child of source.children) {
        if (child.id === target.id || isDescendant(target, child)) {
            return true;
        }
    }
    return false;
}

// 从树中移除节点
export function removeNodeFromTree(tree: TreeNode[], nodeId: string): TreeNode[] {
    return tree.map(node => {
        if (node.id === nodeId) {
            return null; // 标记为删除
        }
        if (node.children) {
            const filteredChildren = removeNodeFromTree(node.children, nodeId).filter(child => child !== null);
            return { ...node, children: filteredChildren };
        }
        return node;
    }).filter(node => node !== null) as TreeNode[];
}

// 在指定位置插入节点
export function insertNodeInTree(
    tree: TreeNode[], 
    nodeToInsert: TreeNode, 
    targetNodeId: string, 
    position: 'before' | 'after' | 'inside'
): TreeNode[] {
    return tree.map(node => {
        if (node.id === targetNodeId) {
            switch (position) {
                case 'before':
                    // 在目标节点前插入（需要在父级处理）
                    return node;
                case 'after':
                    // 在目标节点后插入（需要在父级处理）
                    return node;
                case 'inside':
                    // 作为子节点插入
                    const updatedNode = { ...nodeToInsert, level: node.level + 1, parentId: node.id };
                    const children = node.children || [];
                    return { ...node, children: [...children, updatedNode] };
                default:
                    return node;
            }
        }
        
        if (node.children) {
            const updatedChildren = insertNodeInTree(node.children, nodeToInsert, targetNodeId, position);
            
            // 处理before和after的情况
            if (position === 'before' || position === 'after') {
                const targetIndex = updatedChildren.findIndex(child => child.id === targetNodeId);
                if (targetIndex !== -1) {
                    const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
                    const updatedNode = { ...nodeToInsert, level: node.level + 1, parentId: node.id };
                    updatedChildren.splice(insertIndex, 0, updatedNode);
                }
            }
            
            return { ...node, children: updatedChildren };
        }
        
        return node;
    });
}

// 处理根级别的before/after插入
export function insertNodeAtRootLevel(
    tree: TreeNode[], 
    nodeToInsert: TreeNode, 
    targetNodeId: string, 
    position: 'before' | 'after'
): TreeNode[] {
    const targetIndex = tree.findIndex(node => node.id === targetNodeId);
    if (targetIndex === -1) return tree;
    
    const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
    const updatedNode = { ...nodeToInsert, level: 0, parentId: undefined };
    
    const newTree = [...tree];
    newTree.splice(insertIndex, 0, updatedNode);
    return newTree;
}

// 重新计算节点层级
export function recalculateNodeLevels(nodes: TreeNode[], parentLevel: number = -1): TreeNode[] {
    return nodes.map(node => ({
        ...node,
        level: parentLevel + 1,
        children: node.children ? recalculateNodeLevels(node.children, parentLevel + 1) : undefined
    }));
}