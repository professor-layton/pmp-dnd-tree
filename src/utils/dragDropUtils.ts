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
    
    // 检查是否试图移动到相同的位置
    if (isSamePosition(draggedNode, targetNode, position)) {
        return false;
    }
    
    // 其他位置限制可以根据需要添加
    console.log(`Checking drop: ${draggedNode.name} ${position} ${targetNode.name}`);
    
    return true;
}

// 检查是否移动到相同位置
function isSamePosition(draggedNode: TreeNode, targetNode: TreeNode, position: 'before' | 'after' | 'inside'): boolean {
    // 如果是inside位置，检查目标节点是否已经是拖拽节点的父节点
    if (position === 'inside') {
        return draggedNode.parentId === targetNode.id;
    }
    
    // 如果是before/after位置，检查是否在同一个父节点下的相邻位置
    if (position === 'before' || position === 'after') {
        // 必须有相同的父节点
        if (draggedNode.parentId !== targetNode.parentId) {
            return false;
        }
        
        // 如果拖拽节点就在目标节点的前面或后面，则认为是相同位置
        return (position === 'after' && draggedNode.id === targetNode.id) || 
               (position === 'before' && draggedNode.id === targetNode.id);
    }
    
    return false;
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
                    // 作为子节点插入 - 递归更新所有子节点的层级和parentId
                    const updatedNodeToInsert = updateNodeAndChildrenLevels(nodeToInsert, node.level + 1, node.id);
                    const children = node.children || [];
                    return { ...node, children: [...children, updatedNodeToInsert] };
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
                    const updatedNode = updateNodeAndChildrenLevels(nodeToInsert, node.level + 1, node.id);
                    updatedChildren.splice(insertIndex, 0, updatedNode);
                }
            }
            
            return { ...node, children: updatedChildren };
        }
        
        return node;
    });
}

// 递归更新节点及其所有子节点的层级和parentId
function updateNodeAndChildrenLevels(node: TreeNode, newLevel: number, newParentId?: string): TreeNode {
    const updatedNode: TreeNode = {
        ...node,
        level: newLevel,
        parentId: newParentId,
        children: node.children ? node.children.map(child => 
            updateNodeAndChildrenLevels(child, newLevel + 1, node.id)
        ) : undefined
    };
    
    return updatedNode;
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
    // 使用helper函数递归更新层级，根级别的parentId为undefined
    const updatedNode = updateNodeAndChildrenLevels(nodeToInsert, 0, undefined);
    
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