import { motion } from 'framer-motion';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { 
    TrendingUp, DollarSign, CheckCircle, 
    XCircle, Clock, AlertTriangle 
} from 'lucide-react';

interface TradePerformance {
    total_trades: number;
    successful_trades: number;
    failed_trades: number;
    total_profit_usd: number;
    roi_percentage: number;
    recent_trades: Array<{
        token_symbol: string;
        amount: number;
        price_usd: number;
        trade_type: string;
        status: string;
        execution_time: string;
    }>;
    daily_performance: Array<{
        date: string;
        trades: number;
        successful: number;
        daily_pnl: number;
    }>;
}

interface PerformanceDetailsProps {
    trade: {
        wallet_address: string;
        active: boolean;
    };
    performance: TradePerformance;
    onClose: () => void;
}

export function PerformanceDetails({ trade, performance, onClose }: PerformanceDetailsProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
            <div className="bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto m-4">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-white mb-2">
                                Performance Details
                            </h2>
                            <p className="text-gray-400">
                                Wallet: {trade.wallet_address.substring(0, 8)}...
                                {trade.wallet_address.substring(36)}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                        >
                            ×
                        </button>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            icon={<TrendingUp className="text-blue-400" />}
                            label="ROI"
                            value={`${performance.roi_percentage.toFixed(2)}%`}
                            trend={performance.roi_percentage >= 0}
                        />
                        <StatCard
                            icon={<DollarSign className="text-green-400" />}
                            label="Total Profit"
                            value={`$${performance.total_profit_usd.toLocaleString()}`}
                            trend={performance.total_profit_usd >= 0}
                        />
                        <StatCard
                            icon={<CheckCircle className="text-purple-400" />}
                            label="Success Rate"
                            value={`${((performance.successful_trades / performance.total_trades) * 100).toFixed(1)}%`}
                        />
                        <StatCard
                            icon={<AlertTriangle className="text-yellow-400" />}
                            label="Total Trades"
                            value={performance.total_trades.toString()}
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* PnL Chart */}
                        <div className="bg-gray-900 rounded-lg p-4">
                            <h3 className="text-white font-semibold mb-4">Daily PnL</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={performance.daily_performance}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis 
                                            dataKey="date"
                                            stroke="#9CA3AF"
                                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                        />
                                        <YAxis stroke="#9CA3AF" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: 'none',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="daily_pnl"
                                            stroke="#3B82F6"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Trade Success Chart */}
                        <div className="bg-gray-900 rounded-lg p-4">
                            <h3 className="text-white font-semibold mb-4">Daily Trade Success</h3>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={performance.daily_performance}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis 
                                            dataKey="date"
                                            stroke="#9CA3AF"
                                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                        />
                                        <YAxis stroke="#9CA3AF" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: 'none',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <Bar dataKey="successful" fill="#10B981" />
                                        <Bar dataKey="failed" fill="#EF4444" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Recent Trades */}
                    <div className="bg-gray-900 rounded-lg p-4">
                        <h3 className="text-white font-semibold mb-4">Recent Trades</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-gray-400 text-left">
                                        <th className="p-2">Token</th>
                                        <th className="p-2">Type</th>
                                        <th className="p-2">Amount</th>
                                        <th className="p-2">Price</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {performance.recent_trades.map((trade, index) => (
                                        <tr key={index} className="border-t border-gray-800">
                                            <td className="p-2 text-white">{trade.token_symbol}</td>
                                            <td className="p-2">
                                                <span className={`px-2 py-1 rounded text-sm ${
                                                    trade.trade_type === 'buy'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                    {trade.trade_type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-2 text-white">{trade.amount}</td>
                                            <td className="p-2 text-white">${trade.price_usd}</td>
                                            <td className="p-2">
                                                <span className={`flex items-center gap-1 ${
                                                    trade.status === 'executed'
                                                        ? 'text-green-400'
                                                        : 'text-red-400'
                                                }`}>
                                                    {trade.status === 'executed' ? (
                                                        <CheckCircle size={16} />
                                                    ) : (
                                                        <XCircle size={16} />
                                                    )}
                                                    {trade.status}
                                                </span>
                                            </td>
                                            <td className="p-2 text-gray-400">
                                                {new Date(trade.execution_time).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    trend?: boolean;
}

function StatCard({ icon, label, value, trend }: StatCardProps) {
    return (
        <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-gray-400 text-sm">{label}</span>
            </div>
            <p className="text-2xl font-semibold text-white">{value}</p>
            {typeof trend !== 'undefined' && (
                <p className={`text-sm mt-1 ${trend ? 'text-green-400' : 'text-red-400'}`}>
                    {trend ? '↑' : '↓'} {trend ? 'Positive' : 'Negative'} trend
                </p>
            )}
        </div>
    );
}