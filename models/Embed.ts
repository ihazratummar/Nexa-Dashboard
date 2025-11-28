import mongoose from "mongoose";

const EmbedSchema = new mongoose.Schema({
    guild_id: { type: String, required: true },
    name: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    color: { type: String, default: "#5865F2" },
    thumbnail: { type: String },
    image: { type: String },
    footer: {
        text: { type: String },
        icon_url: { type: String }
    },
    fields: [{
        name: { type: String, required: true },
        value: { type: String, required: true },
        inline: { type: Boolean, default: false }
    }],
    created_by: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { strict: false });

// Compound index for unique embed names per guild
EmbedSchema.index({ guild_id: 1, name: 1 }, { unique: true });

export default mongoose.models.Embed || mongoose.model("Embed", EmbedSchema, "embeds");
