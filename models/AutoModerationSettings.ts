import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAutoModFilter {
    enabled: boolean;
    actions: string[]; // ['block', 'timeout', 'mute', 'warn', 'kick', 'ban']
    timeout_duration?: number; // in seconds
    ignored_roles: string[];
    ignored_channels: string[];
    custom_config?: {
        bad_words?: string[];
        max_mentions?: number;
        max_caps_percentage?: number;
        max_emojis?: number;
        max_lines?: number;
        toxicity_threshold?: number;
        nudity_threshold?: number;
        gore_threshold?: number;
    };
}

export interface IAutoModerationSettingsFrontend {
    _id: string;
    guild_id: string;
    global: {
        is_enabled: boolean;
        ignored_channels: string[];
        ignored_roles: string[];
        media_only_channels: string[];
        youtube_only_channels: string[];
        twitch_only_channels: string[];
    };
    filters: {
        spam: IAutoModFilter;
        bad_words: IAutoModFilter;
        duplicate_text: IAutoModFilter;
        repeated_messages: IAutoModFilter;
        discord_invites: IAutoModFilter;
        links: IAutoModFilter;
        spammed_caps: IAutoModFilter;
        emoji_spam: IAutoModFilter;
        mass_mention: IAutoModFilter;
        ai_moderation: {
            enabled: boolean;
            actions: string[];
            timeout_duration?: number;
            ignored_roles: string[];
            ignored_channels: string[];
            custom_config?: {
                toxicity_threshold?: number;
                nudity_threshold?: number;
                gore_threshold?: number;
            };
        };
    };
    created_at: Date | string;
    updated_at: Date | string;
}

export interface IAutoModerationSettings extends Document {
    guild_id: string;
    global: {
        is_enabled: boolean;
        ignored_channels: string[];
        ignored_roles: string[];
        media_only_channels: string[];
        youtube_only_channels: string[];
        twitch_only_channels: string[];
    };
    filters: {
        spam: IAutoModFilter;
        bad_words: IAutoModFilter;
        duplicate_text: IAutoModFilter;
        repeated_messages: IAutoModFilter;
        discord_invites: IAutoModFilter;
        links: IAutoModFilter;
        spammed_caps: IAutoModFilter;
        emoji_spam: IAutoModFilter;
        mass_mention: IAutoModFilter;
        ai_moderation: IAutoModFilter;
    };
    created_at: Date;
    updated_at: Date;
}

const FilterSchema = new Schema({
    enabled: { type: Boolean, default: false },
    actions: [{ type: String }],
    timeout_duration: { type: Number, default: 60 },
    ignored_roles: [{ type: String }],
    ignored_channels: [{ type: String }],
    custom_config: { type: Schema.Types.Mixed, default: {} }
}, { _id: false });

const AutoModerationSettingsSchema: Schema = new Schema(
    {
        guild_id: { type: String, required: true, unique: true },
        global: {
            is_enabled: { type: Boolean, default: false },
            ignored_channels: [{ type: String }],
            ignored_roles: [{ type: String }],
            media_only_channels: [{ type: String }],
            youtube_only_channels: [{ type: String }],
            twitch_only_channels: [{ type: String }],
        },
        filters: {
            spam: { type: FilterSchema, default: () => ({}) },
            bad_words: { type: FilterSchema, default: () => ({}) },
            duplicate_text: { type: FilterSchema, default: () => ({}) },
            repeated_messages: { type: FilterSchema, default: () => ({}) },
            discord_invites: { type: FilterSchema, default: () => ({}) },
            links: { type: FilterSchema, default: () => ({}) },
            spammed_caps: { type: FilterSchema, default: () => ({}) },
            emoji_spam: { type: FilterSchema, default: () => ({}) },
            mass_mention: { type: FilterSchema, default: () => ({}) },
            ai_moderation: { type: FilterSchema, default: () => ({}) },
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        collection: 'auto_moderation_settings'
    }
);

const AutoModerationSettings: Model<IAutoModerationSettings> =
    mongoose.models.AutoModerationSettings || mongoose.model<IAutoModerationSettings>('AutoModerationSettings', AutoModerationSettingsSchema);

export default AutoModerationSettings;
