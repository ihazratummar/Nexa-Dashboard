"use server";

import dbConnect from "@/lib/db";
import Embed from "@/models/Embed";
import { revalidatePath } from "next/cache";

export async function getEmbeds(guildId: string) {
    await dbConnect();

    // Use the string directly - MongoDB will match it as stored
    const embeds = await Embed.find({ guild_id: guildId }).lean();

    return JSON.parse(JSON.stringify(embeds));
}

export async function saveEmbed(guildId: string, embedData: any) {
    await dbConnect();

    const { _id, ...data } = embedData;

    if (_id) {
        // Update existing embed and ensure guild_id is a string
        await Embed.findByIdAndUpdate(_id, {
            ...data,
            guild_id: guildId,
            updated_at: new Date()
        });
    } else {
        // Create new embed with guild_id as string
        await Embed.create({
            ...data,
            guild_id: guildId,
            created_at: new Date(),
            updated_at: new Date()
        });
    }

    revalidatePath(`/dashboard/${guildId}/embeds`);
    return { success: true };
}

export async function deleteEmbed(guildId: string, embedId: string) {
    await dbConnect();
    await Embed.findByIdAndDelete(embedId);
    revalidatePath(`/dashboard/${guildId}/embeds`);
    return { success: true };
}
