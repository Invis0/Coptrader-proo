import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, Filter } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import WalletCard from '../components/WalletCard';
import FilterPanel from '../components/FilterPanel';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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

interface FilterCriteria {
    minRoi: number;
    minWinRate: number;
    minTrades: number;
    minVolume: number;
    minProfit: number;
    riskLevel: string;
    tokenType: string;
    timeFrame: string;
}

export default function Wallets() {
    const [wallets, setWallets] = useState<WalletData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filterCriteria, setFilterCriteria] = useState<FilterCriteria>({
        minRoi: 20,
        minWinRate: 50,
        minTrades: 20,
        minVolume: 0,
        minProfit: 0,
        riskLevel: 'all',
        tokenType: 'all',
        timeFrame: '7d'
    });

    const fetchWallets = async (showRefreshAnimation = true) => {
        try {
            if (showRefreshAnimation) {
                setRefreshing(true);
            }
            setError(null);

            const response = await fetch(
                `http://localhost:8000/wallets/top?` + 
                `min_roi=${filterCriteria.minRoi}` +
                `&min_win_rate=${filterCriteria.minWinRate}` +
                `&min_trades=${filterCriteria.minTrades}` +
                `&min_volume=${filterCriteria.minVolume}` +
                `&min_profit=${filterCriteria.minProfit}` +
                `&risk_level=${filterCriteria.riskLevel}` +
                `&token_type=${filterCriteria.tokenType}` +
                `&time_frame=${filterCriteria.timeFrame}`
            );
            
            if (!response.ok) {
                throw new Error('Failed to fetch wallets');
            }

            const data = await response.json();
            setWallets(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWallets(false);
    }, [filterCriteria]);

    const filteredWallets = wallets.filter(wallet =>
        wallet.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRefresh = () => {
        fetchWallets(true);
    };

    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar />
            
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                        <h1 className="text-3xl font-bold text-white">Top Wallets</h1>
                        
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            {/* Search */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search wallets..."
                                    className="w-full md:w-64 px-4 py-2 bg-gray-800 rounded-lg text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                                >
                                    <Filter size={20} />
                                    Filters
                                </button>
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <RefreshCw 
                                        size={20} 
                                        className={refreshing ? 'animate-spin' : ''} 
                                    />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            <FilterPanel
                                criteria={filterCriteria}
                                onChange={setFilterCriteria}
                            />
                        </motion.div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Wallet Grid */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {loading ? (
                            <div className="col-span-2 flex justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : filteredWallets.length > 0 ? (
                            filteredWallets.map((wallet) => (
                                <WalletCard 
                                    key={wallet.address} 
                                    wallet={wallet}
                                    onRefresh={() => {
                                        fetchWallets(true);
                                    }}
                                />
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

                    {/* Stats Summary */}
                    {!loading && filteredWallets.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 bg-gray-800 rounded-lg p-6"
                        >
                            <h2 className="text-xl font-semibold text-white mb-4">Summary</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm">Total Wallets</p>
                                    <p className="text-2xl font-bold text-white">{filteredWallets.length}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Average ROI</p>
                                    <p className="text-2xl font-bold text-white">
                                        {(filteredWallets.reduce((acc, w) => acc + w.roi_score, 0) / filteredWallets.length).toFixed(2)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Average Win Rate</p>
                                    <p className="text-2xl font-bold text-white">
                                        {(filteredWallets.reduce((acc, w) => acc + w.win_rate, 0) / filteredWallets.length).toFixed(2)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Average Score</p>
                                    <p className="text-2xl font-bold text-white">
                                        {(filteredWallets.reduce((acc, w) => acc + w.total_score, 0) / filteredWallets.length).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
} 