import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiscordGuild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: number;
    features: string[];
}

async function getMutualGuilds(accessToken: string) {
    const res = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        console.error("Failed to fetch user guilds", await res.text());
        return [];
    }

    const guilds: DiscordGuild[] = await res.json();
    // Filter for Manage Server (0x20)
    return guilds.filter((guild) => (guild.permissions & 0x20) === 0x20);
}

async function getBotGuilds() {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) return [];

    const res = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: {
            Authorization: `Bot ${botToken}`,
        },
        next: { revalidate: 60 }, // Cache for 60 seconds
    });

    if (!res.ok) {
        console.error("Failed to fetch bot guilds", await res.text());
        return [];
    }

    const guilds: DiscordGuild[] = await res.json();
    return guilds.map(g => g.id);
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/");
    }

    const [userGuilds, botGuildIds] = await Promise.all([
        getMutualGuilds(session.accessToken as string),
        getBotGuilds(),
    ]);

    const activeGuilds = userGuilds.filter(g => botGuildIds.includes(g.id));
    const availableGuilds = userGuilds.filter(g => !botGuildIds.includes(g.id));

    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&permissions=8&integration_type=0&scope=bot+applications.commands`;

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

            {/* Active Servers Section */}
            <section className="mb-12">
                <h2 className="text-xl font-semibold mb-6 text-gray-300 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" /> Active Servers
                </h2>
                {activeGuilds.length === 0 ? (
                    <div className="text-center py-10 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                        <p className="text-gray-400">No active servers found. Invite the bot to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {activeGuilds.map((guild) => (
                            <Link
                                key={guild.id}
                                href={`/dashboard/${guild.id}`}
                                className="group relative block p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-purple-500/50 transition-all"
                            >
                                <div className="flex flex-col items-center text-center">
                                    {guild.icon ? (
                                        <img
                                            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                                            alt={guild.name}
                                            className="w-20 h-20 rounded-full mb-4 group-hover:scale-110 transition-transform"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-gray-700 mb-4 flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform">
                                            {guild.name.charAt(0)}
                                        </div>
                                    )}
                                    <h3 className="font-semibold truncate w-full">{guild.name}</h3>
                                    {guild.owner && (
                                        <span className="absolute top-4 right-4 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full flex items-center gap-1">
                                            <Shield className="w-3 h-3" /> Owner
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Available Servers Section */}
            <section>
                <h2 className="text-xl font-semibold mb-6 text-gray-300 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-400" /> Setup New Server
                </h2>
                {availableGuilds.length === 0 ? (
                    <p className="text-gray-500">You don't have any other servers to manage.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {availableGuilds.map((guild) => (
                            <div
                                key={guild.id}
                                className="group relative p-6 bg-white/5 rounded-2xl border border-white/10 opacity-75 hover:opacity-100 transition-all"
                            >
                                <div className="flex flex-col items-center text-center">
                                    {guild.icon ? (
                                        <img
                                            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                                            alt={guild.name}
                                            className="w-20 h-20 rounded-full mb-4 grayscale group-hover:grayscale-0 transition-all"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-full bg-gray-700 mb-4 flex items-center justify-center text-2xl font-bold">
                                            {guild.name.charAt(0)}
                                        </div>
                                    )}
                                    <h3 className="font-semibold truncate w-full mb-4">{guild.name}</h3>
                                    <Button asChild variant="outline" className="w-full border-white/20 hover:bg-white/10">
                                        <a href={`${inviteUrl}&guild_id=${guild.id}`} target="_blank" rel="noopener noreferrer">
                                            Invite Bot
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
