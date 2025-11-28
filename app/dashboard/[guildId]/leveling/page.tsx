import { Trophy } from "lucide-react";

export default function LevelingPage() {
    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-yellow-500/10 rounded-xl">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Leveling</h1>
                    <p className="text-gray-400">Configure XP rates and level up rewards.</p>
                </div>
            </div>

            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
                <p className="text-gray-400">Settings coming soon...</p>
            </div>
        </div>
    );
}
