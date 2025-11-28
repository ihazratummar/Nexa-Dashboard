import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEconomy extends Document {
    user_id: number;
    guild_id: number;
    balance: number;
    bank: number;
}

const EconomySchema: Schema = new Schema(
    {
        user_id: { type: Number, required: true },
        guild_id: { type: Number, required: true },
        balance: { type: Number, default: 0 },
        bank: { type: Number, default: 0 },
    },
    {
        collection: 'Economy',
        strict: false
    }
);

// Compound index for user_id and guild_id to ensure uniqueness per guild
EconomySchema.index({ user_id: 1, guild_id: 1 }, { unique: true });

const Economy: Model<IEconomy> =
    mongoose.models.Economy || mongoose.model<IEconomy>('Economy', EconomySchema);

export default Economy;
