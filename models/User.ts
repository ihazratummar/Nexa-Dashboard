import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    discord_id: string;
    is_premium: boolean;
    premium_guild_id: string | null;
    created_at: Date;
    updated_at: Date;
}

const UserSchema: Schema = new Schema(
    {
        discord_id: { type: String, required: true, unique: true },
        is_premium: { type: Boolean, default: false },
        premium_guild_id: { type: String, default: null },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        collection: 'users'
    }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
