"use client";

import { useState, useRef, useEffect } from "react";
import { X, Check, Search, ChevronDown, LucideIcon, TriangleAlert } from "lucide-react";

interface Option {
    id: string;
    name: string;
    color?: number;
    position?: number;
    managed?: boolean;
    [key: string]: any;
}

interface SearchableMultiSelectProps {
    label: string;
    options: Option[];
    value: string[];
    onChange: (value: string[]) => void;
    icon?: LucideIcon;
    placeholder?: string;
    disabled?: boolean;
    maxSelect?: number;
    botHighestRolePosition?: number;
}

export default function SearchableMultiSelect({
    label,
    options,
    value,
    onChange,
    icon: Icon,
    placeholder = "Select...",
    disabled = false,
    maxSelect,
    botHighestRolePosition
}: SearchableMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option =>
        option.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (optionId: string) => {
        if (value.includes(optionId)) {
            onChange(value.filter(id => id !== optionId));
        } else {
            if (maxSelect && value.length >= maxSelect) return;
            onChange([...value, optionId]);
        }
    };

    const isRoleTooHigh = (option: Option) => {
        if (botHighestRolePosition === undefined || option.position === undefined) return false;
        return option.position >= botHighestRolePosition;
    };

    return (
        <div className="space-y-2" ref={containerRef}>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4" />}
                {label}
            </label>

            <div className="relative">
                <div
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 min-h-[42px] cursor-pointer flex items-center justify-between hover:border-indigo-500/50 transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    <div className="flex flex-wrap gap-2">
                        {value.length === 0 ? (
                            <span className="text-gray-500">{placeholder}</span>
                        ) : (
                            value.map(id => {
                                const option = options.find(o => o.id === id);
                                if (!option) return null;
                                const tooHigh = isRoleTooHigh(option);
                                return (
                                    <span
                                        key={id}
                                        className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${tooHigh
                                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/20"
                                            : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
                                            }`}
                                    >
                                        {tooHigh && <TriangleAlert className="w-3 h-3" />}
                                        {option.name}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(id);
                                            }}
                                            className="hover:text-white ml-1"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                );
                            })
                        )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </div>

                {isOpen && !disabled && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                        <div className="p-2 border-b border-white/10">
                            <div className="flex items-center gap-2 px-3 py-2 bg-black/20 rounded-lg">
                                <Search className="w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search..."
                                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-500"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
                            {filteredOptions.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                    No results found
                                </div>
                            ) : (
                                filteredOptions.map(option => {
                                    const isSelected = value.includes(option.id);
                                    const tooHigh = isRoleTooHigh(option);
                                    return (
                                        <div
                                            key={option.id}
                                            onClick={() => handleSelect(option.id)}
                                            className={`px-3 py-2 rounded-lg text-sm cursor-pointer flex items-center justify-between transition-colors ${isSelected
                                                ? "bg-indigo-500/20 text-indigo-300"
                                                : "hover:bg-white/5 text-gray-300"
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {option.color ? (
                                                    <span
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: `#${option.color.toString(16).padStart(6, '0')}` }}
                                                    />
                                                ) : null}
                                                <span>{option.name}</span>
                                                {tooHigh && (
                                                    <div className="group relative flex items-center" onClick={(e) => e.stopPropagation()}>
                                                        <TriangleAlert className="w-4 h-4 text-amber-500" />
                                                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-48 p-2 bg-black border border-white/10 rounded text-xs text-gray-300 hidden group-hover:block z-[60] shadow-xl">
                                                            Bot cannot manage this role (it is higher in hierarchy).
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {isSelected && <Check className="w-4 h-4" />}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
