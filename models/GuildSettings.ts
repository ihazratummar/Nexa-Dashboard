import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGuildSettings extends Document {
    guild_id: string; // Changed to string to match other models
    is_premium: boolean;
    channels: {
        log_channel?: string;
        welcome_channel?: string;
        leave_channel?: string;
    };
    // Add other known fields here, but keep strict: false for flexibility
}

const GuildSettingsSchema: Schema = new Schema(
    {
        guild_id: { type: String, required: true, unique: true },
        is_premium: { type: Boolean, default: false },
        channels: {
            log_channel: { type: String },
            welcome_channel: { type: String },
            leave_channel: { type: String },
        },
    },
    {
        collection: 'guild_settings',
        strict: false // Allow other fields to exist without being defined in the schema
    }
);

const GuildSettings: Model<IGuildSettings> =
    mongoose.models.GuildSettings || mongoose.model<IGuildSettings>('GuildSettings', GuildSettingsSchema);

export default GuildSettings;
