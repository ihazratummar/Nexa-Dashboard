"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EmbedFormProps {
    embed: any;
    onChange: (embed: any) => void;
}

const COLOR_PRESETS = [
    { name: "Discord", color: "#5865F2" },
    { name: "Success", color: "#57F287" },
    { name: "Warning", color: "#FEE75C" },
    { name: "Danger", color: "#ED4245" },
    { name: "Blurple", color: "#7289DA" },
    { name: "Purple", color: "#9B59B6" },
    { name: "Pink", color: "#E91E63" },
    { name: "Orange", color: "#FF9800" },
];

const VARIABLES = [
    { name: "{user}", description: "User mention" },
    { name: "{username}", description: "Display name" },
    { name: "{avatar}", description: "User avatar URL" },
    { name: "{server}", description: "Server name" },
    { name: "{server_icon}", description: "Server icon URL" },
    { name: "{member_count}", description: "Total members" },
];

export function EmbedForm({ embed, onChange }: EmbedFormProps) {
    const [showColorPresets, setShowColorPresets] = useState(false);
    const [autocomplete, setAutocomplete] = useState<{
        show: boolean;
        field: string;
        position: { top: number; left: number };
        selectedIndex: number;
        suggestions: typeof VARIABLES;
    }>({ show: false, field: "", position: { top: 0, left: 0 }, selectedIndex: 0, suggestions: [] });

    const inputRefs = useRef<{ [key: string]: HTMLInputElement | HTMLTextAreaElement | null }>({});

    const updateField = (field: string, value: any) => {
        onChange({ ...embed, [field]: value });
    };

    const handleInputChange = (field: string, value: string, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateField(field, value);
        checkForAutocomplete(field, value, e.target);
    };

    const checkForAutocomplete = (field: string, value: string, target: HTMLInputElement | HTMLTextAreaElement) => {
        const cursorPos = target.selectionStart || 0;
        const textBeforeCursor = value.substring(0, cursorPos);
        const lastBraceIndex = textBeforeCursor.lastIndexOf("{");

        if (lastBraceIndex !== -1) {
            const textAfterBrace = textBeforeCursor.substring(lastBraceIndex + 1);

            // Only show if there's no closing brace yet
            if (!textAfterBrace.includes("}")) {
                const filtered = VARIABLES.filter(v =>
                    v.name.toLowerCase().includes(("{" + textAfterBrace).toLowerCase())
                );

                if (filtered.length > 0) {
                    // Get cursor position for dropdown
                    const rect = target.getBoundingClientRect();
                    const position = {
                        top: rect.bottom + window.scrollY + 5,
                        left: rect.left + window.scrollX,
                    };

                    setAutocomplete({
                        show: true,
                        field,
                        position,
                        selectedIndex: 0,
                        suggestions: filtered,
                    });
                    return;
                }
            }
        }

        setAutocomplete({ show: false, field: "", position: { top: 0, left: 0 }, selectedIndex: 0, suggestions: [] });
    };

    const insertVariable = (variable: string) => {
        const target = inputRefs.current[autocomplete.field];
        if (!target) return;

        const value = embed[autocomplete.field] || "";
        const cursorPos = target.selectionStart || 0;
        const textBeforeCursor = value.substring(0, cursorPos);
        const textAfterCursor = value.substring(cursorPos);
        const lastBraceIndex = textBeforeCursor.lastIndexOf("{");

        const newValue =
            value.substring(0, lastBraceIndex) +
            variable +
            textAfterCursor;

        updateField(autocomplete.field, newValue);
        setAutocomplete({ show: false, field: "", position: { top: 0, left: 0 }, selectedIndex: 0, suggestions: [] });

        // Set cursor position after variable
        setTimeout(() => {
            const newCursorPos = lastBraceIndex + variable.length;
            target.setSelectionRange(newCursorPos, newCursorPos);
            target.focus();
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
        if (!autocomplete.show) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setAutocomplete(prev => ({
                ...prev,
                selectedIndex: (prev.selectedIndex + 1) % prev.suggestions.length,
            }));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setAutocomplete(prev => ({
                ...prev,
                selectedIndex: prev.selectedIndex === 0 ? prev.suggestions.length - 1 : prev.selectedIndex - 1,
            }));
        } else if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            insertVariable(autocomplete.suggestions[autocomplete.selectedIndex].name);
        } else if (e.key === "Escape") {
            e.preventDefault();
            setAutocomplete({ show: false, field: "", position: { top: 0, left: 0 }, selectedIndex: 0, suggestions: [] });
        }
    };

    const addField = () => {
        const fields = embed.fields || [];
        onChange({ ...embed, fields: [...fields, { name: "", value: "", inline: false }] });
    };

    const updateFieldAt = (index: number, field: string, value: any) => {
        const fields = [...(embed.fields || [])];
        fields[index] = { ...fields[index], [field]: value };
        onChange({ ...embed, fields });
    };

    const removeField = (index: number) => {
        const fields = [...(embed.fields || [])];
        fields.splice(index, 1);
        onChange({ ...embed, fields });
    };

    return (
        <div className="space-y-6 relative" suppressHydrationWarning>
            {/* Autocomplete Dropdown */}
            <AnimatePresence>
                {autocomplete.show && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed z-50 bg-[#1a1a1a] border border-white/20 rounded-lg shadow-2xl p-2 min-w-[280px]"
                        style={{
                            top: `${autocomplete.position.top}px`,
                            left: `${autocomplete.position.left}px`,
                        }}
                    >
                        <div className="text-xs text-gray-400 px-2 py-1 mb-1">
                            Insert Variable <kbd className="ml-2 px-1 bg-white/10 rounded text-[10px]">Tab</kbd> or <kbd className="px-1 bg-white/10 rounded text-[10px]">Enter</kbd>
                        </div>
                        {autocomplete.suggestions.map((variable, index) => (
                            <button
                                key={variable.name}
                                onClick={() => insertVariable(variable.name)}
                                className={`w-full text-left px-3 py-2 rounded flex items-center justify-between group transition-colors ${index === autocomplete.selectedIndex
                                    ? "bg-indigo-500/20 border border-indigo-500/40"
                                    : "hover:bg-white/10"
                                    }`}
                            >
                                <div>
                                    <div className="font-mono text-sm text-indigo-400">{variable.name}</div>
                                    <div className="text-xs text-gray-400">{variable.description}</div>
                                </div>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Basic Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 p-6 bg-white/5 rounded-xl border border-white/10"
            >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="w-1 h-6 bg-indigo-500 rounded-full" />
                    Basic Information
                </h3>

                <div>
                    <label className="block text-sm font-medium mb-2">Preset Name *</label>
                    <input
                        type="text"
                        value={embed.name || ""}
                        onChange={(e) => updateField("name", e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="my-awesome-embed"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Title
                        <span className="text-xs text-gray-400 ml-2">Type &quot;&#123;&quot; for variables</span>
                    </label>
                    <input
                        ref={(el) => { inputRefs.current["title"] = el; }}
                        type="text"
                        value={embed.title || ""}
                        onChange={(e) => handleInputChange("title", e.target.value, e)}
                        onKeyDown={(e) => handleKeyDown(e, "title")}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="✨ Welcome {username}!"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Description
                        <span className="text-xs text-gray-400 ml-2">Type &quot;&#123;&quot; for variables</span>
                    </label>
                    <textarea
                        ref={(el) => { inputRefs.current["description"] = el; }}
                        value={embed.description || ""}
                        onChange={(e) => handleInputChange("description", e.target.value, e)}
                        onKeyDown={(e) => handleKeyDown(e, "description")}
                        rows={4}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                        placeholder="Welcome to {server}! We now have {member_count} members."
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Use <code className="bg-white/10 px-1 rounded">\n</code> for line breaks
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Color
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={embed.color || "#5865F2"}
                            onChange={(e) => updateField("color", e.target.value)}
                            className="w-16 h-12 bg-white/5 border border-white/10 rounded-lg cursor-pointer"
                        />
                        <input
                            type="text"
                            value={embed.color || "#5865F2"}
                            onChange={(e) => updateField("color", e.target.value)}
                            className="flex-1 px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            placeholder="#5865F2"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowColorPresets(!showColorPresets)}
                            className="px-4"
                        >
                            Presets
                        </Button>
                    </div>

                    {showColorPresets && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-4 gap-2 mt-3"
                        >
                            {COLOR_PRESETS.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => {
                                        updateField("color", preset.color);
                                        setShowColorPresets(false);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all group"
                                >
                                    <div
                                        className="w-4 h-4 rounded-full ring-2 ring-white/20 group-hover:ring-white/40 transition-all"
                                        style={{ backgroundColor: preset.color }}
                                    />
                                    <span className="text-xs">{preset.name}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Images */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4 p-6 bg-white/5 rounded-xl border border-white/10"
            >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="w-1 h-6 bg-purple-500 rounded-full" />
                    Images
                </h3>

                <div>
                    <label className="block text-sm font-medium mb-2">Thumbnail URL</label>
                    <input
                        type="url"
                        value={embed.thumbnail || ""}
                        onChange={(e) => updateField("thumbnail", e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="https://example.com/image.png or {server_icon}"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Image URL</label>
                    <input
                        type="url"
                        value={embed.image || ""}
                        onChange={(e) => updateField("image", e.target.value)}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="https://example.com/banner.png"
                    />
                </div>
            </motion.div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4 p-6 bg-white/5 rounded-xl border border-white/10"
            >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <span className="w-1 h-6 bg-green-500 rounded-full" />
                    Footer
                </h3>

                <div>
                    <label className="block text-sm font-medium mb-2">Footer Text</label>
                    <input
                        ref={(el) => { inputRefs.current["footer.text"] = el; }}
                        type="text"
                        value={embed.footer?.text || ""}
                        onChange={(e) => {
                            updateField("footer", { ...embed.footer, text: e.target.value });
                            checkForAutocomplete("footer.text", e.target.value, e.target);
                        }}
                        onKeyDown={(e) => handleKeyDown(e, "footer.text")}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="Powered by {server}"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Footer Icon URL</label>
                    <input
                        type="url"
                        value={embed.footer?.icon_url || ""}
                        onChange={(e) => updateField("footer", { ...embed.footer, icon_url: e.target.value })}
                        className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        placeholder="https://example.com/icon.png or {avatar}"
                    />
                </div>
            </motion.div>

            {/* Fields */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4 p-6 bg-white/5 rounded-xl border border-white/10"
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span className="w-1 h-6 bg-yellow-500 rounded-full" />
                        Fields
                    </h3>
                    <Button onClick={addField} size="sm" variant="outline" className="group">
                        <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                        Add Field
                    </Button>
                </div>

                <div className="space-y-3">
                    {embed.fields?.map((field: any, index: number) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="p-4 bg-black/20 border border-white/10 rounded-lg space-y-3 group hover:border-white/20 transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-400">Field {index + 1}</span>
                                <button
                                    onClick={() => removeField(index)}
                                    className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <input
                                type="text"
                                value={field.name || ""}
                                onChange={(e) => updateFieldAt(index, "name", e.target.value)}
                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                                placeholder="Field Name"
                            />

                            <textarea
                                value={field.value || ""}
                                onChange={(e) => updateFieldAt(index, "value", e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
                                placeholder="Field Value"
                            />

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={field.inline || false}
                                    onChange={(e) => updateFieldAt(index, "inline", e.target.checked)}
                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-yellow-500 focus:ring-2 focus:ring-yellow-500"
                                />
                                <span className="text-sm">Inline</span>
                            </label>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Variables Info */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl"
            >
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span className="text-indigo-400">✨</span>
                    Available Variables
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-300">
                    {VARIABLES.map((variable) => (
                        <div key={variable.name} className="bg-white/10 px-2 py-1.5 rounded hover:bg-white/20 transition-colors cursor-help" title={variable.description}>
                            <code>{variable.name}</code>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">
                    💡 Type <kbd className="bg-white/10 px-1.5 py-0.5 rounded">&#123;</kbd> in any text field to see autocomplete suggestions
                </p>
            </motion.div>
        </div>
    );
}
