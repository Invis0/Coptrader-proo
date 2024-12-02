// pages/index.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer 
} from 'recharts';
import { 
    Wallet, TrendingUp, Award, 
    AlertTriangle, Search
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import WalletCard from '../components/WalletCard';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';

// API base URL
const API_URL = 'http://localhost:8000';

interface WalletData {
    address: string;
    total_score: number;
    roi_score: number;
    consistency_score: number;
    volume_score: number;
    risk_score: number;
    trade_count: number;
    win_rate: number;
    avg_profit: number;
    max_drawdown: number;
    sharpe_ratio: number;
    token_stats: any[];
    risk_metrics: any;
}

export default function Dashboard() {
    const [topWallets, setTopWallets] = useState<WalletData[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [selectedMetrics, setSelectedMetrics] = useState({
        minRoi: 20,
        minWinRate: 50,
        minTrades: 20
    });

    useEffect(() => {
        fetchData();
    }, [selectedMetrics]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [walletsResponse, statsResponse] = await Promise.all([
                fetch(`${API_URL}/wallets/top?min_roi=${selectedMetrics.minRoi}&min_win_rate=${selectedMetrics.minWinRate}&min_trades=${selectedMetrics.minTrades}`),
                fetch(`${API_URL}/stats/overview`)
            ]);

            if (!walletsResponse.ok || !statsResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            const [walletsData, statsData] = await Promise.all([
                walletsResponse.json(),
                statsResponse.json()
            ]);

            setTopWallets(walletsData || []);
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredWallets = topWallets.filter(wallet =>
        wallet.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar />
            
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-between items-center"
                    >
                        <h1 className="text-3xl font-bold text-white">
                            Copy Trading Dashboard
                        </h1>
                        
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search wallets..."
                                    className="w-64 px-4 py-2 bg-gray-800 rounded-lg text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Overview */}
                    {stats && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            <StatsCard
                                title="Total Wallets"
                                value={stats.total_wallets.toLocaleString()}
                                icon={<Wallet className="text-blue-500" />}
                                change={stats.trends?.[0]?.wallet_count_change || 0}
                            />
                            <StatsCard
                                title="Average ROI"
                                value={`${stats.average_roi.toFixed(2)}%`}
                                icon={<TrendingUp className="text-green-500" />}
                                change={stats.trends?.[0]?.roi_change || 0}
                            />
                            <StatsCard
                                title="Top Performers"
                                value={stats.top_performers.toLocaleString()}
                                icon={<Award className="text-yellow-500" />}
                                change={stats.trends?.[0]?.top_performers_change || 0}
                            />
                            <StatsCard
                                title="Avg Win Rate"
                                value={`${stats.average_winrate.toFixed(1)}%`}
                                icon={<AlertTriangle className="text-purple-500" />}
                                change={stats.trends?.[0]?.winrate_change || 0}
                            />
                        </motion.div>
                    )}

                    {/* Filter Controls */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Filter Criteria</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="text-gray-300">Minimum ROI %</label>
                                <input
                                    type="number"
                                    value={selectedMetrics.minRoi}
                                    onChange={(e) => setSelectedMetrics({
                                        ...selectedMetrics,
                                        minRoi: Number(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 bg-gray-700 rounded text-white"
                                />
                            </div>
                            <div>
                                <label className="text-gray-300">Minimum Win Rate %</label>
                                <input
                                    type="number"
                                    value={selectedMetrics.minWinRate}
                                    onChange={(e) => setSelectedMetrics({
                                        ...selectedMetrics,
                                        minWinRate: Number(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 bg-gray-700 rounded text-white"
                                />
                            </div>
                            <div>
                                <label className="text-gray-300">Minimum Trades</label>
                                <input
                                    type="number"
                                    value={selectedMetrics.minTrades}
                                    onChange={(e) => setSelectedMetrics({
                                        ...selectedMetrics,
                                        minTrades: Number(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 bg-gray-700 rounded text-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Wallet List */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {loading ? (
                            <div className="col-span-2 flex justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : filteredWallets.length > 0 ? (
                            filteredWallets.map((wallet) => (
                                <WalletCard key={wallet.address} wallet={wallet} />
                            ))
                        ) : (
                            <div className="col-span-2">
                                <Alert variant="destructive">
                                    <AlertTitle>No wallets found</AlertTitle>
                                    <AlertDescription>
                                        Try adjusting your filter criteria or search term.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}

interface StatsCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    change: number;
}

const StatsCard = ({ title, value, icon, change }: StatsCardProps) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-6 bg-gray-800 rounded-lg"
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-gray-400 text-sm">{title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
                <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {change >= 0 ? '+' : ''}{change}% from last week
                </p>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg">
                {icon}
            </div>
        </div>
    </motion.div>
);