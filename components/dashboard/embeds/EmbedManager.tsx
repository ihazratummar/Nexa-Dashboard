"use client";

import { useState, useEffect } from "react";
import { EmbedForm } from "./EmbedForm";
import { EmbedPreview } from "./EmbedPreview";
import { Button } from "@/components/ui/button";
import { saveEmbed, deleteEmbed } from "@/lib/actions/embeds";
import { getGuildDetails } from "@/lib/actions/guild";
import { Plus, Save, Trash2, Eye, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";

interface EmbedManagerProps {
    guildId: string;
    initialEmbeds: any[];
}

export function EmbedManager({ guildId, initialEmbeds }: EmbedManagerProps) {
    const { data: session } = useSession();
    const [embeds, setEmbeds] = useState(initialEmbeds);
    const [selectedEmbed, setSelectedEmbed] = useState<any>(null);
    const [currentEmbed, setCurrentEmbed] = useState<any>({
        name: "",
        title: "",
        description: "",
        color: "#5865F2",
        fields: [],
        footer: { text: "", icon_url: "" }
    });
    const [isSaving, setIsSaving] = useState(false);
    const [guildData, setGuildData] = useState<any>(null);

    // Fetch guild data for preview
    useEffect(() => {
        async function fetchGuildData() {
            try {
                const data = await getGuildDetails(guildId);
                if (data) {
                    setGuildData(data);
                }
            } catch (error) {
                console.error("Failed to fetch guild data:", error);
            }
        }

        fetchGuildData();
    }, [guildId]);

    const userData = session?.user ? {
        username: session.user.name || "User",
        avatar: session.user.image || null,
    } : undefined;

    const handleNew = () => {
        setSelectedEmbed(null);
        setCurrentEmbed({
            name: "",
            title: "",
            description: "",
            color: "#5865F2",
            fields: [],
            footer: { text: "", icon_url: "" }
        });
    };

    const handleSelect = (embed: any) => {
        setSelectedEmbed(embed);
        setCurrentEmbed({ ...embed });
    };

    const handleSave = async () => {
        if (!currentEmbed.name) {
            alert("Please enter a preset name");
            return;
        }

        setIsSaving(true);
        try {
            await saveEmbed(guildId, currentEmbed);

            if (selectedEmbed) {
                setEmbeds(embeds.map(e => e._id === currentEmbed._id ? currentEmbed : e));
            } else {
                setEmbeds([...embeds, currentEmbed]);
            }

            alert("Embed saved successfully!");
        } catch (error) {
            console.error("Failed to save embed:", error);
            alert("Failed to save embed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (embedId: string) => {
        if (!confirm("Are you sure you want to delete this embed?")) return;

        try {
            await deleteEmbed(guildId, embedId);
            setEmbeds(embeds.filter(e => e._id !== embedId));
            if (selectedEmbed?._id === embedId) {
                handleNew();
            }
            alert("Embed deleted successfully!");
        } catch (error) {
            console.error("Failed to delete embed:", error);
            alert("Failed to delete embed");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar - Embed List */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-3 space-y-4"
            >
                <Button onClick={handleNew} className="w-full group">
                    <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                    New Embed
                </Button>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                    <AnimatePresence>
                        {embeds.map((embed, index) => (
                            <motion.div
                                key={embed._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: index * 0.05 }}
                                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 group ${selectedEmbed?._id === embed._id
                                    ? "bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/20"
                                    : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                    }`}
                                onClick={() => handleSelect(embed)}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <div
                                            className="w-3 h-3 rounded-full shrink-0"
                                            style={{ backgroundColor: embed.color || '#5865F2' }}
                                        />
                                        <span className="font-medium truncate">{embed.name}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(embed._id);
                                        }}
                                        className="text-red-400 hover:text-red-300 hover:scale-110 transition-all p-1 rounded hover:bg-red-500/10"
                                        title="Delete embed"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {embeds.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-gray-400 text-sm text-center py-12"
                        >
                            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No embeds yet.</p>
                            <p className="text-xs mt-1">Create your first one!</p>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Main Editor */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-6 space-y-6"
            >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            {selectedEmbed ? "Edit Embed" : "New Embed"}
                            {selectedEmbed && <Sparkles className="w-5 h-5 text-indigo-400" />}
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {selectedEmbed ? "Modify your embed preset" : "Create a new embed preset"}
                        </p>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </div>

                <EmbedForm embed={currentEmbed} onChange={setCurrentEmbed} />
            </motion.div>

            {/* Preview */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-3"
            >
                <div className="lg:sticky lg:top-8 space-y-4">
                    <div className="flex items-center gap-2">
                        <Eye className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-semibold">Live Preview</h3>
                    </div>
                    <div className="bg-[#36393f] p-4 rounded-xl border border-white/10">
                        <EmbedPreview
                            embed={currentEmbed}
                            guildData={guildData}
                            userData={userData}
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
