import { getGuildRoles, getGuildChannels, getGuildSettings, getBotHighestRolePosition } from "@/lib/actions/guild";
import { getAutoModSettings } from "@/lib/actions/automod";
import AutoModGlobalSettings from "@/components/dashboard/automod/AutoModGlobalSettings";
import AutoModFilterCard from "@/components/dashboard/automod/AutoModFilterCard";
import AutoModHeader from "@/components/dashboard/automod/AutoModHeader";
import { PREMIUM_FILTERS } from "@/lib/constants/premium";

interface PageProps {
    params: {
        guildId: string;
    };
}

const FILTERS = [
    { id: 'spam', label: 'Anti-Spam', description: 'Prevent users from spamming messages rapidly.' },
    { id: 'bad_words', label: 'Bad Words', description: 'Block specific words or phrases.' },
    { id: 'duplicate_text', label: 'Duplicate Text', description: 'Prevent sending the same message multiple times.' },
    { id: 'repeated_messages', label: 'Repeated Messages', description: 'Prevent repeating the same content.' },
    { id: 'discord_invites', label: 'Discord Invites', description: 'Block Discord server invite links.' },
    { id: 'links', label: 'External Links', description: 'Block all external links.' },
    { id: 'spammed_caps', label: 'Excessive Caps', description: 'Prevent messages with too many capital letters.' },
    { id: 'emoji_spam', label: 'Emoji Spam', description: 'Prevent messages with too many emojis.' },
    { id: 'mass_mention', label: 'Mass Mention', description: 'Prevent mentioning too many users/roles.' },
    { id: 'ai_moderation', label: 'AI Moderation', description: 'Use AI to detect and block toxic, NSFW, or gore content.' },
].map(f => ({ ...f, premium: PREMIUM_FILTERS.includes(f.id) }));

export default async function AutoModPage({ params }: PageProps) {
    const { guildId } = await params;
    const [roles, channels, settings, guildSettings, botHighestRolePosition] = await Promise.all([
        getGuildRoles(guildId),
        getGuildChannels(guildId),
        getAutoModSettings(guildId),
        getGuildSettings(guildId),
        getBotHighestRolePosition(guildId)
    ]);

    return (
        <div>
            <AutoModHeader settings={settings.global} guildId={guildId} />

            <AutoModGlobalSettings
                settings={settings.global}
                roles={roles}
                channels={channels}
                guildId={guildId}
                botHighestRolePosition={botHighestRolePosition}
            />

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-300 px-1">Filters</h2>
                {FILTERS.map(filter => (
                    <AutoModFilterCard
                        key={filter.id}
                        filterName={filter.id}
                        label={filter.label}
                        description={filter.description}
                        config={settings.filters[filter.id as keyof typeof settings.filters]}
                        roles={roles}
                        channels={channels}
                        guildId={guildId}
                        isPremium={filter.premium}
                        isGuildPremium={guildSettings?.is_premium || false}
                        botHighestRolePosition={botHighestRolePosition}
                    />
                ))}
            </div>
        </div>
    );
}
