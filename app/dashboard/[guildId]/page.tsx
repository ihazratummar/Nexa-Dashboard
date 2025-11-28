import { getGuildDetails } from "@/lib/discord";
import { getGuildChannels, getGuildRoles } from "@/lib/actions/guild";
import ServerStats from "@/components/dashboard/ServerStats";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default async function ServerOverviewPage({ params }: { params: Promise<{ guildId: string }> }) {
    const { guildId } = await params;
    const guild = await getGuildDetails(guildId);

    if (!guild) {
        redirect("/dashboard");
    }

    const [channels, roles] = await Promise.all([
        getGuildChannels(guildId),
        getGuildRoles(guildId)
    ]);

    const textChannels = channels.filter((c: any) => c.type === 0).length;
    const voiceChannels = channels.filter((c: any) => c.type === 2).length;
    const categories = channels.filter((c: any) => c.type === 4).length;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Server Name Card */}
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                    {guild.icon ? (
                        <img
                            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                            alt={guild.name}
                            className="w-16 h-16 rounded-full"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold">
                            {guild.name.charAt(0)}
                        </div>
                    )}
                    <div>
                        <h3 className="text-gray-400 text-sm">Server Name</h3>
                        <p className="text-xl font-bold">{guild.name}</p>
                    </div>
                </div>

                {/* Verification Level Card */}
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                        <ShieldCheck className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-gray-400 text-sm">Verification Level</h3>
                        <p className="text-xl font-bold">{guild.verification_level}</p>
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">Server Statistics</h2>
            <ServerStats
                memberCount={guild.approximate_member_count || 0}
                categoryCount={categories}
                textChannelCount={textChannels}
                voiceChannelCount={voiceChannels}
                roleCount={roles.length}
            />
        </div>
    );
}
