"use client";

import { useState, useEffect } from "react";
import { IAutoModerationSettingsFrontend } from "@/models/AutoModerationSettings";
import { updateAutoModRules } from "@/lib/actions/automod";
import { Plus, Trash2, AlertTriangle, Save, Clock, Gavel } from "lucide-react";

interface AutoModRulesCardProps {
    rules: { threshold: number; action: string; duration?: number }[];
    guildId: string;
}

const ACTIONS = [
    { id: 'timeout', name: 'Timeout Member' },
    { id: 'kick', name: 'Kick Member' },
    { id: 'ban', name: 'Ban Member' }
];

export default function AutoModRulesCard({ rules, guildId }: AutoModRulesCardProps) {
    const [currentRules, setCurrentRules] = useState(rules || []);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Sync state with props when they change (e.g. after save/revalidate)
    useEffect(() => {
        setCurrentRules(rules || []);
    }, [rules]);

    // New rule state
    const [newThreshold, setNewThreshold] = useState(3);
    const [newAction, setNewAction] = useState('timeout');
    const [newDuration, setNewDuration] = useState(3600);

    const handleAddRule = () => {
        const newRule = {
            threshold: newThreshold,
            action: newAction,
            duration: newAction === 'timeout' ? newDuration : undefined
        };
        setCurrentRules([...currentRules, newRule].sort((a, b) => a.threshold - b.threshold));
        setHasChanges(true);
    };

    const handleDeleteRule = (index: number) => {
        const newRules = currentRules.filter((_, i) => i !== index);
        setCurrentRules(newRules);
        setHasChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        await updateAutoModRules(guildId, currentRules);
        setIsSaving(false);
        setHasChanges(false);
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl mb-8">
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl">
                        <AlertTriangle className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Warning Rules</h2>
                        <p className="text-gray-400">Configure actions based on warning counts.</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Add New Rule */}
                <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Add New Rule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400">Warnings Threshold</label>
                            <input
                                type="number"
                                min="1"
                                value={newThreshold}
                                onChange={(e) => setNewThreshold(parseInt(e.target.value))}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400">Action</label>
                            <select
                                value={newAction}
                                onChange={(e) => setNewAction(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                            >
                                {ACTIONS.map(action => (
                                    <option key={action.id} value={action.id}>{action.name}</option>
                                ))}
                            </select>
                        </div>
                        {newAction === 'timeout' && (
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400">Duration (Seconds)</label>
                                <input
                                    type="number"
                                    min="60"
                                    value={newDuration}
                                    onChange={(e) => setNewDuration(parseInt(e.target.value))}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                        )}
                        <button
                            onClick={handleAddRule}
                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors h-[42px]"
                        >
                            <Plus className="w-4 h-4" />
                            Add Rule
                        </button>
                    </div>
                </div>

                {/* Rules List */}
                <div className="space-y-2">
                    {currentRules.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No warning rules configured.
                        </div>
                    ) : (
                        currentRules.map((rule, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                                        {rule.threshold}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-white font-medium flex items-center gap-2">
                                            <Gavel className="w-4 h-4 text-gray-400" />
                                            {ACTIONS.find(a => a.id === rule.action)?.name || rule.action}
                                        </span>
                                        {rule.duration && (
                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {rule.duration} seconds
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteRule(index)}
                                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-white/10">
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
                                Save Rules
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
