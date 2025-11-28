import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILevel extends Document {
    user_id: number;
    guild_id: number;
    xp: number;
    level: number;
}

const LevelSchema: Schema = new Schema(
    {
        user_id: { type: Number, required: true },
        guild_id: { type: Number, required: true },
        xp: { type: Number, default: 0 },
        level: { type: Number, default: 0 },
    },
    {
        collection: 'level',
        strict: false
    }
);

// Compound index for user_id and guild_id
LevelSchema.index({ user_id: 1, guild_id: 1 }, { unique: true });

const Level: Model<ILevel> =
    mongoose.models.Level || mongoose.model<ILevel>('Level', LevelSchema);

export default Level;
