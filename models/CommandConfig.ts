import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICommandSettings {
    max_limit: number;
    auto_delete_invocation: boolean;
    auto_delete_response: boolean;
    auto_delete_with_invocation: boolean;
    response_delete_delay: number;
}

export interface ICommandConfigFrontend {
    _id: string;
    guild_id: string;
    command: string;
    description: string;
    category: string;
    is_premium: boolean;
    enabled: boolean;
    aliases: string[];
    enabled_roles: string[];
    disabled_roles: string[];
    enabled_channels: string[];
    disabled_channels: string[];
    roles_skip_limit: string[];
    settings: ICommandSettings;
    created_at: Date | string;
    updated_at: Date | string;
}

export interface ICommandConfig extends Document {
    guild_id: string;
    command: string;
    description: string;
    category: string;
    is_premium: boolean;
    enabled: boolean;
    aliases: string[];
    enabled_roles: string[];
    disabled_roles: string[];
    enabled_channels: string[];
    disabled_channels: string[];
    roles_skip_limit: string[];
    settings: ICommandSettings;
    created_at: Date;
    updated_at: Date;
}

const CommandSettingsSchema = new Schema({
    max_limit: { type: Number, default: 4 },
    auto_delete_invocation: { type: Boolean, default: false },
    auto_delete_response: { type: Boolean, default: false },
    auto_delete_with_invocation: { type: Boolean, default: false },
    response_delete_delay: { type: Number, default: 5 }
}, { _id: false });

const CommandConfigSchema: Schema = new Schema(
    {
        guild_id: { type: String, required: true },
        command: { type: String, required: true },
        description: { type: String, default: "No description available." },
        category: { type: String, default: "General" },
        is_premium: { type: Boolean, default: false },
        enabled: { type: Boolean, default: true },
        aliases: [{ type: String }],
        enabled_roles: [{ type: String }],
        disabled_roles: [{ type: String }],
        enabled_channels: [{ type: String }],
        disabled_channels: [{ type: String }],
        roles_skip_limit: [{ type: String }],
        settings: { type: CommandSettingsSchema, default: () => ({}) }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        collection: 'command_settings'
    }
);

// Compound index for unique command per guild
CommandConfigSchema.index({ guild_id: 1, command: 1 }, { unique: true });

const CommandConfig: Model<ICommandConfig> =
    mongoose.models.CommandConfig || mongoose.model<ICommandConfig>('CommandConfig', CommandConfigSchema);

export default CommandConfig;
