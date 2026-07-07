"use client";
import { IconPlaceholder } from "@/components/icon-placeholder";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

type UserType = {
	name: string;
	email: string;
	avatar: string;
};

const user: UserType = {
	name: "Shaban Haider",
	email: "shaban@efferd.com",
	avatar: "https://github.com/shabanhr.png",
};

export function NavUser() {
	const { isMobile } = useSidebar();

	return (
		<SidebarMenu className="border-t p-2">
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton className="text-muted-foreground">
							<Avatar className="size-5">
								<AvatarImage alt={user.name} src={user.avatar} />
								<AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
							</Avatar>
							<span className="font-medium text-sm">
								{user.name.split(" ")[0]}
							</span>
							<IconPlaceholder
								className="ml-auto size-3!"
								hugeicons="ArrowUp01Icon"
								lucide="ChevronsUpDownIcon"
								phosphor="CaretUpDownIcon"
								remixicon="RiExpandUpDownLine"
								tabler="IconCaretUpDown"
							/>
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="min-w-48"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<IconPlaceholder
									hugeicons="SparklesIcon"
									lucide="SparklesIcon"
									phosphor="SparkleIcon"
									remixicon="RiSparklingLine"
									tabler="IconSparkles"
								/>
								Upgrade to Pro
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<IconPlaceholder
									hugeicons="UserIcon"
									lucide="UserIcon"
									phosphor="UserIcon"
									remixicon="RiUserLine"
									tabler="IconUser"
								/>
								Profile
							</DropdownMenuItem>
							<DropdownMenuItem>
								<IconPlaceholder
									hugeicons="Notification03Icon"
									lucide="BellIcon"
									phosphor="BellIcon"
									remixicon="RiNotification3Line"
									tabler="IconBell"
								/>
								Notifications
							</DropdownMenuItem>
							<DropdownMenuItem>
								<IconPlaceholder
									hugeicons="CreditCardIcon"
									lucide="CreditCardIcon"
									phosphor="CreditCardIcon"
									remixicon="RiBankCardLine"
									tabler="IconCreditCard"
								/>
								Billing
							</DropdownMenuItem>
							<DropdownMenuItem>
								<IconPlaceholder
									hugeicons="Settings01Icon"
									lucide="SettingsIcon"
									phosphor="GearIcon"
									remixicon="RiSettings3Line"
									tabler="IconSettings"
								/>
								Settings
							</DropdownMenuItem>
							<DropdownMenuItem>
								<IconPlaceholder
									hugeicons="CustomerSupportIcon"
									lucide="LifeBuoyIcon"
									phosphor="LifebuoyIcon"
									remixicon="RiLifebuoyLine"
									tabler="IconHelpCircle"
								/>
								Help Center
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="text-error focus:text-error">
							<IconPlaceholder
								hugeicons="Logout02Icon"
								lucide="LogOutIcon"
								phosphor="SignOutIcon"
								remixicon="RiLogoutBoxRLine"
								tabler="IconLogout2"
							/>
							Log out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
