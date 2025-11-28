import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EmbedPreviewProps {
    embed: any;
    guildData?: {
        name: string;
        icon: string | null;
        memberCount: number;
    };
    userData?: {
        username: string;
        avatar: string | null;
    };
}

function replaceVariables(text: string, guildData?: any, userData?: any): string {
    if (!text) return "";

    const replacements: { [key: string]: string } = {
        "{user}": userData ? `@${userData.username}` : "@User",
        "{username}": userData?.username || "User",
        "{avatar}": userData?.avatar || "",
        "{server}": guildData?.name || "Server",
        "{server_icon}": guildData?.icon || "",
        "{member_count}": guildData?.memberCount?.toLocaleString() || "0",
    };

    let result = text;
    Object.entries(replacements).forEach(([key, value]) => {
        result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    return result.replace(/\\n/g, "\n");
}

export function EmbedPreview({ embed, guildData, userData }: EmbedPreviewProps) {
    if (!embed) return null;

    // Debug logging
    console.log("EmbedPreview - guildData:", guildData);
    console.log("EmbedPreview - userData:", userData);
    console.log("EmbedPreview - embed:", embed);

    const processedEmbed = {
        ...embed,
        title: replaceVariables(embed.title, guildData, userData),
        description: replaceVariables(embed.description, guildData, userData),
        thumbnail: replaceVariables(embed.thumbnail, guildData, userData),
        image: replaceVariables(embed.image, guildData, userData),
        footer: embed.footer ? {
            text: replaceVariables(embed.footer.text, guildData, userData),
            icon_url: replaceVariables(embed.footer.icon_url, guildData, userData),
        } : undefined,
        fields: embed.fields?.map((field: any) => ({
            ...field,
            name: replaceVariables(field.name, guildData, userData),
            value: replaceVariables(field.value, guildData, userData),
        })),
    };

    return (
        <div className="bg-[#2b2d31] p-4 rounded-lg max-w-[500px] font-sans text-gray-100 shadow-2xl transition-all duration-200">
            <div className="flex gap-3">
                {/* Side Color Bar */}
                <div
                    className="w-1 rounded-l-full shrink-0 transition-colors duration-200"
                    style={{ backgroundColor: processedEmbed.color || '#5865F2' }}
                />

                <div className="flex-1 min-w-0">
                    {/* Author */}
                    {processedEmbed.author?.name && (
                        <div className="flex items-center gap-2 mb-2">
                            {processedEmbed.author.icon_url && (
                                <img
                                    src={processedEmbed.author.icon_url}
                                    alt=""
                                    className="w-6 h-6 rounded-full object-cover"
                                />
                            )}
                            <span className="font-bold text-sm">{processedEmbed.author.name}</span>
                        </div>
                    )}

                    {/* Title */}
                    {processedEmbed.title && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="font-bold text-base mb-2 text-white"
                        >
                            {processedEmbed.title}
                        </motion.div>
                    )}

                    {/* Description */}
                    {processedEmbed.description && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm text-gray-300 whitespace-pre-wrap mb-4 leading-relaxed"
                        >
                            {processedEmbed.description}
                        </motion.div>
                    )}

                    {/* Fields */}
                    {processedEmbed.fields && processedEmbed.fields.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="grid grid-cols-12 gap-2 mb-4"
                        >
                            {processedEmbed.fields.map((field: any, i: number) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + (i * 0.05) }}
                                    className={cn(
                                        "col-span-12",
                                        field.inline && "col-span-4"
                                    )}
                                >
                                    <div className="font-bold text-sm text-white mb-1">{field.name}</div>
                                    <div className="text-sm text-gray-300 whitespace-pre-wrap">{field.value}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Image */}
                    {processedEmbed.image && processedEmbed.image.startsWith("http") && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mb-4"
                        >
                            <img
                                src={processedEmbed.image}
                                alt="Embed Image"
                                className="rounded-lg max-w-full max-h-[300px] object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </motion.div>
                    )}

                    {/* Footer */}
                    {(processedEmbed.footer?.text || processedEmbed.timestamp) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex items-center gap-2 text-xs text-gray-400 mt-2"
                        >
                            {processedEmbed.footer?.icon_url && processedEmbed.footer.icon_url.startsWith("http") && (
                                <img
                                    src={processedEmbed.footer.icon_url}
                                    alt=""
                                    className="w-5 h-5 rounded-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            )}
                            <span>
                                {processedEmbed.footer?.text}
                                {processedEmbed.footer?.text && processedEmbed.timestamp && " • "}
                                {processedEmbed.timestamp && "Today at 12:00 PM"}
                            </span>
                        </motion.div>
                    )}
                </div>

                {/* Thumbnail (Right side) */}
                {processedEmbed.thumbnail && processedEmbed.thumbnail.startsWith("http") && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="shrink-0 ml-4"
                    >
                        <img
                            src={processedEmbed.thumbnail}
                            alt="Thumbnail"
                            className="w-20 h-20 rounded-lg object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </motion.div>
                )}
            </div>
        </div>
    );
}
