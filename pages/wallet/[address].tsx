import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    ArrowUpRight, ArrowDownRight, Activity,
    DollarSign, TrendingUp, AlertTriangle,
    Calendar, Clock, ChevronLeft,
    BarChart2, Shield, History,
    Wallet, RefreshCw, ExternalLink,
    PieChart, LineChart as LineChartIcon
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar,
    PieChart as RechartsPieChart, Pie, Cell 
} from 'recharts';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Cielo API headers
const API_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:132.0) Gecko/20100101 Firefox/132.0',
    'Accept': '*/*',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://app.cielo.finance/',
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhZGRyZXNzIjoiMHg5ODI3NzFlZTgyMzJlZmVkNjhiM2IzZThlOTk3ZTk4NzUxYWQzZmU1IiwiaXNzIjoiaHR0cHM6Ly9hcGkudW5pd2hhbGVzLmlvLyIsInN1YiI6InVzZXIiLCJwbGFuIjoiYmFzaWMiLCJiYWxhbmNlIjowLCJpYXQiOjE3MzMwODg0NjgsImV4cCI6MTczMzA5OTI2OH0.Nk3jfxjs6LEKDwl9MY4x-VH7w4C1WojWyRKXnKGxtxc',
    'API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aW1lc3RhbXAiOjE3MzMwODg0OTF9.Q6Hx1HROwvNhnYKL6duAObAs9vYUqqtirxBSi5cIQGw',
    'Origin': 'https://app.cielo.finance',
    'Connection': 'keep-alive',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
};

// Chart colors
const COLORS = ['#10B981', '#F43F5E', '#6366F1', '#F59E0B', '#8B5CF6'];

