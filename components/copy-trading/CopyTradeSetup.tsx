import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, DollarSign, Target } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface CopyTradeSetupProps {
    walletAddress: string;
    onClose: () => void;
    onSuccess: () => void;
}

interface SetupForm {
    active: boolean;
    maxTradeSize: number;
    stopLoss: number;
    takeProfit: number;
    notes: string;
}

export function CopyTradeSetup({ walletAddress, onClose, onSuccess }: CopyTradeSetupProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<SetupForm>({
        active: true,
        maxTradeSize: 500,
        stopLoss: 10,
        takeProfit: 20,
        notes: ''
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`http://localhost:8000/copytrade/settings/${walletAddress}`);
                if (response.ok) {
                    const data = await response.json();
                    setForm({
                        active: data.active,
                        maxTradeSize: data.max_trade_size,
                        stopLoss: data.stop_loss,
                        takeProfit: data.take_profit,
                        notes: data.notes || ''
                    });
                }
            } catch (err) {
                console.error('Error fetching settings:', err);
            }
        };
        fetchSettings();
    }, [walletAddress]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8000/copytrade/setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    wallet_address: walletAddress,
                    active: form.active,
                    max_trade_size: form.maxTradeSize,
                    stop_loss: form.stopLoss,
                    take_profit: form.takeProfit,
                    notes: form.notes
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || 'Failed to setup copy trading');
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Settings className="text-blue-400" />
                        Setup Copy Trading
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                        <input
                            type="checkbox"
                            checked={form.active}
                            onChange={(e) => setForm(prev => ({
                                ...prev,
                                active: e.target.checked
                            }))}
                            className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                        />
                        <label className="text-white">Enable Copy Trading</label>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-gray-300 text-sm flex items-center gap-2">
                                <DollarSign size={16} />
                                Maximum Trade Size (USD)
                            </label>
                            <input
                                type="number"
                                value={form.maxTradeSize}
                                onChange={(e) => setForm(prev => ({
                                    ...prev,
                                    maxTradeSize: Number(e.target.value)
                                }))}
                                className="w-full px-3 py-2 bg-gray-700 rounded text-white mt-1"
                                min="0"
                                step="10"
                            />
                        </div>

                        <div>
                            <label className="text-gray-300 text-sm flex items-center gap-2">
                                <Target size={16} />
                                Stop Loss (%)
                            </label>
                            <input
                                type="number"
                                value={form.stopLoss}
                                onChange={(e) => setForm(prev => ({
                                    ...prev,
                                    stopLoss: Number(e.target.value)
                                }))}
                                className="w-full px-3 py-2 bg-gray-700 rounded text-white mt-1"
                                min="0"
                                max="100"
                                step="0.1"
                            />
                        </div>

                        <div>
                            <label className="text-gray-300 text-sm flex items-center gap-2">
                                <Target size={16} />
                                Take Profit (%)
                            </label>
                            <input
                                type="number"
                                value={form.takeProfit}
                                onChange={(e) => setForm(prev => ({
                                    ...prev,
                                    takeProfit: Number(e.target.value)
                                }))}
                                className="w-full px-3 py-2 bg-gray-700 rounded text-white mt-1"
                                min="0"
                                max="1000"
                                step="0.1"
                            />
                        </div>

                        <div>
                            <label className="text-gray-300 text-sm">Notes</label>
                            <textarea
                                value={form.notes}
                                onChange={(e) => setForm(prev => ({
                                    ...prev,
                                    notes: e.target.value
                                }))}
                                className="w-full px-3 py-2 bg-gray-700 rounded text-white mt-1"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                            {loading ? 'Setting up...' : 'Start Copy Trading'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}