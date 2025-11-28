"use client";

import { useState, useEffect } from "react";
import { IAutoModFilter } from "@/models/AutoModerationSettings";
import { updateAutoModFilter } from "@/lib/actions/automod";
import SearchableMultiSelect from "@/components/dashboard/shared/SearchableMultiSelect";
import { Save, ChevronDown, Shield, Hash, AlertTriangle, Crown, Lock } from "lucide-react";

interface AutoModFilterCardProps {
    filterName: string;
    label: string;
    description: string;
    config: IAutoModFilter;
    roles: { id: string; name: string; color: number; position?: number }[];
    channels: { id: string; name: string; type: number }[];
    guildId: string;
    isPremium?: boolean;
    isGuildPremium: boolean;
    botHighestRolePosition?: number;
}

const ACTIONS = [
    { id: 'block', name: 'Block Message' },
    { id: 'timeout', name: 'Timeout Member' },
    { id: 'mute', name: 'Mute Member' },
    { id: 'warn', name: 'Warn Member' },
    { id: 'kick', name: 'Kick Member' },
    { id: 'ban', name: 'Ban Member' }
];

export default function AutoModFilterCard({
    filterName,
    label,
    description,
    config,
    roles,
    channels,
    guildId,
    isPremium = false,
    isGuildPremium,
    botHighestRolePosition
}: AutoModFilterCardProps) {
    // Define defaults based on filter type
    const getDefaults = (name: string) => {
        const base = { bad_words: [] };
        switch (name) {
            case 'mass_mention': return { ...base, max_mentions: 5 };
            case 'spammed_caps': return { ...base, max_caps_percentage: 70 };
            case 'emoji_spam': return { ...base, max_emojis: 10 };
            case 'ai_moderation': return {
                ...base,
                toxicity_threshold: 80,
                nudity_threshold: 80,
                gore_threshold: 80
            };
            // Add other specific defaults if needed
            default: return base;
        }
    };

    // Merge defaults into config
    const defaultConfig = {
        ...config,
        custom_config: {
            ...getDefaults(filterName),
            ...config.custom_config
        }
    };

    const [settings, setSettings] = useState(defaultConfig);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Local state for bad words input to prevent cursor/comma issues
    const [badWordsInput, setBadWordsInput] = useState(config.custom_config?.bad_words?.join(", ") || "");

    const isLocked = isPremium && !isGuildPremium;

    useEffect(() => {
        setBadWordsInput(config.custom_config?.bad_words?.join(", ") || "");
    }, [config.custom_config?.bad_words]);

    const handleToggle = async (e: React.MouseEvent, checked: boolean) => {
        e.stopPropagation();
        if (isLocked) return;
        const newSettings = { ...settings, enabled: checked };
        setSettings(newSettings);
        setIsSaving(true);
        await updateAutoModFilter(guildId, filterName, newSettings);
        setIsSaving(false);
    };

    const handleChange = (field: keyof IAutoModFilter, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleCustomConfigChange = (field: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            custom_config: {
                ...prev.custom_config,
                [field]: value
            }
        }));
        setHasChanges(true);
    };

    const handleBadWordsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setBadWordsInput(val);
        const words = val.split(",").map(s => s.trim()).filter(Boolean);
        handleCustomConfigChange("bad_words", words);
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSaving(true);
        await updateAutoModFilter(guildId, filterName, settings);
        setIsSaving(false);
        setHasChanges(false);
        setIsExpanded(false);
    };

    return (
        <div
            onClick={() => !isLocked && setIsExpanded(!isExpanded)}
            className={`bg-white/5 border border-white/10 rounded-xl transition-all hover:border-indigo-500/50 ${isLocked ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                } ${isExpanded ? 'ring-1 ring-indigo-500/50' : ''}`}
        >
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium text-white capitalize">{label}</h3>
                            {isPremium && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                                    <Crown className="w-3 h-3" />
                                    PREMIUM
                                </span>
                            )}
                            {isLocked && (
                                <span className="text-xs text-amber-500 flex items-center gap-1 font-bold">
                                    <Lock className="w-3 h-3" />
                                    LOCKED
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-400">{description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div
                        onClick={(e) => handleToggle(e, !settings.enabled)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${isLocked ? 'cursor-not-allowed bg-gray-700' : 'cursor-pointer'
                            } ${!isLocked && settings.enabled ? "bg-indigo-500" : "bg-gray-600"}`}
                    >
                        <span
                            className={`block w-4 h-4 rounded-full bg-white transition-transform ${settings.enabled ? "translate-x-6" : "translate-x-0"
                                }`}
                        />
                    </div>
                </div>
            </div>

            {isExpanded && !isLocked && (
                <div className="p-6 border-t border-white/10 bg-black/20 space-y-6 cursor-default" onClick={(e) => e.stopPropagation()}>

                    {/* Custom Config Fields */}
                    {filterName === 'bad_words' && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bad Words (Comma Separated)</label>
                            <textarea
                                value={badWordsInput}
                                onChange={handleBadWordsChange}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 min-h-[80px]"
                                placeholder="bad, words, here"
                            />
                        </div>
                    )}

                    {filterName === 'mass_mention' && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Max Mentions</label>
                            <input
                                type="number"
                                value={settings.custom_config?.max_mentions ?? 5}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val)) {
                                        handleCustomConfigChange("max_mentions", val);
                                    }
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    )}

                    {filterName === 'spammed_caps' && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Max Caps Percentage (0-100)</label>
                            <input
                                type="number"
                                value={settings.custom_config?.max_caps_percentage ?? 70}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val >= 0 && val <= 100) {
                                        handleCustomConfigChange("max_caps_percentage", val);
                                    }
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    )}

                    {filterName === 'ai_moderation' && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Toxicity Threshold</label>
                                    <span className="text-xs font-mono text-indigo-400">{settings.custom_config?.toxicity_threshold ?? 80}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.custom_config?.toxicity_threshold ?? 80}
                                    onChange={(e) => handleCustomConfigChange("toxicity_threshold", parseInt(e.target.value))}
                                    className="w-full accent-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nudity Threshold</label>
                                    <span className="text-xs font-mono text-indigo-400">{settings.custom_config?.nudity_threshold ?? 80}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.custom_config?.nudity_threshold ?? 80}
                                    onChange={(e) => handleCustomConfigChange("nudity_threshold", parseInt(e.target.value))}
                                    className="w-full accent-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gore Threshold</label>
                                    <span className="text-xs font-mono text-indigo-400">{settings.custom_config?.gore_threshold ?? 80}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={settings.custom_config?.gore_threshold ?? 80}
                                    onChange={(e) => handleCustomConfigChange("gore_threshold", parseInt(e.target.value))}
                                    className="w-full accent-indigo-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {ACTIONS.map(action => (
                                <label key={action.id} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
                                    <input
                                        type="checkbox"
                                        checked={settings.actions.includes(action.id)}
                                        onChange={(e) => {
                                            const newActions = e.target.checked
                                                ? [...settings.actions, action.id]
                                                : settings.actions.filter(a => a !== action.id);
                                            handleChange("actions", newActions);
                                        }}
                                        className="w-4 h-4 accent-indigo-500"
                                    />
                                    <span className="text-sm text-gray-300">{action.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {settings.actions.includes('timeout') && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Timeout Duration (Seconds)</label>
                            <input
                                type="number"
                                value={settings.timeout_duration}
                                onChange={(e) => handleChange("timeout_duration", parseInt(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SearchableMultiSelect
                            label="Ignored Roles"
                            options={roles}
                            value={settings.ignored_roles}
                            onChange={(v) => handleChange("ignored_roles", v)}
                            icon={Shield}
                            placeholder="Select roles..."
                        />
                        <SearchableMultiSelect
                            label="Ignored Channels"
                            options={channels}
                            value={settings.ignored_channels}
                            onChange={(v) => handleChange("ignored_channels", v)}
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
