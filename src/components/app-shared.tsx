import { IconPlaceholder } from "@/components/icon-placeholder";
export type SidebarNavItem = {
	title: string;
	url: string;
	icon: React.ReactNode;
	isActive?: boolean;
};

export type SidebarNavGroup = {
	label?: string;
	items: SidebarNavItem[];
};

export const navGroups: SidebarNavGroup[] = [
	{
		label: "Product",
		items: [
			{
				title: "Dashboard",
				url: "#/overview",
				icon: (
					<IconPlaceholder
						hugeicons="DashboardSquare01Icon"
						lucide="LayoutGridIcon"
						phosphor="SquaresFourIcon"
						remixicon="RiDashboardLine"
						tabler="IconLayoutGrid"
					/>
				),
				isActive: true,
			},
			{
				title: "Analytics",
				url: "#/analytics",
				icon: (
					<IconPlaceholder
						hugeicons="Analytics02Icon"
						lucide="BarChart3Icon"
						phosphor="ChartBarIcon"
						remixicon="RiBarChartLine"
						tabler="IconChartBar"
					/>
				),
			},
			{
				title: "Projects",
				url: "#/projects",
				icon: (
					<IconPlaceholder
						hugeicons="Briefcase02Icon"
						lucide="BriefcaseIcon"
						phosphor="BriefcaseIcon"
						remixicon="RiBriefcaseLine"
						tabler="IconBriefcase"
					/>
				),
			},
			{
				title: "Team",
				url: "#/team",
				icon: (
					<IconPlaceholder
						hugeicons="UserMultipleIcon"
						lucide="UsersIcon"
						phosphor="UsersIcon"
						remixicon="RiGroupLine"
						tabler="IconUsers"
					/>
				),
			},
			{
				title: "Integrations",
				url: "#/integrations",
				icon: (
					<IconPlaceholder
						hugeicons="Plug01Icon"
						lucide="PlugIcon"
						phosphor="PlugIcon"
						remixicon="RiPlugLine"
						tabler="IconPlug"
					/>
				),
			},
			{
				title: "API Keys",
				url: "#/api-keys",
				icon: (
					<IconPlaceholder
						hugeicons="Key01Icon"
						lucide="KeyRoundIcon"
						phosphor="KeyIcon"
						remixicon="RiKey2Line"
						tabler="IconKey"
					/>
				),
			},
		],
	},
	{
		label: "Administration",
		items: [
			{
				title: "Settings",
				url: "#/settings",
				icon: (
					<IconPlaceholder
						hugeicons="Settings01Icon"
						lucide="SettingsIcon"
						phosphor="GearIcon"
						remixicon="RiSettings3Line"
						tabler="IconSettings"
					/>
				),
			},
		],
	},
];

export const footerNavLinks: SidebarNavItem[] = [
	{
		title: "Feedback",
		url: "#/feedback",
		icon: (
			<IconPlaceholder
				data-icon="inline-start"
				hugeicons="Navigation03Icon"
				lucide="SendIcon"
				phosphor="PaperPlaneTiltIcon"
				remixicon="RiSendPlaneLine"
				tabler="IconSend"
			/>
		),
	},
	{
		title: "Help Center",
		url: "#/help",
		icon: (
			<IconPlaceholder
				hugeicons="HelpCircleIcon"
				lucide="HelpCircleIcon"
				phosphor="QuestionIcon"
				remixicon="RiQuestionLine"
				tabler="IconHelpCircle"
			/>
		),
	},

	{
		title: "Documentation",
		url: "#/documentation",
		icon: (
			<IconPlaceholder
				hugeicons="BookOpen01Icon"
				lucide="BookOpenIcon"
				phosphor="BookOpenIcon"
				remixicon="RiBookOpenLine"
				tabler="IconBook"
			/>
		),
	},
];

export const navLinks: SidebarNavItem[] = [
	...navGroups.flatMap((group) => group.items),
	...footerNavLinks,
];
