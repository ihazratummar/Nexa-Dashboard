import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export interface DiscordGuild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: number;
    features: string[];
    approximate_member_count?: number;
}

export async function getMutualGuilds(accessToken: string) {
    const res = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!res.ok) {
        console.error("Failed to fetch user guilds", await res.text());
        return [];
    }

    const guilds: DiscordGuild[] = await res.json();
    return guilds.filter((guild) => (guild.permissions & 0x20) === 0x20);
}

export async function getBotGuilds() {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) return [];

    const res = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: {
            Authorization: `Bot ${botToken}`,
        },
        next: { revalidate: 300 },
    });

    if (!res.ok) {
        console.error("Failed to fetch bot guilds", await res.text());
        return [];
    }

    const guilds: DiscordGuild[] = await res.json();
    return guilds.map(g => g.id);
}

export async function getActiveGuilds() {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) return [];

    const [userGuilds, botGuildIds] = await Promise.all([
        getMutualGuilds(session.accessToken),
        getBotGuilds(),
    ]);

    return userGuilds.filter(g => botGuildIds.includes(g.id));
}

export async function getGuildDetails(guildId: string) {
    const botToken = process.env.DISCORD_BOT_TOKEN;
    if (!botToken) return null;

    const res = await fetch(`https://discord.com/api/guilds/${guildId}?with_counts=true`, {
        headers: {
            Authorization: `Bot ${botToken}`,
        },
        next: { revalidate: 300 },
    });

    if (!res.ok) {
        console.error(`Failed to fetch guild details for ${guildId}`, await res.text());
        return null;
    }

    return res.json();
}
