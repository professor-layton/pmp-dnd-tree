# PMP DnD Tree Widget

A hierarchical tree table widget for Mendix applications that displays data in an expandable/collapsible tree structure with checkboxes, detailed descriptions, UUID information, and **drag-and-drop functionality** for tree restructuring. The widget is designed for **single-root tree structures** where there is exactly one root node with multiple levels of child nodes.

## Features

- **Single Root Architecture**: Designed for trees with exactly one root node
- **Hierarchical Display**: Shows data in a multi-level tree structure
- **Expandable/Collapsible Nodes**: Click on parent nodes to expand or collapse child nodes
- **Checkbox Selection**: Each row includes a checkbox for item selection
- **Drag & Drop Restructuring**: Move non-root nodes to reorganize the tree structure
- **Root Node Identification**: Root node is clearly marked with a "ROOT" tag
- **Rich Content Display**: Shows group name, description, and UUID for each item
- **Statistics Display**: Shows app count (📱) and resource count (🗃️) for each group on the right side
- **Visual Indentation**: Each level is visually indented to show hierarchy
- **Enhanced Row Height**: Taller rows accommodate multiple lines of information
- **Responsive Design**: Clean, modern table design with hover effects
- **Keyboard Accessible**: Supports keyboard navigation and screen readers

## Drag & Drop Functionality

### What You Can Do
- **Drag any non-root node** (the single root node cannot be moved)
- **Drop in three positions**:
  - **Before**: Place the node before the target node at the same level
  - **After**: Place the node after the target node at the same level  
  - **Inside**: Make the node a child of the target node

### Example Usage
Single root tree restructuring:
```
Original Tree:
☐ ▼ Platform Group ROOT
  ☐ ▶ Digital Marketing
    ☐ • Social Media
    ☐ • SEO
  ☐ ▶ Traditional Marketing
  ☐ ▶ Sales Division

After dragging "Social Media" inside "Sales Division":
☐ ▼ Platform Group ROOT
  ☐ ▶ Digital Marketing
    ☐ • SEO
  ☐ ▶ Traditional Marketing
  ☐ ▶ Sales Division
    ☐ • Social Media
```

### Drag & Drop Restrictions
- ✅ Only non-root nodes can be dragged (maintains single root structure)
- ❌ Cannot drop a parent node into its own children (prevents circular dependencies)
- ❌ Cannot drop a node onto itself
- ✅ Visual indicators show valid drop zones
- ✅ Automatic level recalculation after drops
- ✅ Preserves single root architecture

## Components

### TreeTable Component
The main tree table component that renders hierarchical data with enhanced styling and drag-drop support.

**Props:**
- `data: TreeNode[]` - Array of root level nodes
- `onNodeToggle?: (nodeId: string) => void` - Callback when nodes are expanded/collapsed
- `onNodeSelect?: (nodeId: string, selected: boolean) => void` - Callback when nodes are selected/deselected
- `onNodeMove?: (draggedNodeId: string, targetNodeId: string, position: 'before' | 'after' | 'inside') => void` - Callback when nodes are moved
- `enableDragDrop?: boolean` - Enable/disable drag and drop functionality
- `className?: string` - Additional CSS classes

### TreeNode Interface
```typescript
interface TreeNode {
    id: string;              // Unique identifier
    name: string;            // Display name
    description?: string;    // Detailed description
    uuid?: string;          // UUID identifier
    level: number;          // Hierarchy level (0 = root)
    children?: TreeNode[];  // Child nodes
    isExpanded?: boolean;   // Expansion state
    isSelected?: boolean;   // Selection state
    parentId?: string;      // Parent node ID
    isDragging?: boolean;   // Currently being dragged
    isDropTarget?: boolean; // Valid drop target
    appCount?: number;      // Number of apps in this group
    resourceCount?: number; // Number of resources in this group
}
```

## Visual Structure with Drag Handles

The tree displays data with rich information layout, drag handles, and statistics:
```
☐ ⋮⋮ ▼ Platform Group ROOT                              📱 12  🗃️ 38
       Platform development and marketing initiatives.
       UUID: 123456-789012-345679
  ☐ ⋮⋮ ▶ Digital Marketing                             📱 8   🗃️ 24
         Comprehensive digital marketing strategies...
         UUID: 123456-789012-345680
    ☐ ⋮⋮ • Social Media                                📱 3   🗃️ 8
           Social media management and content creation.
           UUID: 123456-789012-345681
    ☐ ⋮⋮ • SEO Optimization                            📱 2   🗃️ 6
           Search engine optimization and content strategy.
           UUID: 123456-789012-345682
```

### Statistics Display
- **📱 App Count**: Shows the number of applications associated with each group
- **🗃️ Resource Count**: Shows the number of resources associated with each group
- **Positioning**: Statistics are displayed on the right side of each row
- **Styling**: Each statistic is shown in a badge-like container with icon and count

## Key Features

### Enhanced Row Design
- **Checkbox**: Every row includes a selectable checkbox
- **Drag Handle**: `⋮⋮` icon for draggable nodes (non-root only)
- **Increased Height**: Minimum 60px row height for better readability
- **Multi-line Content**: Each row displays name, description, and UUID

### Drag & Drop Visual Feedback
- **Dragging State**: Semi-transparent appearance during drag
- **Drop Zones**: Blue highlighting and borders for valid targets
- **Position Indicators**: Visual cues for before/after/inside placement
- **Hover Effects**: Interactive feedback during drag operations

### Interactive Elements
- **Expand/Collapse**: Arrow icons (▶/▼) for parent nodes
- **Selection**: Individual checkbox state management
- **Drag & Drop**: Grab cursor and visual feedback
- **Hover Effects**: Subtle background color changes

## Styling

The component includes comprehensive CSS styling with:
- Modern card-like container with subtle shadows
- Drag and drop visual states and animations
- Position indicators for drop zones
- Responsive design for mobile devices
- Proper color contrast and typography hierarchy

## Usage Example

```typescript
const [treeData, setTreeData] = useState(initialData);

const handleNodeMove = (draggedNodeId: string, targetNodeId: string, position: 'before' | 'after' | 'inside') => {
    const newTreeData = moveNode(treeData, draggedNodeId, targetNodeId, position);
    setTreeData(newTreeData);
};

<TreeTable 
    data={treeData} 
    onNodeToggle={handleNodeToggle}
    onNodeSelect={handleNodeSelect}
    onNodeMove={handleNodeMove}
    enableDragDrop={true}
    className="group-plants-tree"
/>
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

This widget provides a complete drag-and-drop tree management solution with modern UI patterns, comprehensive validation, and seamless tree restructuring capabilities. PMPDnDTree
[My widget description]

## Features
[feature highlights]

## Usage
[step by step instructions]

## Demo project
[link to sandbox]

## Issues, suggestions and feature requests
[link to GitHub issues]

## Development and contribution

1. Install NPM package dependencies by using: `npm install`. If you use NPM v7.x.x, which can be checked by executing `npm -v`, execute: `npm install --legacy-peer-deps`.
1. Run `npm start` to watch for code changes. On every change:
    - the widget will be bundled;
    - the bundle will be included in a `dist` folder in the root directory of the project;
    - the bundle will be included in the `deployment` and `widgets` folder of the Mendix test project.

[specify contribution]
