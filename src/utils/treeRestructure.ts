import { TreeNode } from "../types/TreeTypes";
import { removeNodeFromTree, insertNodeInTree, insertNodeAtRootLevel, recalculateNodeLevels } from "./dragDropUtils";

export function moveNode(
    treeData: TreeNode[],
    draggedNodeId: string,
    targetNodeId: string,
    position: 'before' | 'after' | 'inside'
): TreeNode[] {
    // 1. 找到被拖拽的节点
    const draggedNode = findNodeById(treeData, draggedNodeId);
    if (!draggedNode) {
        console.error('Dragged node not found');
        return treeData;
    }

    // 2. 从树中移除被拖拽的节点
    let updatedTree = removeNodeFromTree(treeData, draggedNodeId);

    // 3. 在目标位置插入节点
    if (position === 'inside') {
        updatedTree = insertNodeInTree(updatedTree, draggedNode, targetNodeId, position);
    } else {
        // 检查目标节点是否是根节点
        const targetNode = findNodeById(updatedTree, targetNodeId);
        if (targetNode && targetNode.level === 0) {
            // 在根级别插入
            updatedTree = insertNodeAtRootLevel(updatedTree, draggedNode, targetNodeId, position);
        } else {
            // 在子级别插入
            updatedTree = insertNodeInTree(updatedTree, draggedNode, targetNodeId, position);
        }
    }

    // 4. 重新计算所有节点的层级
    const finalTree = recalculateNodeLevels(updatedTree);

    return finalTree;
}

export function findNodeById(nodes: TreeNode[], nodeId: string): TreeNode | null {
    for (const node of nodes) {
        if (node.id === nodeId) {
            return node;
        }
        if (node.children) {
            const found = findNodeById(node.children, nodeId);
            if (found) return found;
        }
    }
    return null;
}

export function findNodeParent(nodes: TreeNode[], targetNodeId: string, parent?: TreeNode): TreeNode | null {
    for (const node of nodes) {
        if (node.id === targetNodeId) {
            return parent || null;
        }
        if (node.children) {
            const found = findNodeParent(node.children, targetNodeId, node);
            if (found) return found;
        }
    }
    return null;
}

// 克隆节点（深拷贝）
export function cloneNode(node: TreeNode): TreeNode {
    return {
        ...node,
        children: node.children ? node.children.map(cloneNode) : undefined
    };
}

// 验证树结构的完整性
export function validateTreeStructure(nodes: TreeNode[]): boolean {
    try {
        for (const node of nodes) {
            // 检查层级一致性
            if (node.children) {
                for (const child of node.children) {
                    if (child.level !== node.level + 1) {
                        console.warn(`Level inconsistency: ${child.name} should be level ${node.level + 1}, but is ${child.level}`);
                        return false;
                    }
                    if (child.parentId !== node.id) {
                        console.warn(`Parent ID inconsistency: ${child.name} parentId should be ${node.id}, but is ${child.parentId}`);
                        return false;
                    }
                }
                // 递归检查子节点
                if (!validateTreeStructure(node.children)) {
                    return false;
                }
            }
        }
        return true;
    } catch (error) {
        console.error('Tree validation error:', error);
        return false;
    }
}