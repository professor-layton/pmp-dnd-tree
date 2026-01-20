import { ReactElement, createElement, useState, useCallback, useEffect } from "react";
import { TreeTable } from "./components/TreeTable";
import { sampleTreeData } from "./data/sampleData";
import { moveNode, deleteNodesAndMoveChildren } from "./utils/treeRestructure";
import { TreeNode } from "./types/TreeTypes";
import { buildTreeFromMendixGroups, fetchGroupByName, fetchGroupsFromMendix } from "./utils/mendixDataBuilder";
import { RiDeleteBin5Line } from "react-icons/ri";

import { PMPDnDTreeContainerProps } from "../typings/PMPDnDTreeProps";

import "./ui/PMPDnDTree.css";

export function PMPDnDTree({ sampleText, enableDragDrop, showCreateButton, showEditHierarchyButton }: PMPDnDTreeContainerProps): ReactElement {
    const [treeData, setTreeData] = useState<TreeNode[]>([]);
    const [filteredTreeData, setFilteredTreeData] = useState<TreeNode[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
    const [clearSelection, setClearSelection] = useState(false);

    // 从示例数据加载的函数
    const loadSampleData = useCallback(() => {
        setTreeData(sampleTreeData);
        setFilteredTreeData(sampleTreeData);
        console.log("Successfully loaded sample data");
    }, []);

    // 可选：从Mendix加载真实数据的函数
    const loadMendixData = useCallback(async () => {
        try {
            const mendixGroups = await fetchGroupsFromMendix();
            const builtTreeData = buildTreeFromMendixGroups(mendixGroups);
            setTreeData(builtTreeData);
            setFilteredTreeData(builtTreeData);
            console.log("Successfully loaded and built tree from Mendix data");
        } catch (error) {
            console.error("Error loading Mendix data:", error);
            // 发生错误时回退到示例数据
            loadSampleData();
        }
    }, [loadSampleData]);

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

    // 组件挂载时自动加载Mendix数据
    useEffect(() => {
        loadMendixData();
    }, [loadMendixData]);

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
            // TrackEntity就是SelectionHelper所在的实体
            const selectionHelper = curr.getTrackObject();
            if (selectionHelper) {
                ctx.setTrackObject(selectionHelper);
                ctx.setContext(selectionHelper.getEntity(), selectionHelper.getGuid());
                console.log("Added SelectionHelper to context and params");
            } 
            else {
                console.warn("SelectionHelper not available");
                return;
            }
            (mx.data as any).callNanoflow({
                nanoflow: {
                    nanoflow: "ATM_Company.ACT_EnhancedGroup_Peek",
                    paramsSpec: {
                        "Group": group.getEntity(),
                        "SelectionHelper": selectionHelper.getEntity(),
                    }
                },
                context: ctx,
                origin: contentForm,
                callback: (result: any) => {
                    console.log("Nanoflow executed successfully:", result);
                },
                error: (error: any) => {
                    console.error("Nanoflow execution failed:", error);
                }
            });
        } 
        else {
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

    // 处理选择变化
    const handleSelectionChange = useCallback((nodeIds: string[]) => {
        setSelectedNodeIds(nodeIds);
        // 重置clearSelection状态
        setClearSelection(false);
    }, []);

    // 处理取消选择
    const handleCancelSelection = useCallback(() => {
        setClearSelection(true);
        setSelectedNodeIds([]);
    }, []);

    // 处理删除选中项
    const handleDeleteSelected = useCallback(() => {
        console.log("Delete selected items:", selectedNodeIds);
        
        if (selectedNodeIds.length === 0) {
            console.warn("No items selected for deletion");
            return;
        }
        
        // 执行删除操作，子节点会自动移动到父节点下
        const newTreeData = deleteNodesAndMoveChildren(treeData, selectedNodeIds);
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
        
        console.log(`Successfully deleted ${selectedNodeIds.length} item(s) and moved their children to parent nodes`);
        
        // 删除完成后清除选择
        setClearSelection(true);
        setSelectedNodeIds([]);
    }, [selectedNodeIds, treeData, searchTerm]);

    // 将树形结构转换为API所需的层级数据格式
    const buildHierarchyData = useCallback((nodes: TreeNode[], parentName: string | null = null): Array<{name: string, parent: string | null, level: number}> => {
        const hierarchyItems: Array<{name: string, parent: string | null, level: number}> = [];
        
        for (const node of nodes) {
            // 添加当前节点
            hierarchyItems.push({
                name: node.name,
                parent: parentName,
                level: node.level
            });
            
            // 递归处理子节点
            if (node.children && node.children.length > 0) {
                const childrenItems = buildHierarchyData(node.children, node.name);
                hierarchyItems.push(...childrenItems);
            }
        }
        
        return hierarchyItems;
    }, []);

    // 监听DOM中"Save Group Hierarchy"按钮的点击事件
    useEffect(() => {
        const handleSaveGroupHierarchyClick = async (event: Event) => {
            const target = event.target as HTMLElement;
            // 检查是否是"Save Group Hierarchy"按钮
            if (target && (
                target.textContent?.trim() === "Save Group Hierarchy" ||
                target.innerText?.trim() === "Save Group Hierarchy"
            )) {
                console.log("Save Group Hierarchy button clicked - detected by PMPDnDTree widget");
                
                // 检查拖拽功能是否被禁止
                if (!enableDragDrop) {
                    console.log("Drag and drop is disabled, API call is also disabled");
                    return;
                }

                // 整理树形结构数据
                const hierarchyData = buildHierarchyData(treeData);
                console.log("Hierarchy data to be sent:", hierarchyData);
                
                try {
                    // 获取Mendix session信息
                    if (!mx.session) {
                        console.warn("Unable to retrieve session information: mx.session is not available");
                        return;
                    }
                    console.log("mx.session is available, attempting to get tokens");
                    const sessionToken = (mx.session as any).getSessionObjectId?.() || null;
                    const csrfToken = (mx.session as any).getConfig?.('csrftoken') || null;                    
                    if(!sessionToken || !csrfToken) {
                        console.warn(`Failed to retrieve session or CSRF token, ${sessionToken}, ${csrfToken}`);
                        return;
                    }

                    const headers: HeadersInit = {
                        'Content-Type': 'application/json',
                    };
                    headers['X-Csrf-Token'] = csrfToken;
                    headers['X-Session-Token'] = sessionToken;
                    // 发送POST请求到REST API，包含session认证
                    const response = await fetch('/rest/egroupservice/v1/hierarchy', {
                        method: 'POST',
                        headers: headers,
                        credentials: 'include', // 包含cookies用于session认证
                        body: JSON.stringify({
                            hierarchy: hierarchyData
                        })
                    });

                    if (response.ok) {
                        const result = await response.json();
                        console.log("Successfully sent hierarchy data to API:", result);
                    } else {
                        console.error("Failed to send hierarchy data:", response.status, response.statusText);
                        const errorText = await response.text();
                        console.error("Error response:", errorText);
                    }
                } catch (error) {
                    console.error("Error sending hierarchy data to API:", error);
                }
            }
        };

        // 添加全局点击事件监听器
        document.addEventListener('click', handleSaveGroupHierarchyClick, true);

        // 清理函数
        return () => {
            document.removeEventListener('click', handleSaveGroupHierarchyClick, true);
        };
    }, [treeData, enableDragDrop]); // 依赖treeData和enableDragDrop，确保使用最新的配置

    return (
        <div className="pmp-dnd-tree-widget">
            {/* <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                    onClick={loadSampleData}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Load from sample data
                </button>
                <span style={{ fontSize: '12px', color: '#666' }}>
                    Click to load sample tree data for testing
                </span>
            </div> */}
            
            {/* 工具栏 */}
            <div className="tree-toolbar" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '20px',
                backgroundColor: selectedNodeIds.length > 0 ? "#007bff" : "white",
                padding: '0px 1px',
                borderRadius: '4px',
                color: selectedNodeIds.length > 0 ? "white" : "inherit",
            }}>
                {selectedNodeIds.length > 0 ? (
                    // 选择状态栏 - 使用 div 容器
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '500',
                            fontFamily: '"noto-sans", "Noto Sans KR", "Noto Sans SC", sans-serif'
                        }}>
                            {selectedNodeIds.length} Item{selectedNodeIds.length > 1 ? 's' : ''} Selected
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                onClick={handleDeleteSelected}
                                style={{
                                    padding: '6px 6px',
                                    backgroundColor: 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontFamily: '"noto-sans", "Noto Sans KR", "Noto Sans SC", sans-serif',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                <RiDeleteBin5Line size={16} />
                                Delete
                            </button>
                            <div style={{
                                width: '1px',
                                height: '28px',
                                backgroundColor: 'white',
                                opacity: 0.5
                            }} />
                            <button
                                onClick={handleCancelSelection}
                                style={{
                                    padding: '6px 6px',
                                    backgroundColor: 'transparent',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontFamily: '"noto-sans", "Noto Sans KR", "Noto Sans SC", sans-serif'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    // 正常状态：搜索栏和按钮 - 使用 div 容器
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        {/* 左侧：搜索栏 */}
                        <div className="search-container pds-text-filter pds-header-filters__search" style={{ flex: '0 0 320px' }}>
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
                        {(showEditHierarchyButton || showCreateButton) && (
                            <div className="button-group" style={{ display: 'flex', gap: '8px' }}>
                                {showEditHierarchyButton && (
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
                                )}
                                {showCreateButton && (
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
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <TreeTable 
                data={filteredTreeData} 
                onNodeToggle={handleNodeToggle}
                onNodeSelect={handleNodeSelect}
                onNodeClick={handleNodeClick}
                onRowClick={handleRowClick}
                onNodeMove={handleNodeMove}
                onSelectionChange={handleSelectionChange}
                clearSelection={clearSelection}
                enableDragDrop={enableDragDrop}
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
