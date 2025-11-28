import { MessageSquare } from "lucide-react";

export default function WelcomePage() {
    return (
        <div>
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-pink-500/10 rounded-xl">
                    <MessageSquare className="w-8 h-8 text-pink-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Welcome</h1>
                    <p className="text-gray-400">Customize welcome messages and images.</p>
                </div>
            </div>

            <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center">
                <p className="text-gray-400">Settings coming soon...</p>
            </div>
        </div>
    );
}
