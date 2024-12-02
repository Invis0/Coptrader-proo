import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Settings, DollarSign, TrendingDown, 
    TrendingUp, Bell, AlertTriangle 
} from 'lucide-react';

interface GlobalSettings {
    maxConcurrentCopies: number;
    defaultMaxTradeSize: number;
    defaultStopLoss: number;
    defaultTakeProfit: number;
    notifications: {
        onTrade: boolean;
        onStopLoss: boolean;
        onTakeProfit: boolean;
        dailySummary: boolean;
    };
    riskManagement: {
        maxDailyLoss: number;
        maxDrawdown: number;
        pauseOnLoss: boolean;
    };
}

interface SettingsModalProps {
    onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
    const [settings, setSettings] = useState<GlobalSettings>({
        maxConcurrentCopies: 5,
        defaultMaxTradeSize: 500,
        defaultStopLoss: 10,
        defaultTakeProfit: 20,
        notifications: {
            onTrade: true,
            onStopLoss: true,
            onTakeProfit: true,
            dailySummary: true,
        },
        riskManagement: {
            maxDailyLoss: 1000,
            maxDrawdown: 20,
            pauseOnLoss: true,
        }
    });

    const saveSettings = async () => {
        try {
            const response = await fetch('http://localhost:8000/copytrade/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });

            if (!response.ok) throw new Error('Failed to save settings');
            onClose();
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
            <div className="bg-gray-800 rounded-lg w-full max-w-2xl m-4">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <Settings className="text-blue-400" size={24} />
                            <h2 className="text-xl font-semibold text-white">
                                Global Copy Trading Settings
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white"
                        >
                            ×
                        </button>
                    </div>

                    {/* General Settings */}
                    <div className="space-y-6 mb-8">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <DollarSign className="text-green-400" />
                            Trade Settings
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-300 text-sm">
                                    Max Concurrent Copies
                                </label>
                                <input
                                    type="number"
                                    value={settings.maxConcurrentCopies}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        maxConcurrentCopies: Number(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 bg-gray-700 rounded text-white mt-1"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm">
                                    Default Max Trade Size ($)
                                </label>
                                <input
                                    type="number"
                                    value={settings.defaultMaxTradeSize}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        defaultMaxTradeSize: Number(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 bg-gray-700 rounded text-white mt-1"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Risk Management */}
                    <div className="space-y-6 mb-8">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <AlertTriangle className="text-yellow-400" />
                            Risk Management
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-300 text-sm">
                                    Default Stop Loss (%)
                                </label>
                                <input
                                    type="number"
                                    value={settings.defaultStopLoss}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        defaultStopLoss: Number(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 bg-gray-700 rounded text-white mt-1"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm">
                                    Default Take Profit (%)
                                </label>
                                <input
                                    type="number"
                                    value={settings.defaultTakeProfit}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        defaultTakeProfit: Number(e.target.value)
                                    })}
                                    className="w-full px-3 py-2 bg-gray-700 rounded text-white mt-1"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm">
                                    Max Daily Loss ($)
                                </label>
                                <input
                                    type="number"
                                    value={settings.riskManagement.maxDailyLoss}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        riskManagement: {
                                            ...settings.riskManagement,
                                            maxDailyLoss: Number(e.target.value)
                                        }
                                    })}
                                    className="w-full px-3 py-2 bg-gray-700 rounded text-white mt-1"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="text-gray-300 text-sm">
                                    Max Drawdown (%)
                                </label>
                                <input
                                    type="number"
                                    value={settings.riskManagement.maxDrawdown}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        riskManagement: {
                                            ...settings.riskManagement,
                                            maxDrawdown: Number(e.target.value)
                                        }
                                    })}
                                    className="w-full px-3 py-2 bg-gray-700 rounded text-white mt-1"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={settings.riskManagement.pauseOnLoss}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    riskManagement: {
                                        ...settings.riskManagement,
                                        pauseOnLoss: e.target.checked
                                    }
                                })}
                                className="rounded bg-gray-700 border-gray-600"
                            />
                            <label className="text-gray-300">
                                Pause copying when daily loss limit is reached
                            </label>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="space-y-4 mb-8">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Bell className="text-purple-400" />
                            Notifications
                        </h3>
                        
                        <div className="space-y-3">
                            {Object.entries(settings.notifications).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={value}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            notifications: {
                                                ...settings.notifications,
                                                [key]: e.target.checked
                                            }
                                        })}
                                        className="rounded bg-gray-700 border-gray-600"
                                    />
                                    <label className="text-gray-300">
                                        {key.replace(/([A-Z])/g, ' $1')
                                            .replace(/^./, str => str.toUpperCase())}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveSettings}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}