"use server";

import connectToDatabase from "@/lib/db";
import AutoModerationSettings, { IAutoModerationSettingsFrontend, IAutoModFilter } from "@/models/AutoModerationSettings";
import { revalidatePath } from "next/cache";

const DEFAULT_FILTER_CONFIG = {
    enabled: false,
    actions: [],
    timeout_duration: 60,
    ignored_roles: [],
    ignored_channels: [],
    custom_config: {}
};

export async function getAutoModSettings(guildId: string) {
    await connectToDatabase();

    let settings = await AutoModerationSettings.findOne({ guild_id: guildId }).lean();

    if (!settings) {
        // Create default settings if not exists
        settings = await AutoModerationSettings.create({
            guild_id: guildId,
            global: {
                is_enabled: false,
                ignored_channels: [],
                ignored_roles: [],
                media_only_channels: [],
                youtube_only_channels: [],
                twitch_only_channels: []
            },
            filters: {
                // ... default filters are handled by schema defaults
            }
        });
        settings = JSON.parse(JSON.stringify(settings));
    } else {
        // Ensure all filters are present (backfill for existing documents)
        const defaultFilters = {
            spam: { enabled: false, actions: [], timeout_duration: 60, ignored_roles: [], ignored_channels: [], custom_config: {} },
            bad_words: { enabled: false, actions: [], timeout_duration: 60, ignored_roles: [], ignored_channels: [], custom_config: { bad_words: [] } },
            duplicate_text: { enabled: false, actions: [], timeout_duration: 60, ignored_roles: [], ignored_channels: [], custom_config: {} },
            repeated_messages: { enabled: false, actions: [], timeout_duration: 60, ignored_roles: [], ignored_channels: [], custom_config: {} },
            discord_invites: { enabled: false, actions: [], timeout_duration: 60, ignored_roles: [], ignored_channels: [], custom_config: {} },
            links: { enabled: false, actions: [], timeout_duration: 60, ignored_roles: [], ignored_channels: [], custom_config: {} },
            spammed_caps: { enabled: false, actions: [], timeout_duration: 60, ignored_roles: [], ignored_channels: [], custom_config: { max_caps_percentage: 70 } },
            emoji_spam: { enabled: false, actions: [], timeout_duration: 60, ignored_roles: [], ignored_channels: [], custom_config: { max_emojis: 10 } },
            mass_mention: { enabled: false, actions: [], timeout_duration: 60, ignored_roles: [], ignored_channels: [], custom_config: { max_mentions: 5 } },
            ai_moderation: {
                enabled: false,
                actions: [],
                timeout_duration: 60,
                ignored_roles: [],
                ignored_channels: [],
                custom_config: {
                    toxicity_threshold: 80,
                    nudity_threshold: 80,
                    gore_threshold: 80
                }
            }
        };

        settings = JSON.parse(JSON.stringify(settings));
        settings!.filters = { ...defaultFilters, ...settings!.filters };
    }

    return settings as unknown as IAutoModerationSettingsFrontend;
}

export async function updateAutoModGlobal(
    guildId: string,
    updates: Partial<IAutoModerationSettingsFrontend['global']>
) {
    await connectToDatabase();

    try {
        const result = await AutoModerationSettings.findOneAndUpdate(
            { guild_id: guildId },
            { $set: { global: updates } },
            { new: true }
        );

        revalidatePath(`/dashboard/${guildId}/automod`);
        return { success: true, data: JSON.parse(JSON.stringify(result)) };
    } catch (error) {
        console.error("Failed to update automod global settings:", error);
        return { success: false, error: "Failed to update settings" };
    }
}

export async function updateAutoModFilter(
    guildId: string,
    filterName: string,
    updates: IAutoModFilter
) {
    await connectToDatabase();

    try {
        const result = await AutoModerationSettings.findOneAndUpdate(
            { guild_id: guildId },
            { $set: { [`filters.${filterName}`]: updates } },
            { new: true }
        );

        revalidatePath(`/dashboard/${guildId}/automod`);
        return { success: true, data: JSON.parse(JSON.stringify(result)) };
    } catch (error) {
        console.error(`Failed to update automod filter ${filterName}:`, error);
        return { success: false, error: "Failed to update filter" };
    }
}
