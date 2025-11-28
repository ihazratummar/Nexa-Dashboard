"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Wrench,
    ShieldAlert,
    Trophy,
    Coins,
    ScrollText,
    MessageSquare,
    FileCode,
    Settings,
    UserCog,
    Shield,
    Swords,
    Twitch,
    Video,
    MessageCircle,
    Menu,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    guildId: string;
}

const modules = [
    {
        category: "General",
        items: [
            { name: "Overview", href: "", icon: LayoutDashboard },
            { name: "Embed Messages", href: "/embeds", icon: FileCode },
        ]
    },
    {
        category: "Modules",
        items: [
            { name: "Utility", href: "/utility", icon: Wrench },
            { name: "Moderation", href: "/moderation", icon: ShieldAlert },
            { name: "Auto Moderation", href: "/automod", icon: Shield },
            { name: "Leveling", href: "/leveling", icon: Trophy },
            { name: "Economy", href: "/economy", icon: Coins },
            { name: "Logs", href: "/logs", icon: ScrollText },
            { name: "Welcome", href: "/welcome", icon: MessageSquare },
            { name: "Auto Roles", href: "#", icon: UserCog, comingSoon: true },
            { name: "Anti-Raid", href: "#", icon: Swords, comingSoon: true },
        ]
    },
    {
        category: "Notifications",
        items: [
            { name: "Twitch", href: "#", icon: Twitch, comingSoon: true },
            { name: "Kick", href: "#", icon: Video, comingSoon: true },
            { name: "Reddit", href: "#", icon: MessageCircle, comingSoon: true },
        ]
    }
];

export function Sidebar({ guildId }: SidebarProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const SidebarContent = () => (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-lg">Server Settings</span>
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="lg:hidden text-gray-400 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="space-y-8">
                {modules.map((section) => (
                    <div key={section.category}>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                            {section.category}
                        </h3>
                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const isActive = pathname === `/dashboard/${guildId}${item.href}`;
                                return (
                                    <Link
                                        key={item.name}
                                        href={`/dashboard/${guildId}${item.href}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                            isActive
                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                                : "text-gray-400 hover:bg-white/5 hover:text-gray-200 hover:translate-x-1"
                                        )}
                                    >
                                        <item.icon className={cn("w-5 h-5", isActive && "text-white")} />
                                        <span className="flex-1">{item.name}</span>
                                        {/* @ts-ignore */}
                                        {item.comingSoon && (
                                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded uppercase font-bold tracking-wider">
                                                Soon
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden fixed top-20 left-4 z-40 p-3 bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 rounded-lg shadow-lg transition-all"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex w-64 bg-black/20 border-r border-white/10 flex-col h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide">
                <SidebarContent />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <>
                    <div
                        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="lg:hidden fixed inset-y-0 left-0 w-64 bg-[#1a1a1a] border-r border-white/10 z-50 overflow-y-auto transform transition-transform duration-300">
                        <SidebarContent />
                    </div>
                </>
            )}
        </>
    );
}
