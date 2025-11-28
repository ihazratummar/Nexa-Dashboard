"use client";

import { useState } from "react";
import { ICommandConfigFrontend } from "@/models/CommandConfig";
import { updateCommandConfig } from "@/lib/actions/commands";
import { Settings, Save, X, ChevronDown, ChevronUp, Hash, Shield, Crown, Lock } from "lucide-react";
import SearchableMultiSelect from "@/components/dashboard/shared/SearchableMultiSelect";

interface CommandCardProps {
    command: ICommandConfigFrontend;
    guildId: string;
    roles: { id: string; name: string; color: number }[];
    channels: { id: string; name: string; type: number }[];
    isGuildPremium: boolean;
}

export default function CommandCard({ command, guildId, roles, channels, isGuildPremium }: CommandCardProps) {
    const [config, setConfig] = useState<ICommandConfigFrontend>(command);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const isLocked = command.is_premium && !isGuildPremium;

    const handleToggle = async (e: React.MouseEvent, checked: boolean) => {
        e.stopPropagation();
        if (isLocked) return;
        const newConfig = { ...config, enabled: checked };
        setConfig(newConfig);
        setIsSaving(true);
        await updateCommandConfig(guildId, command.command, { enabled: checked });
        setIsSaving(false);
    };

    const handleChange = (field: string, value: any) => {
        setConfig(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                [field]: value
            }
        }));
        setHasChanges(true);
    };

    const handleArrayChange = (field: keyof ICommandConfigFrontend, value: string[]) => {
        setConfig(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSaving(true);
        // Save all configurable fields
        await updateCommandConfig(guildId, command.command, {
            settings: config.settings,
            aliases: config.aliases,
            enabled_roles: config.enabled_roles,
            disabled_roles: config.disabled_roles,
            enabled_channels: config.enabled_channels,
            disabled_channels: config.disabled_channels,
            roles_skip_limit: config.roles_skip_limit
        });
        setIsSaving(false);
        setHasChanges(false);
        setIsExpanded(false);
    };

    return (
        <div
            onClick={() => !isLocked && setIsExpanded(!isExpanded)}
            className={`bg-white/5 border border-white/10 rounded-xl overflow-hidden transition-all hover:border-indigo-500/50 ${isLocked ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                } ${isExpanded ? 'ring-1 ring-indigo-500/50' : ''}`}
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg relative">
                        <span className="text-indigo-400 font-mono font-bold">/{command.command}</span>
                        {command.is_premium && (
                            <div className="absolute -top-2 -right-2 bg-amber-500 text-black p-0.5 rounded-full">
                                <Crown className="w-3 h-3" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-400">{command.description || "No description available."}</p>
                            {isLocked && (
                                <span className="text-xs text-amber-500 flex items-center gap-1 font-bold">
                                    <Lock className="w-3 h-3" />
                                    PREMIUM LOCKED
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        disabled={isLocked}
                        className={`px-3 py-1.5 text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 ${isLocked ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <Settings className="w-4 h-4" />
                        Edit
                    </button>

                    {/* Toggle Switch */}
                    <div
                        onClick={(e) => handleToggle(e, !config.enabled)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${isLocked ? 'cursor-not-allowed bg-gray-700' : 'cursor-pointer'
                            } ${!isLocked && config.enabled ? "bg-indigo-500" : "bg-gray-600"}`}
                    >
                        <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${config.enabled ? "translate-x-6" : "translate-x-0"
                                }`}
                        />
                    </div>
                </div>
            </div>

            {/* Expanded Settings */}
            {isExpanded && (
                <div className="p-6 border-t border-white/10 bg-black/20 space-y-6 cursor-default" onClick={(e) => e.stopPropagation()}>

                    {/* Aliases */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">ALIASES</label>
                        <input
                            type="text"
                            placeholder="e.g. av, pfp (comma separated)"
                            value={config.aliases.join(", ")}
                            onChange={(e) => handleArrayChange("aliases", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SearchableMultiSelect
                            label="Enabled Roles"
                            options={roles}
                            value={config.enabled_roles}
                            onChange={(v) => handleArrayChange("enabled_roles", v)}
                            icon={Shield}
                            placeholder="Select roles..."
                        />
                        <SearchableMultiSelect
                            label="Disabled Roles"
                            options={roles}
                            value={config.disabled_roles}
                            onChange={(v) => handleArrayChange("disabled_roles", v)}
                            icon={Shield}
                            placeholder="Select roles..."
                        />
                        <SearchableMultiSelect
                            label="Enabled Channels"
                            options={channels}
                            value={config.enabled_channels}
                            onChange={(v) => handleArrayChange("enabled_channels", v)}
                            icon={Hash}
                            placeholder="Select channels..."
                        />
                        <SearchableMultiSelect
                            label="Disabled Channels"
                            options={channels}
                            value={config.disabled_channels}
                            onChange={(v) => handleArrayChange("disabled_channels", v)}
                            icon={Hash}
                            placeholder="Select channels..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SearchableMultiSelect
                            label="Roles Skip Limit"
                            options={roles}
                            value={config.roles_skip_limit}
                            onChange={(v) => handleArrayChange("roles_skip_limit", v)}
                            icon={Shield}
                            placeholder="Select roles..."
                        />
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Max Uses (Rate Limit)</label>
                            <input
                                type="number"
                                value={config.settings.max_limit}
                                onChange={(e) => handleChange("max_limit", parseInt(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-sm text-gray-300">Auto-delete user's command</span>
                            <input
                                type="checkbox"
                                checked={config.settings.auto_delete_invocation}
                                onChange={(e) => handleChange("auto_delete_invocation", e.target.checked)}
                                className="w-4 h-4 accent-indigo-500"
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                            <span className="text-sm text-gray-300">Auto-delete bot's response</span>
                            <input
                                type="checkbox"
                                checked={config.settings.auto_delete_response}
                                onChange={(e) => handleChange("auto_delete_response", e.target.checked)}
                                className="w-4 h-4 accent-indigo-500"
                            />
                        </div>
                        {config.settings.auto_delete_response && (
                            <div className="space-y-2 pl-4">
                                <label className="text-sm text-gray-400">Response Delete Delay (s)</label>
                                <input
                                    type="number"
                                    value={config.settings.response_delete_delay}
                                    onChange={(e) => handleChange("response_delete_delay", parseInt(e.target.value))}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
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
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
