import { getGuildDetails } from "@/lib/discord";
import { redirect } from "next/navigation";
import { Users, ShieldCheck } from "lucide-react";

export default async function ServerOverviewPage({ params }: { params: Promise<{ guildId: string }> }) {
    const { guildId } = await params;
    const guild = await getGuildDetails(guildId);

    if (!guild) {
        redirect("/dashboard");
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                {/* Member Count Card */}
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Users className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-gray-400 text-sm">Total Members</h3>
                        <p className="text-xl font-bold">{guild.approximate_member_count || 'N/A'}</p>
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
        </div>
    );
}
