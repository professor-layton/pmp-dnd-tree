import { ReactElement, createElement, useState, useCallback } from "react";
import { TreeTable } from "./components/TreeTable";
import { sampleTreeData } from "./data/sampleData";
import { moveNode } from "./utils/treeRestructure";
import { TreeNode } from "./types/TreeTypes";
import { buildTreeFromMendixGroups, fetchGroupByName, fetchGroupsFromMendix } from "./utils/mendixDataBuilder";

import { PMPDnDTreeContainerProps } from "../typings/PMPDnDTreeProps";

import "./ui/PMPDnDTree.css";

export function PMPDnDTree({ sampleText }: PMPDnDTreeContainerProps): ReactElement {
    const [treeData, setTreeData] = useState<TreeNode[]>(sampleTreeData);
    const [filteredTreeData, setFilteredTreeData] = useState<TreeNode[]>(sampleTreeData);
    const [isLoadingMendixData, setIsLoadingMendixData] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>("");

    // 可选：从Mendix加载真实数据的函数
    const loadMendixData = useCallback(async () => {
        setIsLoadingMendixData(true);
        try {
            const mendixGroups = await fetchGroupsFromMendix();
            const builtTreeData = buildTreeFromMendixGroups(mendixGroups);
            setTreeData(builtTreeData);
            setFilteredTreeData(builtTreeData);
            console.log("Successfully loaded and built tree from Mendix data");
        } catch (error) {
            console.error("Error loading Mendix data:", error);
            // 发生错误时回退到示例数据
        } finally {
            setIsLoadingMendixData(false);
        }
    }, []);

    // 搜索功能
    const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const term = event.target.value;
        setSearchTerm(term);
        
        if (!term.trim()) {
            setFilteredTreeData(treeData);
            return;
        }

        // 递归搜索匹配的节点
        const filterTree = (nodes: TreeNode[]): TreeNode[] => {
            const filtered: TreeNode[] = [];
            
            for (const node of nodes) {
                const matchesSearch = node.name.toLowerCase().includes(term.toLowerCase());
                const filteredChildren = node.children ? filterTree(node.children) : [];
                
                if (matchesSearch || filteredChildren.length > 0) {
                    filtered.push({
                        ...node,
                        children: filteredChildren
                    });
                }
            }
            
            return filtered;
        };

        setFilteredTreeData(filterTree(treeData));
    }, [treeData]);

    // Create Group 按钮处理
    const handleCreateGroup = useCallback(() => {
        console.log("Create Group clicked");
        mx.data.action({ 
            params: {
                actionname: "ATM_Company.ACT_EnhancedGroup_New",
            },
            callback: (result) => {
                console.log("Microflow executed successfully:", result);
            },
            error: (error) => {
                console.error("Error executing microflow:", error);
            }
        });
    }, []);

    // Edit Group Hierarchy 按钮处理
    const handleEditHierarchy = useCallback(() => {
        console.log("Edit Group Hierarchy clicked");
        
        if (mx.ui.openForm) {
            const formPath = "ATM_Company/EnhancedGroup_Edit.page.xml";
            try {
                mx.ui.openForm(formPath, {
                    location: "content",
                    callback: (form: any) => {
                        console.log("Edit Group Hierarchy form opened:", form);
                    },
                    error: (error: any) => {
                        console.error("Error opening Edit Group Hierarchy form:", error);
                    }
                });
            } catch (error) {
                console.error("Failed to open Edit Group Hierarchy form:", error);
            }
        } else {
            console.warn("Mendix platform API not available");
        }
    }, []);

    // 可选：在组件挂载时自动加载Mendix数据
    // 取消下面的注释来启用自动加载
    /*
    useEffect(() => {
        loadMendixData();
    }, [loadMendixData]);
    */

    const handleNodeToggle = useCallback((nodeId: string) => {
        console.log("Node toggled:", nodeId);
    }, []);

    const handleNodeSelect = useCallback((nodeId: string, selected: boolean) => {
        console.log("Node selected:", nodeId, selected);
    }, []);

    const handleNodeClick = useCallback(async (node: TreeNode) => {
        console.log("Node clicked:", node.name, node.id);
        const entity = await fetchGroupByName(node.name)
        if (!entity) {
            console.error(`No Mendix entity found for group name: ${node.name}`);
            return;
        }
        // 使用 Mendix 的 mx.ui.openForm 打开群组详细信息页面
        if (mx.ui.openForm) {
            const formPath = "ATM_Company/EnhancedGroup_Detail.page.xml";
            try {
                // 方法1: 使用 MxContext 传递实体上下文
                const ctx = new mendix.lib.MxContext();
                ctx.setContext(entity.getEntity(), entity.getGuid());
                mx.ui.openForm(formPath, {
                    location: "content",
                    context: ctx,
                    callback: (form: any) => {
                        console.log("Group detail form opened with context:", form);
                    },
                    error: (error: any) => {
                        console.error("Error opening group detail form:", error);
                    }
                });
            } catch (contextError) {
                console.warn("Failed to create MxContext, trying alternative method:", contextError);
            }
        } else {
            console.warn("Mendix platform API not available");
        }
    }, []);

    const handleRowClick = useCallback(async (node: TreeNode, event: React.MouseEvent) => {
        console.log("Row clicked:", node.name, node.id, event);
        const group = await fetchGroupByName(node.name)
        if (!group) {
            console.error(`No Mendix entity found for group name: ${node.name}`);
            return;
        }
        if ((mx.ui as any).getContentForm) {
            const contentForm = (mx.ui as any).getContentForm();
            console.log("Content form:", contentForm);
            if (!contentForm) {
                console.error("Content form not available");
                return;
            }
            const curr = contentForm.getContext();
            const ctx = new mendix.lib.MxContext();
            ctx.setContext(group.getEntity(), group.getGuid());
            
            // 构建参数规格，只包含存在的参数
            const paramsSpec: any = {
                "Group": group.getEntity()
            };
            
            // TrackEntity就是SelectionHelper所在的实体
            const selectionHelper = curr.getTrackObject();
            if (selectionHelper) {
                ctx.setTrackObject(selectionHelper);
                ctx.setContext(selectionHelper.getEntity(), selectionHelper.getGuid());
                paramsSpec["SelectionHelper"] = selectionHelper.getEntity();
                console.log("Added SelectionHelper to context and params");
            } else {
                console.warn("SelectionHelper not available");
            }
            
            console.log("Calling nanoflow with params:", paramsSpec);
            
            // 使用正确的 Mendix nanoflow 调用格式
            try {
                // 根据 mxui.js 源码分析，使用更简单的方式
                (mx.data as any).callNanoflow({
                    nanoflow: {
                        nanoflow: "ATM_Company.ACT_EnhancedGroup_Peek",
                        paramsSpec: paramsSpec
                    },
                    context: ctx,
                    origin: contentForm,
                    callback: (result: any) => {
                        console.log("Nanoflow executed successfully:", result);
                    },
                    error: (error: any) => {
                        console.error("Nanoflow execution failed:", error);
                        
                        // 如果失败，尝试只用Group参数重试
                        console.log("Retrying with only Group parameter...");
                        const simpleParamsSpec = { "Group": group.getEntity() };
                        
                        (mx.data as any).callNanoflow({
                            nanoflow: {
                                nanoflow: "ATM_Company.ACT_EnhancedGroup_Peek",
                                paramsSpec: simpleParamsSpec
                            },
                            context: ctx,
                            origin: contentForm,
                            callback: (retryResult: any) => {
                                console.log("Nanoflow retry successful:", retryResult);
                            },
                            error: (retryError: any) => {
                                console.error("Nanoflow retry also failed:", retryError);
                            }
                        });
                    }
                });
            } catch (callError) {
                console.error("Failed to call nanoflow:", callError);
                
                // 最后的备用方法：使用 mx.data.action
                console.log("Trying fallback method with mx.data.action...");
                try {
                    mx.data.action({
                        params: {
                            actionname: "ATM_Company.ACT_EnhancedGroup_Peek",
                            guids: [group.getGuid()]
                        },
                        origin: contentForm,
                        context: ctx,
                        callback: (result: any) => {
                            console.log("Action executed successfully:", result);
                        },
                        error: (error: any) => {
                            console.error("Action execution failed:", error);
                        }
                    } as any);
                } catch (actionError) {
                    console.error("All nanoflow/action call methods failed:", actionError);
                }
            }
        } else {
            console.warn("Mendix platform API not available");
        }
    }, []);

    const handleNodeMove = useCallback((draggedNodeId: string, targetNodeId: string, position: 'before' | 'after' | 'inside') => {
        console.log(`Moving node ${draggedNodeId} ${position} ${targetNodeId}`);
        
        const newTreeData = moveNode(treeData, draggedNodeId, targetNodeId, position);
        setTreeData(newTreeData);
        
        // 如果有搜索词，重新应用过滤
        if (searchTerm.trim()) {
            const filterTree = (nodes: TreeNode[]): TreeNode[] => {
                const filtered: TreeNode[] = [];
                
                for (const node of nodes) {
                    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase());
                    const filteredChildren = node.children ? filterTree(node.children) : [];
                    
                    if (matchesSearch || filteredChildren.length > 0) {
                        filtered.push({
                            ...node,
                            children: filteredChildren
                        });
                    }
                }
                
                return filtered;
            };
            setFilteredTreeData(filterTree(newTreeData));
        } else {
            setFilteredTreeData(newTreeData);
        }
        
        console.log("Tree restructured successfully");
    }, [treeData, searchTerm]);

    return (
        <div className="pmp-dnd-tree-widget">
            <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                    onClick={loadMendixData}
                    disabled={isLoadingMendixData}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoadingMendixData ? 'not-allowed' : 'pointer',
                        opacity: isLoadingMendixData ? 0.6 : 1
                    }}
                >
                    {isLoadingMendixData ? 'Loading...' : 'Load from Mendix ATM_Company'}
                </button>
                <span style={{ fontSize: '12px', color: '#666' }}>
                    Click to build tree from Mendix Group entities
                </span>
            </div>
            
            {/* 工具栏 */}
            <div className="tree-toolbar" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '16px',
                backgroundColor: "white",
            }}>
                {/* 左侧：搜索栏 */}
                <div className="search-container" style={{ flex: '0 0 300px' }}>
                    <input
                        type="text"
                        placeholder="Search groups by name..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #d0d7de',
                            borderRadius: '4px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            fontFamily: '"noto-sans", "Noto Sans KR", "Noto Sans SC", sans-serif'
                        }}
                    />
                </div>
                
                {/* 右侧：按钮组 */}
                <div className="button-group" style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleEditHierarchy}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: 'white',
                            color: '#007bff',
                            border: '1px solid #007bff',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '400',
                            fontFamily: '"noto-sans", "Noto Sans KR", "Noto Sans SC", sans-serif'
                        }}
                    >
                        Edit Group Hierarchy
                    </button>
                    <button
                        onClick={handleCreateGroup}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '400',
                            fontFamily: '"noto-sans", "Noto Sans KR", "Noto Sans SC", sans-serif'
                        }}
                    >
                        Create Group
                    </button>
                </div>
            </div>
            
            <TreeTable 
                data={filteredTreeData} 
                onNodeToggle={handleNodeToggle}
                onNodeSelect={handleNodeSelect}
                onNodeClick={handleNodeClick}
                onRowClick={handleRowClick}
                onNodeMove={handleNodeMove}
                enableDragDrop={true}
                className="group-plants-tree"
            />
            {sampleText && (
                <div className="sample-text">
                    Sample Text: {sampleText}
                </div>
            )}
        </div>
    );
}
