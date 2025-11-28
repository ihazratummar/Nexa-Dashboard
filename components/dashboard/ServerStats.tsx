import { Users, Hash, Volume2, Folder, Shield } from "lucide-react";

interface ServerStatsProps {
    memberCount: number;
    categoryCount: number;
    textChannelCount: number;
    voiceChannelCount: number;
    roleCount: number;
}

export default function ServerStats({
    memberCount,
    categoryCount,
    textChannelCount,
    voiceChannelCount,
    roleCount
}: ServerStatsProps) {
    const stats = [
        {
            label: "Total Members",
            value: memberCount,
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-500/10"
        },
        {
            label: "Categories",
            value: categoryCount,
            icon: Folder,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10"
        },
        {
            label: "Text Channels",
            value: textChannelCount,
            icon: Hash,
            color: "text-green-400",
            bg: "bg-green-500/10"
        },
        {
            label: "Voice Channels",
            value: voiceChannelCount,
            icon: Volume2,
            color: "text-purple-400",
            bg: "bg-purple-500/10"
        },
        {
            label: "Total Roles",
            value: roleCount,
            icon: Shield,
            color: "text-red-400",
            bg: "bg-red-500/10"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
                <div key={index} className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-colors">
                    <div className={`w-16 h-16 rounded-full ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                    <div>
                        <h3 className="text-gray-400 text-sm">{stat.label}</h3>
                        <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
