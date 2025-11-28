"use server";

export async function getGuildDetails(guildId: string) {
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!botToken) {
        return null;
    }

    try {
        const response = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}?with_counts=true`,
            {
                headers: {
                    Authorization: `Bot ${botToken}`,
                },
                next: { revalidate: 300 }, // Cache for 5 minutes
            }
        );

        if (!response.ok) {
            console.error("Failed to fetch guild details:", await response.text());
            return null;
        }

        const data = await response.json();

        return {
            name: data.name,
            icon: data.icon
                ? `https://cdn.discordapp.com/icons/${guildId}/${data.icon}.png`
                : null,
            memberCount: data.approximate_member_count || 0,
        };
    } catch (error) {
        console.error("Error fetching guild details:", error);
        return null;
    }
}

export async function getGuildRoles(guildId: string) {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) return [];

    try {
        const response = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}/roles`,
            {
                headers: { Authorization: `Bot ${botToken}` },
                next: { revalidate: 300 }
            }
        );

        if (!response.ok) return [];
        const roles = await response.json();
        return roles.map((r: any) => ({
            id: r.id,
            name: r.name,
            color: r.color,
            position: r.position,
            managed: r.managed
        }));
    } catch (error) {
        console.error("Error fetching roles:", error);
        return [];
    }
}

export async function getBotHighestRolePosition(guildId: string) {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) return 0;

    try {
        // 1. Get Bot User ID
        const meRes = await fetch("https://discord.com/api/v10/users/@me", {
            headers: { Authorization: `Bot ${botToken}` },
            next: { revalidate: 3600 }
        });
        if (!meRes.ok) return 0;
        const botUser = await meRes.json();

        // 2. Get Bot Member in Guild
        const memberRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${botUser.id}`, {
            headers: { Authorization: `Bot ${botToken}` },
            next: { revalidate: 60 }
        });
        if (!memberRes.ok) return 0;
        const member = await memberRes.json();

        // 3. Get All Roles
        const rolesRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
            headers: { Authorization: `Bot ${botToken}` },
            next: { revalidate: 300 }
        });
        if (!rolesRes.ok) return 0;
        const allRoles = await rolesRes.json();

        // 4. Find highest position
        const botRoleIds = member.roles;
        let highestPosition = 0;

        for (const role of allRoles) {
            if (botRoleIds.includes(role.id)) {
                if (role.position > highestPosition) {
                    highestPosition = role.position;
                }
            }
        }

        return highestPosition;
    } catch (error) {
        console.error("Error getting bot highest role:", error);
        return 0;
    }
}

export async function getGuildChannels(guildId: string) {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) return [];

    try {
        const response = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}/channels`,
            {
                headers: { Authorization: `Bot ${botToken}` },
                next: { revalidate: 300 }
            }
        );

        if (!response.ok) return [];
        const channels = await response.json();
        // Return all channels so we can filter/count them in the UI or service layer
        return channels.map((c: any) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            parent_id: c.parent_id
        }));
    } catch (error) {
        console.error("Error fetching channels:", error);
        return [];
    }
}

import connectToDatabase from "@/lib/db";
import GuildSettings from "@/models/GuildSettings";
import User from "@/models/User";

export async function getGuildSettings(guildId: string) {
    await connectToDatabase();

    let settings = await GuildSettings.findOne({ guild_id: guildId }).lean();

    // Check if any premium user has assigned their subscription to this guild
    const premiumUser = await User.findOne({
        premium_guild_id: guildId,
        is_premium: true
    }).lean();

    const isEffectivePremium = !!(settings?.is_premium || premiumUser);

    if (!settings) {
        // Create default settings if not exists
        settings = await GuildSettings.create({
            guild_id: guildId,
            is_premium: false,
            channels: {}
        });
        settings = JSON.parse(JSON.stringify(settings));
    } else {
        settings = JSON.parse(JSON.stringify(settings));
    }

    // Override is_premium with the effective value
    return {
        ...settings,
        is_premium: isEffectivePremium
    };
}
