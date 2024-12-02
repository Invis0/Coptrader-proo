import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    CopyCheck, AlertTriangle, Settings, 
    TrendingUp, Ban, CheckCircle, History
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface CopyTrade {
    setup_id: number;
    wallet_address: string;
    active: boolean;
    max_trade_size: number;
    stop_loss: number;
    take_profit: number;
    total_trades: number;
    successful_trades: number;
    total_profit_usd: number;
    roi_percentage: number;
    source_winrate: number;
    source_total_trades: number;
}

interface TradePerformance {
    total_trades: number;
    successful_trades: number;
    failed_trades: number;
    total_profit_usd: number;
    roi_percentage: number;
    recent_trades: any[];
    daily_performance: any[];
}

export default function CopyTrading() {
    const [activeTrades, setActiveTrades] = useState<CopyTrade[]>([]);
    const [selectedTrade, setSelectedTrade] = useState<CopyTrade | null>(null);
    const [performance, setPerformance] = useState<TradePerformance | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        fetchActiveTrades();
    }, []);

    const fetchActiveTrades = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8000/copytrade/active/current-user');
            if (!response.ok) throw new Error('Failed to fetch active trades');
            const data = await response.json();
            setActiveTrades(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchPerformance = async (setupId: number) => {
        try {
            const response = await fetch(`http://localhost:8000/copytrade/performance/${setupId}`);
            if (!response.ok) throw new Error('Failed to fetch performance data');
            const data = await response.json();
            setPerformance(data);
        } catch (err) {
            console.error('Error fetching performance:', err);
        }
    };

    const toggleCopyTrading = async (trade: CopyTrade) => {
        try {
            const response = await fetch('http://localhost:8000/copytrade/setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wallet_address: trade.wallet_address,
                    user_id: 'current-user',
                    active: !trade.active,
                    max_trade_size: trade.max_trade_size,
                    stop_loss: trade.stop_loss,
                    take_profit: trade.take_profit,
                }),
            });

            if (!response.ok) throw new Error('Failed to update copy trading status');
            await fetchActiveTrades();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900">
            <Sidebar />
            
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-white">Copy Trading</h1>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                        >
                            <Settings size={20} />
                            Global Settings
                        </button>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Active Copy Trades */}
                    <div className="grid gap-6 mb-8">
                        {activeTrades.map((trade) => (
                            <CopyTradeCard
                                key={trade.setup_id}
                                trade={trade}
                                onToggle={() => toggleCopyTrading(trade)}
                                onSelect={() => {
                                    setSelectedTrade(trade);
                                    fetchPerformance(trade.setup_id);
                                }}
                            />
                        ))}

                        {activeTrades.length === 0 && (
                            <div className="text-center py-12 bg-gray-800 rounded-lg">
                                <Ban className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-lg font-semibold text-white">No Active Copy Trades</h3>
                                <p className="mt-2 text-gray-400">Start by selecting wallets to copy trade.</p>
                            </div>
                        )}
                    </div>

                    {/* Performance Details */}
                    {selectedTrade && performance && (
                        <PerformanceDetails
                            trade={selectedTrade}
                            performance={performance}
                            onClose={() => setSelectedTrade(null)}
                        />
                    )}
                </div>
            </main>

            {/* Settings Modal */}
            {showSettings && (
                <SettingsModal onClose={() => setShowSettings(false)} />
            )}
        </div>
    );
}