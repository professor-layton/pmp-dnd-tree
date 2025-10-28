import { TreeNode } from "../types/TreeTypes";

export const sampleTreeData: TreeNode[] = [
    {
        id: "1",
        name: "Organization",
        description: "Company organizational structure with all departments.",
        uuid: "123456-789012-345678",
        level: 0,
        appCount: 45,
        resourceCount: 128,
        children: [
            {
                id: "1-1",
                name: "Platform Group",
                description: "Platform development and marketing initiatives.",
                uuid: "123456-789012-345679",
                level: 1,
                parentId: "1",
                appCount: 12,
                resourceCount: 38,
                children: [
                    {
                        id: "1-1-1",
                        name: "Digital Marketing",
                        description: "Comprehensive digital marketing strategies and campaigns.",
                        uuid: "123456-789012-345680",
                        level: 2,
                        parentId: "1-1",
                        appCount: 8,
                        resourceCount: 24,
                        children: [
                            {
                                id: "1-1-1-1",
                                name: "Social Media",
                                description: "Social media management and content creation.",
                                uuid: "123456-789012-345681",
                                level: 3,
                                parentId: "1-1-1",
                                appCount: 3,
                                resourceCount: 8
                            },
                            {
                                id: "1-1-1-2",
                                name: "SEO Optimization",
                                description: "Search engine optimization and content strategy.",
                                uuid: "123456-789012-345682",
                                level: 3,
                                parentId: "1-1-1",
                                appCount: 2,
                                resourceCount: 6
                            },
                            {
                                id: "1-1-1-3",
                                name: "Email Marketing",
                                description: "Automated email campaigns and customer engagement.",
                                uuid: "123456-789012-345683",
                                level: 3,
                                parentId: "1-1-1",
                                appCount: 3,
                                resourceCount: 10
                            }
                        ]
                    },
                    {
                        id: "1-1-2",
                        name: "Traditional Marketing",
                        description: "Classic marketing approaches and offline strategies.",
                        uuid: "123456-789012-345684",
                        level: 2,
                        parentId: "1-1",
                        appCount: 4,
                        resourceCount: 14,
                        children: [
                            {
                                id: "1-1-2-1",
                                name: "Print Advertising",
                                description: "Magazine, newspaper, and print media campaigns.",
                                uuid: "123456-789012-345685",
                                level: 3,
                                parentId: "1-1-2",
                                appCount: 2,
                                resourceCount: 7
                            },
                            {
                                id: "1-1-2-2",
                                name: "Radio & TV",
                                description: "Broadcast media advertising and sponsorships.",
                                uuid: "123456-789012-345686",
                                level: 3,
                                parentId: "1-1-2",
                                appCount: 2,
                                resourceCount: 7
                            }
                        ]
                    }
                ]
            },
            {
                id: "1-2",
                name: "Sales Division",
                description: "Revenue generation and customer acquisition teams.",
                uuid: "123456-789012-345687",
                level: 1,
                parentId: "1",
                appCount: 15,
                resourceCount: 42,
                children: [
                    {
                        id: "1-2-1",
                        name: "Inside Sales",
                        description: "Remote sales operations and lead qualification.",
                        uuid: "123456-789012-345688",
                        level: 2,
                        parentId: "1-2",
                        appCount: 8,
                        resourceCount: 22,
                        children: [
                            {
                                id: "1-2-1-1",
                                name: "Lead Generation",
                                description: "Prospect identification and initial outreach.",
                                uuid: "123456-789012-345689",
                                level: 3,
                                parentId: "1-2-1",
                                appCount: 4,
                                resourceCount: 11
                            },
                            {
                                id: "1-2-1-2",
                                name: "Sales Development",
                                description: "Qualified lead nurturing and conversion.",
                                uuid: "123456-789012-345690",
                                level: 3,
                                parentId: "1-2-1",
                                appCount: 4,
                                resourceCount: 11
                            }
                        ]
                    },
                    {
                        id: "1-2-2",
                        name: "Field Sales",
                        description: "On-site sales operations and client relationships.",
                        uuid: "123456-789012-345691",
                        level: 2,
                        parentId: "1-2",
                        appCount: 7,
                        resourceCount: 20,
                        children: [
                            {
                                id: "1-2-2-1",
                                name: "Enterprise Sales",
                                description: "Large account management and enterprise solutions.",
                                uuid: "123456-789012-345692",
                                level: 3,
                                parentId: "1-2-2",
                                appCount: 7,
                                resourceCount: 20
                            }
                        ]
                    }
                ]
            },
            {
                id: "1-3",
                name: "Engineering Department",
                description: "Product development and technical infrastructure.",
                uuid: "123456-789012-345693",
                level: 1,
                parentId: "1",
                appCount: 18,
                resourceCount: 48,
                children: [
                    {
                        id: "1-3-1",
                        name: "Frontend Development",
                        description: "User interface and user experience development.",
                        uuid: "123456-789012-345694",
                        level: 2,
                        parentId: "1-3",
                        appCount: 10,
                        resourceCount: 24,
                        children: [
                            {
                                id: "1-3-1-1",
                                name: "React Team",
                                description: "React.js application development and maintenance.",
                                uuid: "123456-789012-345695",
                                level: 3,
                                parentId: "1-3-1",
                                appCount: 6,
                                resourceCount: 15
                            },
                            {
                                id: "1-3-1-2",
                                name: "Mobile Team",
                                description: "iOS and Android mobile application development.",
                                uuid: "123456-789012-345696",
                                level: 3,
                                parentId: "1-3-1",
                                appCount: 4,
                                resourceCount: 9
                            }
                        ]
                    },
                    {
                        id: "1-3-2",
                        name: "Backend Development",
                        description: "Server-side development and system architecture.",
                        uuid: "123456-789012-345697",
                        level: 2,
                        parentId: "1-3",
                        appCount: 8,
                        resourceCount: 24,
                        children: [
                            {
                                id: "1-3-2-1",
                                name: "API Team",
                                description: "RESTful API design and microservices architecture.",
                                uuid: "123456-789012-345698",
                                level: 3,
                                parentId: "1-3-2",
                                appCount: 4,
                                resourceCount: 12
                            },
                            {
                                id: "1-3-2-2",
                                name: "Infrastructure",
                                description: "Cloud infrastructure and DevOps operations.",
                                uuid: "123456-789012-345699",
                                level: 3,
                                parentId: "1-3-2",
                                appCount: 4,
                                resourceCount: 12
                            }
                        ]
                    }
                ]
            },
            {
                id: "1-4",
                name: "Human Resources",
                description: "Talent management and organizational development.",
                uuid: "123456-789012-345700",
                level: 1,
                parentId: "1",
                appCount: 6,
                resourceCount: 18,
                children: [
                    {
                        id: "1-4-1",
                        name: "Recruitment",
                        description: "Talent acquisition and hiring process management.",
                        uuid: "123456-789012-345701",
                        level: 2,
                        parentId: "1-4",
                        appCount: 3,
                        resourceCount: 9
                    },
                    {
                        id: "1-4-2",
                        name: "Training & Development",
                        description: "Employee skill development and career advancement programs.",
                        uuid: "123456-789012-345702",
                        level: 2,
                        parentId: "1-4",
                        appCount: 3,
                        resourceCount: 9
                    }
                ]
            }
        ]
    }
];