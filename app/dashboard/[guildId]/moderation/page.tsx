import { getGuildCommands } from "@/lib/actions/commands";
import { getGuildRoles, getGuildChannels, getGuildSettings, getBotHighestRolePosition } from "@/lib/actions/guild";
import { getModerationSettings } from "@/lib/actions/moderation";
import CommandCard from "@/components/dashboard/commands/CommandCard";
import ModerationHeader from "@/components/dashboard/moderation/ModerationHeader";

interface PageProps {
    params: {
        guildId: string;
    };
}

export default async function ModerationPage({ params }: PageProps) {
    const { guildId } = await params;
    const [commands, roles, channels, settings, guildSettings, botHighestRolePosition] = await Promise.all([
        getGuildCommands(guildId, "ModerationCommands"),
        getGuildRoles(guildId),
        getGuildChannels(guildId),
        getModerationSettings(guildId),
        getGuildSettings(guildId),
        getBotHighestRolePosition(guildId)
    ]);

    return (
        <div>
            <ModerationHeader
                settings={settings}
                roles={roles}
                guildId={guildId}
                botHighestRolePosition={botHighestRolePosition}
            />

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-300 px-1">Moderation Commands</h2>
                {commands.length === 0 ? (
                    <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
                        <p className="text-gray-400">No moderation commands found.</p>
                    </div>
                ) : (
                    commands.map((cmd: any) => (
                        <CommandCard
                            key={cmd._id}
                            command={cmd}
                            guildId={guildId}
                            roles={roles}
                            channels={channels}
                            isGuildPremium={guildSettings?.is_premium || false}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
