import { TreeNode } from "../types/TreeTypes";

// Mendix Group Entity 接口定义
export interface MendixGroup {
    Name: string;           // Group的名字
    Parent?: string;        // Parent Group的名字 (可选，根节点没有parent)
    // 可以根据实际的ATM_Company模块中的Group entity添加更多字段
    Description?: string;   // 描述信息
    UUID?: string;         // UUID标识
    AppCount?: number;     // App数量
    ResourceCount?: number; // Resource数量
}

/**
 * 从Mendix Group数据构建树状结构
 * @param mendixGroups 从ATM_Company模块获取的所有Group数据
 * @returns TreeNode数组，表示完整的树状结构
 */
export function buildTreeFromMendixGroups(mendixGroups: MendixGroup[]): TreeNode[] {
    // Step 1: 创建name到group的映射，便于查找
    const groupMap = new Map<string, MendixGroup>();
    mendixGroups.forEach(group => {
        groupMap.set(group.Name, group);
    });

    // Step 2: 创建name到TreeNode的映射
    const treeNodeMap = new Map<string, TreeNode>();
    
    // Step 3: 为每个group创建TreeNode
    mendixGroups.forEach((group, index) => {
        const treeNode: TreeNode = {
            id: `group-${index + 1}`, // 生成唯一ID
            name: group.Name,
            description: group.Description || `Group: ${group.Name}`,
            uuid: group.UUID,
            level: 0, // 将在后续步骤中计算正确的level
            children: [],
            parentId: undefined,
            appCount: group.AppCount || 0,
            resourceCount: group.ResourceCount || 0
        };
        treeNodeMap.set(group.Name, treeNode);
    });

    // Step 4: 建立父子关系
    const rootNodes: TreeNode[] = [];
    
    mendixGroups.forEach(group => {
        const currentNode = treeNodeMap.get(group.Name)!;
        
        if (group.Parent && groupMap.has(group.Parent)) {
            // 有parent的节点
            const parentNode = treeNodeMap.get(group.Parent)!;
            parentNode.children = parentNode.children || [];
            parentNode.children.push(currentNode);
            currentNode.parentId = parentNode.id;
        } else {
            // 没有parent或parent不存在的节点作为根节点
            rootNodes.push(currentNode);
        }
    });

    // Step 5: 计算每个节点的正确level
    function calculateLevels(nodes: TreeNode[], level: number = 0) {
        nodes.forEach(node => {
            node.level = level;
            if (node.children && node.children.length > 0) {
                calculateLevels(node.children, level + 1);
            }
        });
    }
    
    calculateLevels(rootNodes);

    return rootNodes;
}

export const fetchEntityByXpath = (xpath: string) => {
  return new Promise<mendix.lib.MxObject[]>((resolve, reject) => {
    mx.data.get({
      xpath,
      callback: objects => { resolve(objects as mendix.lib.MxObject[]); },
      error: (e: any) => { reject(e); }
    });
  });
}

export async function fetchGroupsFromMendix(): Promise<MendixGroup[]> {
    try {
        const [groups, metrics] = await Promise.all([
            fetchEntityByXpath("//ATM_Company.Group"),
            fetchEntityByXpath("//ATM_Company.GroupMetrics")
        ]);
        const mapGroup = new Map(groups.map(g => [g.getGuid() as string, g]));
        const mapMetrics = new Map(metrics.map(m => [m.getGuid() as string, m]));
        const mapGroupToMetrics = new Map(groups.map(g => [
            g.getGuid() as string,
            g.getReference("ATM_Company.GroupMetrics") as string
        ]));
        const result: MendixGroup[] = groups.map((g) => {
            const m = mapMetrics.get(mapGroupToMetrics.get(g.getGuid() as string) as string);
            const pg = mapGroup.get(g.getReference("ATM_Company.ParentGroup") as string);
            return {
                Name: g.get("Name") as string,
                Parent: pg ? (pg.get("Name") as string) : "N/A",
                Description: g.get("Description") as string,
                UUID: g.get("UUID") as string,
                AppCount: m ? (m.get("TotalResource") as number) : 0,
                ResourceCount: m ? (m.get("TotalNSPurpose") as number) : 0
            };
        });
        console.log(`Successfully Loaded ${result.length} groups`);
        return result;
    } catch (err) {
        console.error(`Failed to fetch groups from database: ${err}`);
        throw err;
    }
}