export default function WalletDetails() {
    const router = useRouter();
    const { address } = router.query;
    const [walletData, setWalletData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeframe, setTimeframe] = useState('7d');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (address) {
            fetchWalletData();
        }
    }, [address, timeframe]);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get data from Cielo API
            const response = await fetch(
                `https://feed-api.cielo.finance/v1/pnl/tokens?wallet=${address}&skip_unrealized_pnl=true&days=${timeframe}&page=1`,
                { headers: API_HEADERS }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch wallet data');
            }

            const data = await response.json();
            setWalletData(data.data);

        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching wallet data:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchWalletData();
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900 px-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!walletData) return null;

    // Prepare chart data
    const dailyPnLData = walletData.daily_pnl?.map((day: any) => ({
        date: new Date(day.date).toLocaleDateString(),
        pnl: day.pnl_usd,
    })) || [];

    const tokenDistributionData = walletData.tokens?.map((token: any) => ({
        name: token.token_symbol,
        value: Math.abs(token.total_pnl_usd),
        profit: token.total_pnl_usd > 0,
    })) || [];

    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar />
            
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Link 
                                href="/wallets" 
                                className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </Link>
                            <div>
                                <div className="flex items-center gap-2">
                                    <Wallet className="text-blue-400" size={24} />
                                    <h1 className="text-2xl font-bold text-white">
                                        Wallet Details
                                    </h1>
                                </div>
                                <p className="text-gray-400 mt-1">
                                    {address as string}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
                            >
                                <RefreshCw className={refreshing ? 'animate-spin' : ''} size={20} />
                                Refresh Data
                            </button>
                            <a
                                href={`https://explorer.solana.com/address/${address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                            >
                                <ExternalLink size={20} />
                                Explorer
                            </a>
                        </div>
                    </div>

                    {/* Overview Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total PNL"
                            value={`$${walletData.total_pnl_usd?.toLocaleString() ?? 0}`}
                            trend={walletData.total_pnl_usd > 0}
                            icon={<DollarSign className="text-green-400" />}
                        />
                        <StatCard
                            title="Win Rate"
                            value={`${walletData.winrate?.toFixed(1) ?? 0}%`}
                            trend={walletData.winrate > 50}
                            icon={<Activity className="text-blue-400" />}
                            subtitle={`${walletData.successful_trades ?? 0} successful trades`}
                        />
                        <StatCard
                            title="Total Trades"
                            value={walletData.total_tokens_traded?.toString() ?? '0'}
                            icon={<BarChart2 className="text-purple-400" />}
                            subtitle="All-time trades"
                        />
                        <StatCard
                            title="ROI"
                            value={`${walletData.total_roi_percentage?.toFixed(2) ?? 0}%`}
                            trend={walletData.total_roi_percentage > 0}
                            icon={<TrendingUp className="text-yellow-400" />}
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid lg:grid-cols-2 gap-6 mb-8">
                        {/* PnL Chart */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <LineChartIcon className="text-blue-400" size={20} />
                                    <h2 className="text-lg font-semibold text-white">
                                        Profit & Loss
                                    </h2>
                                </div>
                                <div className="flex gap-2">
                                    {['24h', '7d', '30d'].map((period) => (
                                        <button
                                            key={period}
                                            onClick={() => setTimeframe(period)}
                                            className={`px-3 py-1 rounded-lg text-sm ${
                                                timeframe === period
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                            }`}
                                        >
                                            {period}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dailyPnLData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                        <XAxis 
                                            dataKey="date"
                                            stroke="#9CA3AF"
                                            tick={{ fontSize: 12 }}
                                        />
                                        <YAxis 
                                            stroke="#9CA3AF"
                                            tick={{ fontSize: 12 }}
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '12px'
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="pnl"
                                            stroke="#3B82F6"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Token Distribution */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <PieChart className="text-blue-400" size={20} />
                                <h2 className="text-lg font-semibold text-white">
                                    Token Distribution
                                </h2>
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={tokenDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {tokenDistributionData.map((entry: any, index: number) => (
                                                <Cell 
                                                    key={`cell-${index}`}
                                                    fill={entry.profit ? '#10B981' : '#EF4444'} 
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '12px'
                                            }}
                                        />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Token Performance Table */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-white mb-6">Token Performance</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-gray-400 border-b border-gray-700">
                                        <th className="pb-4">Token</th>
                                        <th className="pb-4">ROI</th>
                                        <th className="pb-4">Buy Volume</th>
                                        <th className="pb-4">Sell Volume</th>
                                        <th className="pb-4">Trades</th>
                                        <th className="pb-4">Net Profit</th>
                                        <th className="pb-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {walletData.tokens?.map((token: any, index: number) => (
                                        <tr key={index} className="text-gray-300">
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{token.token_symbol}</span>
                                                </div>
                                            </td>
                                            <td className={`py-4 ${
                                                token.roi_percentage >= 0 ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                {token.roi_percentage?.toFixed(2)}%
                                            </td>
                                            <td className="py-4">
                                                ${token.total_buy_usd?.toLocaleString()}
                                            </td>
                                            <td className="py-4">
                                                ${token.total_sell_usd?.toLocaleString()}
                                            </td>
                                            <td className="py-4">{token.num_swaps}</td>
                                            <td className={`py-4 ${
                                                token.total_pnl_usd >= 0 ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                ${token.total_pnl_usd?.toLocaleString()}
                                            </td>
                                            <td className="py-4">
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
                    {/* Risk Analysis Section */}
                    <div className="mt-8 bg-gray-800 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Shield className="text-blue-400" size={20} />
                            <h2 className="text-lg font-semibold text-white">Risk Analysis</h2>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gray-700/50 rounded-lg p-4">
                                <div className="text-sm text-gray-400 mb-2">Sharpe Ratio</div>
                                <div className="text-xl font-bold text-white">
                                    {walletData.risk_metrics?.sharpe_ratio?.toFixed(2) || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Risk-adjusted return metric
                                </div>
                            </div>

                            <div className="bg-gray-700/50 rounded-lg p-4">
                                <div className="text-sm text-gray-400 mb-2">Max Drawdown</div>
                                <div className="text-xl font-bold text-white">
                                    {walletData.risk_metrics?.max_drawdown?.toFixed(2)}%
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Largest peak-to-trough decline
                                </div>
                            </div>

                            <div className="bg-gray-700/50 rounded-lg p-4">
                                <div className="text-sm text-gray-400 mb-2">Win/Loss Ratio</div>
                                <div className="text-xl font-bold text-white">
                                    {walletData.risk_metrics?.win_loss_ratio?.toFixed(2) || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Ratio of winning to losing trades
                                </div>
                            </div>

                            <div className="bg-gray-700/50 rounded-lg p-4">
                                <div className="text-sm text-gray-400 mb-2">Risk Rating</div>
                                <div className={`text-xl font-bold ${
                                    walletData.risk_metrics?.risk_rating === 'Low' ? 'text-green-400' :
                                    walletData.risk_metrics?.risk_rating === 'Medium' ? 'text-yellow-400' :
                                    'text-red-400'
                                }`}>
                                    {walletData.risk_metrics?.risk_rating || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Overall risk assessment
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string;
    icon?: React.ReactNode;
    trend?: boolean;
    subtitle?: string;
}

function StatCard({ title, value, icon, trend, subtitle }: StatCardProps) {
    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
                <div className="text-gray-400 text-sm">{title}</div>
                {icon}
            </div>
            <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-white">{value}</p>
                {typeof trend !== 'undefined' && (
                    <div className={`flex items-center ${trend ? 'text-green-400' : 'text-red-400'}`}>
                        {trend ? (
                            <ArrowUpRight size={20} />
                        ) : (
                            <ArrowDownRight size={20} />
                        )}
                    </div>
                )}
            </div>
            {subtitle && (
                <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            )}
        </div>
    );
}