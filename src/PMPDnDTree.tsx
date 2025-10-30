import { ReactElement, createElement, useState, useCallback } from "react";
import { TreeTable } from "./components/TreeTable";
import { sampleTreeData } from "./data/sampleData";
import { moveNode, deleteNodesAndMoveChildren } from "./utils/treeRestructure";
import { TreeNode } from "./types/TreeTypes";
import { buildTreeFromMendixGroups, fetchGroupByName, fetchGroupsFromMendix } from "./utils/mendixDataBuilder";
import { RiDeleteBin5Line } from "react-icons/ri";

import { PMPDnDTreeContainerProps } from "../typings/PMPDnDTreeProps";

import "./ui/PMPDnDTree.css";

export function PMPDnDTree({ sampleText, enableDragDrop, showCreateButton, showEditHierarchyButton }: PMPDnDTreeContainerProps): ReactElement {
    const [treeData, setTreeData] = useState<TreeNode[]>(sampleTreeData);
    const [filteredTreeData, setFilteredTreeData] = useState<TreeNode[]>(sampleTreeData);
    const [isLoadingMendixData, setIsLoadingMendixData] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
    const [clearSelection, setClearSelection] = useState(false);

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
                backgroundColor: selectedNodeIds.length > 0 ? "#007bff" : "white",
                padding: '8px 16px',
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
