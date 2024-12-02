import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Wallet,
    Search,
    Bell,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Sidebar() {
    const [expanded, setExpanded] = useState(true);
    const router = useRouter();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
        { icon: Wallet, label: 'Top Wallets', href: '/wallets' },
        { icon: Search, label: 'Search Wallet', href: '/search' },
        { icon: Bell, label: 'Alerts', href: '/alerts' },
    ];

    return (
        <motion.div
            animate={{ width: expanded ? 240 : 70 }}
            className="bg-gray-800 h-screen relative"
        >
            {/* Toggle Button */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="absolute -right-3 top-6 bg-gray-800 p-1.5 rounded-full border border-gray-600"
            >
                {expanded ? (
                    <ChevronLeft size={16} className="text-gray-300" />
                ) : (
                    <ChevronRight size={16} className="text-gray-300" />
                )}
            </button>

            {/* Logo */}
            <div className="p-4 mb-8">
                <motion.h1
                    animate={{ opacity: expanded ? 1 : 0 }}
                    className="text-xl font-bold text-white"
                >
                    Wallet Analyzer
                </motion.h1>
            </div>

            {/* Menu Items */}
            <nav className="px-2">
                {menuItems.map((item, index) => {
                    const isActive = router.pathname === item.href;
                    return (
                        <Link
                            key={index}
                            href={item.href}
                            className="block"
                        >
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className={`flex items-center px-3 py-3 my-1 rounded-lg cursor-pointer ${
                                    isActive 
                                        ? 'bg-blue-500/20 text-blue-400' 
                                        : 'text-gray-300 hover:bg-gray-700'
                                }`}
                            >
                                <item.icon size={20} />
                                {expanded && (
                                    <motion.span
                                        initial={false}
                                        animate={{ opacity: expanded ? 1 : 0 }}
                                        className="ml-3"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>
        </motion.div>
    );
}