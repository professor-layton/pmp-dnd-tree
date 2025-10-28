# PMP DnD Tree Widget

A hierarchical tree table widget for Mendix applications that displays data in an expandable/collapsible tree structure with checkboxes, detailed descriptions, and UUID information.

## Features

- **Hierarchical Display**: Shows data in a multi-level tree structure
- **Expandable/Collapsible Nodes**: Click on parent nodes to expand or collapse child nodes
- **Checkbox Selection**: Each row includes a checkbox for item selection
- **Rich Content Display**: Shows group name, description, and UUID for each item
- **Visual Indentation**: Each level is visually indented to show hierarchy
- **Enhanced Row Height**: Taller rows accommodate multiple lines of information
- **Responsive Design**: Clean, modern table design with hover effects
- **Keyboard Accessible**: Supports keyboard navigation and screen readers

## Components

### TreeTable Component
The main tree table component that renders hierarchical data with enhanced styling.

**Props:**
- `data: TreeNode[]` - Array of root level nodes
- `onNodeToggle?: (nodeId: string) => void` - Callback when nodes are expanded/collapsed
- `onNodeSelect?: (nodeId: string, selected: boolean) => void` - Callback when nodes are selected/deselected
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
}
```

## Visual Structure

The tree displays data with rich information layout:
```
☐ ▼ Platform Group
     1 line description about this Platform group.
     UUID: 123456-789012-345678
  ☐ ▶ Digital Marketing
       Comprehensive digital marketing strategies and campaigns.
       UUID: 123456-789012-345679
    ☐ • Social Media
         Social media management and content creation.
         UUID: 123456-789012-345680
```

## Key Features

### Enhanced Row Design
- **Checkbox**: Every row includes a selectable checkbox
- **Increased Height**: Minimum 60px row height for better readability
- **Multi-line Content**: Each row displays:
  - Group/item name (bold, hierarchical font sizing)
  - Description (gray text, smaller font)
  - UUID (monospace font, smallest size)

### Visual Hierarchy
- **Level 0**: Bold, larger font for root items
- **Level 1**: Semi-bold, standard font for sub-categories
- **Level 2+**: Regular weight, slightly smaller fonts for leaf items
- **Indentation**: 20px per level with visual expand/collapse controls

### Interactive Elements
- **Expand/Collapse**: Arrow icons (▶/▼) for parent nodes
- **Selection**: Individual checkbox state management
- **Hover Effects**: Subtle background color changes on row hover

## Styling

The component includes comprehensive CSS styling with:
- Modern card-like container with subtle shadows
- Clean borders and rounded corners
- Responsive design for mobile devices
- Proper color contrast and typography hierarchy
- Smooth animations for interactions

## Usage Example

```typescript
const handleNodeToggle = (nodeId: string) => {
    console.log("Node toggled:", nodeId);
};

const handleNodeSelect = (nodeId: string, selected: boolean) => {
    console.log("Node selected:", nodeId, selected);
};

<TreeTable 
    data={treeData} 
    onNodeToggle={handleNodeToggle}
    onNodeSelect={handleNodeSelect}
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

This widget is designed to match modern UI patterns with enhanced usability and comprehensive information display for hierarchical data structures. PMPDnDTree
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
