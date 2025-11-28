"use server";

import connectToDatabase from "@/lib/db";
import ModerationSettings, { IModerationSettingsFrontend } from "@/models/ModerationSettings";
import { revalidatePath } from "next/cache";

export async function getModerationSettings(guildId: string) {
    await connectToDatabase();

    let settings = await ModerationSettings.findOne({ guild_id: guildId }).lean();

    if (!settings) {
        // Create default settings if not exists
        settings = await ModerationSettings.create({
            guild_id: guildId,
            is_moderation_settings_enabled: false,
            mode_roles: []
        });
        settings = JSON.parse(JSON.stringify(settings));
    } else {
        settings = JSON.parse(JSON.stringify(settings));
    }

    return settings as unknown as IModerationSettingsFrontend;
}

export async function updateModerationSettings(
    guildId: string,
    updates: Partial<IModerationSettingsFrontend>
) {
    await connectToDatabase();

    try {
        const result = await ModerationSettings.findOneAndUpdate(
            { guild_id: guildId },
            { $set: updates },
            { new: true, upsert: true }
        );

        revalidatePath(`/dashboard/${guildId}/moderation`);
        return { success: true, data: JSON.parse(JSON.stringify(result)) };
    } catch (error) {
        console.error("Failed to update moderation settings:", error);
        return { success: false, error: "Failed to update settings" };
    }
}
