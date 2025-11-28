import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { ServerSwitcher } from "@/components/dashboard/ServerSwitcher";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ guildId: string }>;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/");
    }

    const { guildId } = await params;
    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            <ServerSwitcher currentGuildId={guildId} />
            <Sidebar guildId={guildId} />
            <main className="flex-1 overflow-y-auto bg-black/10 p-4 lg:p-8">
                {children}
            </main>
        </div>
    );
}
