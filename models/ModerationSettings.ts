import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IModerationSettingsFrontend {
    _id: string;
    guild_id: string;
    is_moderation_settings_enabled: boolean;
    mode_roles: string[];
    created_at: Date | string;
    updated_at: Date | string;
}

export interface IModerationSettings extends Document {
    guild_id: string;
    is_moderation_settings_enabled: boolean;
    mode_roles: string[];
    created_at: Date;
    updated_at: Date;
}

const ModerationSettingsSchema: Schema = new Schema(
    {
        guild_id: { type: String, required: true, unique: true },
        is_moderation_settings_enabled: { type: Boolean, default: false },
        mode_roles: [{ type: String }],
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        collection: 'moderation_settings'
    }
);

const ModerationSettings: Model<IModerationSettings> =
    mongoose.models.ModerationSettings || mongoose.model<IModerationSettings>('ModerationSettings', ModerationSettingsSchema);

export default ModerationSettings;
