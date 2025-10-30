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

// 删除节点并将其子节点移动到父节点下
export function deleteNodesAndMoveChildren(treeData: TreeNode[], nodeIdsToDelete: string[]): TreeNode[] {
    let updatedTree = [...treeData];
    
    // 为了避免删除顺序影响，我们需要按层级从深到浅处理
    const nodesToDelete = nodeIdsToDelete.map(id => findNodeById(updatedTree, id)).filter(Boolean) as TreeNode[];
    
    // 按层级排序，深层节点先删除
    nodesToDelete.sort((a, b) => b.level - a.level);
    
    for (const nodeToDelete of nodesToDelete) {
        updatedTree = deleteNodeAndMoveChildren(updatedTree, nodeToDelete.id);
    }
    
    return updatedTree;
}

// 删除单个节点并将其子节点移动到父节点下
function deleteNodeAndMoveChildren(treeData: TreeNode[], nodeIdToDelete: string): TreeNode[] {
    const nodeToDelete = findNodeById(treeData, nodeIdToDelete);
    if (!nodeToDelete) {
        console.warn(`Node with ID ${nodeIdToDelete} not found`);
        return treeData;
    }
    
    const parentNode = findNodeParent(treeData, nodeIdToDelete);
    const childrenToMove = nodeToDelete.children || [];
    
    // 删除节点的递归函数
    function removeNodeRecursive(nodes: TreeNode[]): TreeNode[] {
        return nodes
            .filter(node => node.id !== nodeIdToDelete)
            .map(node => ({
                ...node,
                children: node.children ? removeNodeRecursive(node.children) : undefined
            }));
    }
    
    // 添加子节点到父节点的递归函数
    function addChildrenToParent(nodes: TreeNode[]): TreeNode[] {
        return nodes.map(node => {
            if (parentNode && node.id === parentNode.id) {
                // 更新子节点的parentId和level
                const updatedChildren = childrenToMove.map(child => ({
                    ...child,
                    parentId: parentNode.id,
                    level: parentNode.level + 1
                }));
                
                // 将原有子节点和移动来的子节点合并
                const allChildren = [...(node.children || []), ...updatedChildren];
                
                return {
                    ...node,
                    children: allChildren.length > 0 ? recalculateChildrenLevels(allChildren, parentNode.level + 1) : undefined
                };
            } else if (node.children) {
                return {
                    ...node,
                    children: addChildrenToParent(node.children)
                };
            }
            return node;
        });
    }
    
    // 先删除节点
    let updatedTree = removeNodeRecursive(treeData);
    
    // 如果有父节点，将子节点添加到父节点下
    if (parentNode && childrenToMove.length > 0) {
        updatedTree = addChildrenToParent(updatedTree);
    } else if (!parentNode && childrenToMove.length > 0) {
        // 如果删除的是根节点，将其子节点提升为根节点
        const updatedChildren = childrenToMove.map(child => ({
            ...child,
            parentId: undefined,
            level: 0
        }));
        updatedTree = [...updatedTree, ...recalculateChildrenLevels(updatedChildren, 0)];
    }
    
    return updatedTree;
}

// 重新计算子节点的层级
function recalculateChildrenLevels(nodes: TreeNode[], baseLevel: number): TreeNode[] {
    return nodes.map(node => {
        const updatedNode = {
            ...node,
            level: baseLevel
        };
        
        if (node.children) {
            updatedNode.children = recalculateChildrenLevels(node.children, baseLevel + 1);
        }
        
        return updatedNode;
    });
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