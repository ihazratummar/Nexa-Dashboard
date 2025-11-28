"use client";

import { useState } from "react";
import { IModerationSettingsFrontend } from "@/models/ModerationSettings";
import { updateModerationSettings } from "@/lib/actions/moderation";
import SearchableMultiSelect from "@/components/dashboard/shared/SearchableMultiSelect";
import { Shield, Save } from "lucide-react";

interface ModerationHeaderProps {
    settings: IModerationSettingsFrontend;
    roles: { id: string; name: string; color: number; position?: number }[];
    guildId: string;
    botHighestRolePosition?: number;
}

export default function ModerationHeader({ settings, roles, guildId, botHighestRolePosition }: ModerationHeaderProps) {
    const [config, setConfig] = useState(settings);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const handleToggle = async (checked: boolean) => {
        const newConfig = { ...config, is_moderation_settings_enabled: checked };
        setConfig(newConfig);
        setIsSaving(true);
        await updateModerationSettings(guildId, { is_moderation_settings_enabled: checked });
        setIsSaving(false);
    };

    const handleRolesChange = (newRoles: string[]) => {
        setConfig(prev => ({ ...prev, mode_roles: newRoles }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        await updateModerationSettings(guildId, { mode_roles: config.mode_roles });
        setIsSaving(false);
        setHasChanges(false);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <Shield className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Moderation</h1>
                        <p className="text-gray-400">Configure moderation tools and permissions.</p>
                    </div>
                </div>

                {/* Global Toggle */}
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-300">
                        {config.is_moderation_settings_enabled ? "Module Enabled" : "Module Disabled"}
                    </span>
                    <button
                        onClick={() => handleToggle(!config.is_moderation_settings_enabled)}
                        className={`w-14 h-7 rounded-full p-1 transition-colors ${config.is_moderation_settings_enabled ? "bg-indigo-500" : "bg-gray-600"
                            }`}
                    >
                        <span
                            className={`block w-5 h-5 rounded-full bg-white transition-transform ${config.is_moderation_settings_enabled ? "translate-x-7" : "translate-x-0"
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* Moderator Roles */}
            <div className="pt-6 border-t border-white/10">
                <div className="flex items-end gap-4">
                    <div className="flex-1">
                        <SearchableMultiSelect
                            label="Moderator Roles (Access to all mod commands)"
                            options={roles}
                            value={config.mode_roles}
                            onChange={handleRolesChange}
                            icon={Shield}
                            placeholder="Select moderator roles..."
                            botHighestRolePosition={botHighestRolePosition}
                        />
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className={`px-4 py-2.5 mb-0.5 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${hasChanges
                            ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        {isSaving ? "Saving..." : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Roles
                            </>
                        )}
                    </button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                    Roles selected here will bypass individual command permissions for moderation commands.
                </p>
            </div>
        </div>
    );
}
