"use client";

import { useState } from "react";
import { IAutoModerationSettingsFrontend } from "@/models/AutoModerationSettings";
import { updateAutoModGlobal } from "@/lib/actions/automod";
import SearchableMultiSelect from "@/components/dashboard/shared/SearchableMultiSelect";
import { Settings, Save, Shield, Hash } from "lucide-react";

interface AutoModGlobalSettingsProps {
    settings: IAutoModerationSettingsFrontend['global'];
    roles: { id: string; name: string; color: number; position?: number }[];
    channels: { id: string; name: string; type: number }[];
    guildId: string;
    botHighestRolePosition?: number;
}

export default function AutoModGlobalSettings({ settings, roles, channels, guildId, botHighestRolePosition }: AutoModGlobalSettingsProps) {
    const [config, setConfig] = useState(settings);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleArrayChange = (field: keyof typeof config, value: string[]) => {
        setConfig(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSingleChange = (field: keyof typeof config, value: string) => {
        setConfig(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        await updateAutoModGlobal(guildId, config);
        setIsSaving(false);
        setHasChanges(false);
        setIsExpanded(false);
    };


    return (
        <div className="bg-white/5 border border-white/10 rounded-xl mb-8">
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <Settings className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Global Settings</h2>
                        <p className="text-gray-400">Configure global ignores and channel restrictions.</p>
                    </div>
                </div>

                <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                </div>
            </div>

            {isExpanded && (
                <div className="p-6 border-t border-white/10 space-y-6 bg-black/20">
                    {/* Auto Role Removed as per request */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SearchableMultiSelect
                            label="Global Ignored Channels"
                            options={channels}
                            value={config.ignored_channels}
                            onChange={(v) => handleArrayChange("ignored_channels", v)}
                            icon={Hash}
                            placeholder="Select channels..."
                        />
                        <SearchableMultiSelect
                            label="Global Ignored Roles"
                            options={roles}
                            value={config.ignored_roles}
                            onChange={(v) => handleArrayChange("ignored_roles", v)}
                            icon={Shield}
                            placeholder="Select roles..."
                            botHighestRolePosition={botHighestRolePosition}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SearchableMultiSelect
                            label="Media Only Channels"
                            options={channels}
                            value={config.media_only_channels}
                            onChange={(v) => handleArrayChange("media_only_channels", v)}
                            icon={Hash}
                            placeholder="Select channels..."
                        />
                        <SearchableMultiSelect
                            label="YouTube Only Channels"
                            options={channels}
                            value={config.youtube_only_channels}
                            onChange={(v) => handleArrayChange("youtube_only_channels", v)}
                            icon={Hash}
                            placeholder="Select channels..."
                        />
                        <SearchableMultiSelect
                            label="Twitch Only Channels"
                            options={channels}
                            value={config.twitch_only_channels}
                            onChange={(v) => handleArrayChange("twitch_only_channels", v)}
                            icon={Hash}
                            placeholder="Select channels..."
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges || isSaving}
                            className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${hasChanges
                                ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                                : "bg-gray-700 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            {isSaving ? "Saving..." : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Global Settings
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function ChevronDown({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    )
}
