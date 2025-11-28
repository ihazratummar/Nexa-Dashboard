import { getGuildCommands } from "@/lib/actions/commands";
import { getGuildRoles, getGuildChannels } from "@/lib/actions/guild";
import CommandCard from "@/components/dashboard/commands/CommandCard";
import { Wrench } from "lucide-react";

interface PageProps {
    params: {
        guildId: string;
    };
}

export default async function UtilityPage({ params }: PageProps) {
    const { guildId } = await params;
    const [commands, roles, channels] = await Promise.all([
        getGuildCommands(guildId, "Utility"),
        getGuildRoles(guildId),
        getGuildChannels(guildId)
    ]);

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-500/10 rounded-xl">
                    <Wrench className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Utility</h1>
                    <p className="text-gray-400">Configure utility commands and settings.</p>
                </div>
            </div>

            <div className="space-y-4">
                {commands.length === 0 ? (
                    <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
                        <p className="text-gray-400">No utility commands found. Try running a command in your server first!</p>
                    </div>
                ) : (
                    commands.map((cmd: any) => (
                        <CommandCard
                            key={cmd._id}
                            command={cmd}
                            guildId={guildId}
                            roles={roles}
                            channels={channels}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
