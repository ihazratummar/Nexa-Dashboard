"use client";

import { useState } from "react";
import { IAutoModerationSettingsFrontend } from "@/models/AutoModerationSettings";
import { updateAutoModGlobal } from "@/lib/actions/automod";
import { ShieldAlert } from "lucide-react";

interface AutoModHeaderProps {
    settings: IAutoModerationSettingsFrontend['global'];
    guildId: string;
}

export default function AutoModHeader({ settings, guildId }: AutoModHeaderProps) {
    const [config, setConfig] = useState(settings);
    const [isSaving, setIsSaving] = useState(false);

    const handleToggle = async (checked: boolean) => {
        const newGlobal = { ...config, is_enabled: checked };
        setConfig(newGlobal);
        setIsSaving(true);
        await updateAutoModGlobal(guildId, newGlobal);
        setIsSaving(false);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl">
                    <ShieldAlert className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Auto Moderation</h1>
                    <p className="text-gray-400">Configure automated moderation rules and filters.</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-300">
                    {config.is_enabled ? "Module Enabled" : "Module Disabled"}
                </span>
                <button
                    onClick={() => handleToggle(!config.is_enabled)}
                    className={`w-14 h-7 rounded-full p-1 transition-colors ${config.is_enabled ? "bg-indigo-500" : "bg-gray-600"
                        }`}
                >
                    <span
                        className={`block w-5 h-5 rounded-full bg-white transition-transform ${config.is_enabled ? "translate-x-7" : "translate-x-0"
                            }`}
                    />
                </button>
            </div>
        </div>
    );
}
