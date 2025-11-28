"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button"; // Assuming you will create this or use a library
import { motion } from "framer-motion";

export function Navbar() {
    const { data: session } = useSession();

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10"
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                    Nexa
                </Link>

                <div className="flex items-center gap-4">
                    {session ? (
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white transition-colors">
                                Dashboard
                            </Link>
                            <div className="flex items-center gap-2">
                                <img
                                    src={session.user?.image || ''}
                                    alt={session.user?.name || ''}
                                    className="w-8 h-8 rounded-full border border-white/10"
                                />
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn("discord")}
                            className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
                        >
                            Login with Discord
                        </button>
                    )}
                </div>
            </div>
        </motion.nav>
    );
}
