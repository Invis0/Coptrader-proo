import { motion } from 'framer-motion';
import { CopyCheck, Ban, TrendingUp, DollarSign, BarChart2 } from 'lucide-react';

interface CopyTradeCardProps {
    trade: {
        wallet_address: string;
        active: boolean;
        total_trades: number;
        successful_trades: number;
        total_profit_usd: number;
        roi_percentage: number;
        source_winrate: number;
    };
    onToggle: () => void;
    onSelect: () => void;
}

export function CopyTradeCard({ trade, onToggle, onSelect }: CopyTradeCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6"
        >
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">
                            {trade.wallet_address.substring(0, 8)}...
                            {trade.wallet_address.substring(36)}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                            trade.active 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gray-700 text-gray-400'
                        }`}>
                            {trade.active ? 'Active' : 'Paused'}
                        </span>
                    </div>
                    <p className="text-gray-400 mt-1">Started copying 2 days ago</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onToggle}
                        className={`p-2 rounded-lg transition-colors ${
                            trade.active 
                                ? 'bg-green-500/20 hover:bg-green-500/30' 
                                : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                    >
                        {trade.active ? (
                            <CopyCheck className="text-green-400" size={20} />
                        ) : (
                            <Ban className="text-gray-400" size={20} />
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="space-y-1">
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                        <TrendingUp size={16} />
                        ROI
                    </p>
                    <p className={`text-lg font-semibold ${
                        trade.roi_percentage >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                        {trade.roi_percentage.toFixed(2)}%
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                        <DollarSign size={16} />
                        Total Profit
                    </p>
                    <p className={`text-lg font-semibold ${
                        trade.total_profit_usd >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                        ${trade.total_profit_usd.toLocaleString()}
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                        <BarChart2 size={16} />
                        Success Rate
                    </p>
                    <p className="text-lg font-semibold text-white">
                        {((trade.successful_trades / trade.total_trades) * 100).toFixed(1)}%
                    </p>
                </div>

                <div className="space-y-1">
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                        <BarChart2 size={16} />
                        Total Trades
                    </p>
                    <p className="text-lg font-semibold text-white">
                        {trade.total_trades}
                    </p>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={onSelect}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    View Details
                </button>
            </div>
        </motion.div>
    );
}