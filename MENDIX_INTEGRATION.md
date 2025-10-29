# Mendix ATM_Company集成指南

本文档说明如何将PMP DnD Tree Widget与Mendix的ATM_Company模块集成，从Group entity构建树状结构。

## Group Entity结构

假设在Mendix的ATM_Company模块中，Group entity包含以下字段：

```
Group Entity:
- Name (String): Group的名称
- Parent (String, 可选): 父Group的名称 
- Description (String, 可选): Group描述
- UUID (String, 可选): 唯一标识符
- AppCount (Integer, 可选): 关联的应用数量
- ResourceCount (Integer, 可选): 关联的资源数量
```

## 使用方法

### 1. 基本用法

```typescript
import { buildTreeFromMendixGroups, MendixGroup } from "./utils/mendixDataBuilder";

// 从Mendix获取的Group数据
const mendixGroups: MendixGroup[] = [
    {
        Name: "Organization",
        Description: "根组织",
        AppCount: 45,
        ResourceCount: 128
    },
    {
        Name: "Platform Group", 
        Parent: "Organization",
        Description: "平台组",
        AppCount: 12,
        ResourceCount: 38
    }
];

// 构建树状结构
const treeData = buildTreeFromMendixGroups(mendixGroups);
```

### 2. 从Mendix数据库获取数据

#### 方法一：使用Mendix Client API

```typescript
async function fetchGroupsFromMendixDB(): Promise<MendixGroup[]> {
    return new Promise((resolve, reject) => {
        mx.data.get({
            xpath: "//ATM_Company.Group",
            callback: function(objects) {
                const groups = objects.map(obj => ({
                    Name: obj.get("Name"),
                    Parent: obj.get("Parent"),
                    Description: obj.get("Description"),
                    UUID: obj.get("UUID"),
                    AppCount: obj.get("AppCount") || 0,
                    ResourceCount: obj.get("ResourceCount") || 0
                }));
                resolve(groups);
            },
            error: function(error) {
                reject(error);
            }
        });
    });
}
```

#### 方法二：使用REST API

```typescript
async function fetchGroupsViaREST(): Promise<MendixGroup[]> {
    const response = await fetch('/rest/atm-company/v1/groups', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getSessionToken()
        }
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}
```

#### 方法三：使用OData服务

```typescript
async function fetchGroupsViaOData(): Promise<MendixGroup[]> {
    const odataUrl = '/odata/ATM_Company/v1/Groups';
    const response = await fetch(odataUrl, {
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + getSessionToken()
        }
    });
    
    const data = await response.json();
    return data.value.map(item => ({
        Name: item.Name,
        Parent: item.Parent,
        Description: item.Description,
        UUID: item.UUID,
        AppCount: item.AppCount || 0,
        ResourceCount: item.ResourceCount || 0
    }));
}
```

### 3. 完整的组件集成

```typescript
import React, { useState, useCallback, useEffect } from 'react';
import { TreeTable } from './components/TreeTable';
import { buildTreeFromMendixGroups, fetchGroupsFromMendixReal } from './utils/mendixDataBuilder';

export function PMPDnDTreeWithMendix() {
    const [treeData, setTreeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadGroupData();
    }, []);

    const loadGroupData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // 从Mendix获取Group数据
            const mendixGroups = await fetchGroupsFromMendixReal();
            
            // 构建树状结构
            const builtTreeData = buildTreeFromMendixGroups(mendixGroups);
            
            setTreeData(builtTreeData);
        } catch (err) {
            setError(err.message);
            console.error('Failed to load group data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading group data...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <TreeTable 
            data={treeData}
            enableDragDrop={true}
            onNodeMove={(draggedId, targetId, position) => {
                // 处理节点移动逻辑
                console.log(`Moving ${draggedId} ${position} ${targetId}`);
            }}
        />
    );
}
```

## 数据结构映射

### Mendix Group → TreeNode 映射

```typescript
MendixGroup {                TreeNode {
    Name                 →      name
    Parent               →      parentId (通过查找计算)
    Description          →      description  
    UUID                 →      uuid
    AppCount             →      appCount
    ResourceCount        →      resourceCount
    (自动生成)            →      id
    (自动计算)            →      level
    (自动构建)            →      children
}
```

## 注意事项

1. **数据一致性**: 确保Parent字段引用的Group Name在数据中确实存在
2. **循环引用**: 系统会自动检测并处理潜在的循环引用
3. **根节点**: Parent字段为空或不存在的Group将被视为根节点
4. **性能优化**: 对于大量数据，考虑使用分页或虚拟滚动
5. **错误处理**: 建议在生产环境中添加完善的错误处理和用户反馈

## 扩展功能

### 自定义字段映射

```typescript
// 如果你的Group entity有不同的字段名
function mapCustomGroupToMendixGroup(customGroup: any): MendixGroup {
    return {
        Name: customGroup.GroupName,
        Parent: customGroup.ParentGroupName,
        Description: customGroup.Notes,
        UUID: customGroup.Identifier,
        AppCount: customGroup.ApplicationCount,
        ResourceCount: customGroup.AssetCount
    };
}
```

### 实时数据更新

```typescript
// 使用WebSocket或轮询来实现实时数据更新
useEffect(() => {
    const interval = setInterval(() => {
        loadGroupData();
    }, 30000); // 每30秒刷新一次

    return () => clearInterval(interval);
}, []);
```

这样就可以将Mendix的ATM_Company模块中的Group数据无缝集成到树状表格组件中了。