"use server";

import connectToDatabase from "@/lib/db";
import CommandConfig, { ICommandConfigFrontend } from "@/models/CommandConfig";
import { revalidatePath } from "next/cache";
import { PREMIUM_COMMANDS } from "@/lib/constants/premium";

export async function getGuildCommands(guildId: string, category?: string) {
    await connectToDatabase();

    const query: any = { guild_id: guildId };
    if (category) {
        query.category = category;
    }

    const commands = await CommandConfig.find(query).lean();

    // Convert _id and dates to strings for serialization and override premium status
    return JSON.parse(JSON.stringify(commands)).map((cmd: any) => ({
        ...cmd,
        is_premium: PREMIUM_COMMANDS.includes(cmd.command)
    }));
}

export async function updateCommandConfig(
    guildId: string,
    command: string,
    updates: Partial<ICommandConfigFrontend>
) {
    await connectToDatabase();

    try {
        const result = await CommandConfig.findOneAndUpdate(
            { guild_id: guildId, command: command },
            { $set: updates },
            { new: true }
        );

        if (!result) {
            throw new Error("Command not found");
        }

        revalidatePath(`/dashboard/${guildId}/utility`);
        return { success: true, data: JSON.parse(JSON.stringify(result)) };
    } catch (error) {
        console.error("Failed to update command config:", error);
        return { success: false, error: "Failed to update settings" };
    }
}
