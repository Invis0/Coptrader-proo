import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Headers for Cielo API
const API_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://app.cielo.finance/',
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhZGRyZXNzIjoiMHhlNGFiMjMxNmUyNmQ0MDczZTJmN2JjOThhZTE0ZmJmYjNmOTU0NDFjIiwiaXNzIjoiaHR0cHM6Ly9hcGkudW5pd2hhbGVzLmlvLyIsInN1YiI6InVzZXIiLCJwbGFuIjoiYmFzaWMiLCJiYWxhbmNlIjowLCJpYXQiOjE3MzMwODgwNzIsImV4cCI6MTczMzA5ODg3Mn0.PZ-2vZ-2rDPWY7kJpbLDvz0Y7nsvSmE-RX2zYxIeXes',
    'API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aW1lc3RhbXAiOjE3MzMwODgwOTh9.blroCEOCSPFvw_c0WoJNlh5uYYbb83UmQxqDUXuyCL0',
    'Origin': 'https://app.cielo.finance',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
};

export default function SearchWallet() {
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [walletData, setWalletData] = useState<any>(null);

    const searchWallet = async () => {
        if (!address) {
            setError('Please enter a wallet address');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`https://feed-api.cielo.finance/v1/pnl/tokens?wallet=${address}&skip_unrealized_pnl=true&days=7d&page=1`, {
                headers: API_HEADERS
            });

            if (!response.ok) {
                throw new Error('Failed to fetch wallet data');
            }

            const data = await response.json();
            setWalletData(data.data);
            
        } catch (err) {
            // Type-safe error handling
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar />
            
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-white mb-8">Search Wallet</h1>

                    {/* Search Input */}
                    <div className="flex gap-4 mb-8">
                        <input
                            type="text"
                            placeholder="Enter wallet address..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="flex-1 px-4 py-2 bg-gray-800 rounded-lg text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                        />
                        <button
                            onClick={searchWallet}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Search size={20} />
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {walletData && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Overview Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    title="Total PNL"
                                    value={`$${walletData.total_pnl_usd?.toLocaleString() ?? 0}`}
                                    trend={walletData.total_pnl_usd > 0}
                                />
                                <StatCard
                                    title="Win Rate"
                                    value={`${walletData.winrate?.toFixed(1) ?? 0}%`}
                                    trend={walletData.winrate > 50}
                                />
                                <StatCard
                                    title="Total Trades"
                                    value={walletData.total_tokens_traded?.toString() ?? '0'}
                                />
                                <StatCard
                                    title="ROI"
                                    value={`${walletData.total_roi_percentage?.toFixed(2) ?? 0}%`}
                                    trend={walletData.total_roi_percentage > 0}
                                />
                            </div>

                            {/* Token Performance */}
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Token Performance</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-gray-400">
                                                <th className="px-6 py-3">Token</th>
                                                <th className="px-6 py-3">ROI</th>
                                                <th className="px-6 py-3">Buy Volume</th>
                                                <th className="px-6 py-3">Sell Volume</th>
                                                <th className="px-6 py-3">Trades</th>
                                                <th className="px-6 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {walletData.tokens?.map((token: any, index: number) => (
                                                <tr key={index} className="border-t border-gray-700">
                                                    <td className="px-6 py-4 text-white">
                                                        {token.token_symbol}
                                                    </td>
                                                    <td className={`px-6 py-4 ${
                                                        token.roi_percentage >= 0 ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                        {token.roi_percentage?.toFixed(2)}%
                                                    </td>
                                                    <td className="px-6 py-4 text-white">
                                                        ${token.total_buy_usd?.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-white">
                                                        ${token.total_sell_usd?.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-white">
                                                        {token.num_swaps}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                            token.is_honeypot
                                                                ? 'bg-red-500/20 text-red-400'
                                                                : 'bg-green-500/20 text-green-400'
                                                        }`}>
                                                            {token.is_honeypot ? 'Honeypot' : 'Safe'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string;
    trend?: boolean;
}

function StatCard({ title, value, trend }: StatCardProps) {
    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-white mt-2">{value}</p>
            {typeof trend !== 'undefined' && (
                <p className={`text-sm mt-2 ${trend ? 'text-green-400' : 'text-red-400'}`}>
                    {trend ? '↑' : '↓'} {trend ? 'Positive' : 'Negative'}
                </p>
            )}
        </div>
    );
}