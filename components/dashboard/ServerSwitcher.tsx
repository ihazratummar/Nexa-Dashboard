import Link from "next/link";
import { getActiveGuilds } from "@/lib/discord";
import { cn } from "@/lib/utils";

export async function ServerSwitcher({ currentGuildId }: { currentGuildId?: string }) {
    const guilds = await getActiveGuilds();

    return (
        <div className="hidden lg:flex w-[72px] bg-black/40 border-r border-white/10 flex-col items-center py-4 gap-4 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide">
            {guilds.map((guild) => (
                <Link
                    key={guild.id}
                    href={`/dashboard/${guild.id}`}
                    className="relative group"
                >
                    {guild.icon ? (
                        <img
                            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                            alt={guild.name}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
                            {guild.name.charAt(0)}
                        </div>
                    )}
                    {currentGuildId === guild.id && (
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
                    )}

                    {/* Tooltip */}
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 bg-black rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {guild.name}
                    </div>
                </Link>
            ))}
        </div>
    );
}
