import { FileCode } from "lucide-react";
import { EmbedManager } from "@/components/dashboard/embeds/EmbedManager";
import { getEmbeds } from "@/lib/actions/embeds";

export default async function EmbedsPage({ params }: { params: Promise<{ guildId: string }> }) {
    const { guildId } = await params;
    const embeds = await getEmbeds(guildId);

    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                    <FileCode className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Embed Builder</h1>
                    <p className="text-gray-400">Create and manage custom Discord embeds for your server.</p>
                </div>
            </div>

            <EmbedManager guildId={guildId} initialEmbeds={embeds} />
        </div>
    );
}
