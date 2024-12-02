import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    TrendingUp, TrendingDown, Activity, DollarSign, 
    BarChart2, AlertTriangle, Eye, RefreshCw,
    ExternalLink, ChevronDown, ChevronUp, Wallet,
    Award, Target, Sparkles, BarChart, Clock
} from 'lucide-react';
import Link from 'next/link';

interface TokenStat {
    symbol: string;
    roi: number;
    volume: number;
    num_trades: number;
    profit: number;
}

interface RiskMetrics {
    sharpe_ratio: number;
    sortino_ratio: number;
    max_drawdown: number;
    risk_rating: 'Low' | 'Medium' | 'High';
}

interface WalletProps {
    wallet: {
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
        token_stats: TokenStat[];
        risk_metrics: RiskMetrics;
        total_volume_24h?: number;
        total_pnl_24h?: number;
        last_trade_time?: string;
    };
    onRefresh?: () => void;
}

export default function WalletCard({ wallet, onRefresh }: WalletProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const scoreColor = 
        wallet.total_score >= 80 ? 'text-green-500' :
        wallet.total_score >= 60 ? 'text-yellow-500' : 'text-red-500';

    const riskColor = 
        wallet.risk_metrics?.risk_rating === 'Low' ? 'text-green-500' :
        wallet.risk_metrics?.risk_rating === 'Medium' ? 'text-yellow-500' : 
        'text-red-400';

    const getBadgeColor = (metric: number, thresholds: [number, number]) => {
        if (metric >= thresholds[1]) return 'bg-green-500/20 text-green-400';
        if (metric >= thresholds[0]) return 'bg-yellow-500/20 text-yellow-400';
        return 'bg-red-500/20 text-red-400';
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        if (onRefresh) {
            await onRefresh();
        }
        setRefreshing(false);
    };

    const formatTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-all shadow-lg overflow-hidden hover:shadow-xl"
        >
            <div className="p-6">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Wallet className="text-blue-400" size={20} />
                            <h3 className="text-lg font-semibold text-white">
                                {wallet.address.substring(0, 8)}...{wallet.address.substring(36)}
                            </h3>
                            {wallet.total_score >= 85 && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                    <Award size={12} />
                                    <span>Top Performer</span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <p className={`text-2xl font-bold ${scoreColor}`}>
                                {wallet.total_score.toFixed(1)}
                            </p>
                            <a
                                href={`https://gmgn.ai/sol/address/${wallet.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-400 hover:text-blue-400 transition-colors"
                            >
                                View on GMGN ↗
                            </a>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all hover:scale-105"
                            title="Refresh data"
                        >
                            <RefreshCw 
                                className={`text-blue-400 ${refreshing ? 'animate-spin' : ''}`} 
                                size={20} 
                            />
                        </button>
                        <Link href={`/wallet/${wallet.address}`}>
                            <button 
                                className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-all hover:scale-105"
                                title="View Details"
                            >
                                <Eye className="text-blue-400" size={20} />
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Activity size={16} />
                            <span className="text-sm">Win Rate</span>
                        </div>
                        <p className="text-lg font-semibold text-white">
                            {wallet.win_rate.toFixed(1)}%
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full inline-block ${
                            getBadgeColor(wallet.win_rate, [50, 70])
                        }`}>
                            {wallet.win_rate >= 70 ? 'Excellent' : wallet.win_rate >= 50 ? 'Good' : 'Poor'}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-400">
                            <BarChart size={16} />
                            <span className="text-sm">24h Volume</span>
                        </div>
                        <p className="text-lg font-semibold text-white">
                            ${(wallet.total_volume_24h || 0).toLocaleString()}
                        </p>
                        {wallet.total_pnl_24h && (
                            <span className={`text-xs px-2 py-1 rounded-full inline-block ${
                                wallet.total_pnl_24h >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                                {wallet.total_pnl_24h >= 0 ? '+' : ''}{wallet.total_pnl_24h.toFixed(2)}%
                            </span>
                        )}
                    </div>
                </div>

                {/* Risk Metrics */}
                <div className="p-4 bg-gray-700/50 rounded-lg mb-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Risk Level</span>
                        <span className={riskColor}>
                            {wallet.risk_metrics?.risk_rating || 'Analyzing...'}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-gray-400">Max Drawdown</span>
                        <span className={`font-medium ${
                            wallet.max_drawdown <= 20 ? 'text-green-400' : 
                            wallet.max_drawdown <= 40 ? 'text-yellow-400' : 
                            'text-red-400'
                        }`}>
                            {wallet.max_drawdown?.toFixed(2) || '0.00'}%
                        </span>
                    </div>

                    {wallet.last_trade_time && (
                        <div className="flex justify-between items-center text-sm mt-2">
                            <span className="text-gray-400">Last Trade</span>
                            <span className="text-white">
                                {formatTimeAgo(wallet.last_trade_time)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Detailed Scores */}
                <div className="grid grid-cols-3 gap-2 bg-gray-700/30 rounded-lg p-3">
                    <div className="text-center">
                        <div className="text-xs text-gray-400">ROI</div>
                        <div className={getBadgeColor(wallet.roi_score, [50, 75])}>
                            {wallet.roi_score.toFixed(1)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-400">Consistency</div>
                        <div className={getBadgeColor(wallet.consistency_score, [50, 75])}>
                            {wallet.consistency_score.toFixed(1)}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-400">Volume</div>
                        <div className={getBadgeColor(wallet.volume_score, [50, 75])}>
                            {wallet.volume_score.toFixed(1)}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Summary */}
                {isExpanded && wallet.token_stats && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 pt-4 border-t border-gray-700"
                    >
                        <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                            <Clock size={16} className="text-blue-400" />
                            Recent Activity
                        </h4>
                        <div className="space-y-2">
                            {wallet.token_stats.slice(0, 3).map((token, index) => (
                                <div 
                                    key={index}
                                    className="flex justify-between items-center bg-gray-700/30 rounded-lg p-2"
                                >
                                    <span className="text-gray-300">{token.symbol}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-400">
                                            {token.num_trades} trades
                                        </span>
                                        <span className={token.roi >= 0 ? 'text-green-400' : 'text-red-400'}>
                                            {token.roi >= 0 ? '+' : ''}{token.roi.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Expand/Collapse Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-2 px-4 bg-gray-700/50 hover:bg-gray-700 transition-colors text-gray-400 text-sm flex items-center justify-center gap-1"
            >
                {isExpanded ? 'Show Less' : 'Show More'}
                <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <ChevronDown size={16} />
                </motion.div>
            </button>
        </motion.div>
    );
}