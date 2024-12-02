import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Filter, X, ChevronDown, ChevronUp, 
    TrendingUp, Clock, Activity, DollarSign, 
    Shield, Coins 
} from 'lucide-react';

export interface FilterCriteria {
    minRoi: number;
    minWinRate: number;
    minTrades: number;
    minVolume: number;
    minProfit: number;
    riskLevel: string | null;
    tokenType: string | null;
    timeFrame: string;
}

interface FilterPanelProps {
    criteria: FilterCriteria;
    onChange: (criteria: FilterCriteria) => void;
}

export default function FilterPanel({ criteria, onChange }: FilterPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const riskLevels = ['Low', 'Medium', 'High'];
    const tokenTypes = ['DEX', 'Meme', 'DeFi', 'NFT', 'GameFi'];
    const timeFrames = ['24h', '7d', '30d', 'All'];

    // Reset all filters to default values
    const resetFilters = () => {
        onChange({
            minRoi: 0,
            minWinRate: 0,
            minTrades: 0,
            minVolume: 0,
            minProfit: 0,
            riskLevel: null,
            tokenType: null,
            timeFrame: '7d'
        });
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Filter className="text-blue-500" size={20} />
                    <h2 className="text-xl font-semibold text-white">Advanced Filters</h2>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={resetFilters}
                        className="px-3 py-1 text-sm text-gray-400 hover:text-white"
                    >
                        Reset
                    </button>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-400"
                    >
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>
            </div>

            {/* Filter Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Performance Metrics */}
                            <div className="space-y-4">
                                <h3 className="text-blue-400 font-semibold flex items-center gap-2">
                                    <TrendingUp size={16} />
                                    Performance Metrics
                                </h3>
                                <div>
                                    <label className="text-gray-300 text-sm">Minimum ROI %</label>
                                    <input
                                        type="number"
                                        value={criteria.minRoi}
                                        onChange={(e) => onChange({
                                            ...criteria,
                                            minRoi: Number(e.target.value)
                                        })}
                                        className="w-full px-3 py-2 bg-gray-700 rounded text-white mt-1"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-300 text-sm">Minimum Win Rate %</label>
                                    <input
                                        type="number"
                                        value={criteria.minWinRate}
                                        onChange={(e) => onChange({
                                            ...criteria,
                                            minWinRate: Number(e.target.value)
                                        })}
                                        className="w-full px-3 py-2 bg-gray-700 rounded text-white mt-1"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>

                            {/* Trading Activity */}
                            <div className="space-y-4">
                                <h3 className="text-green-400 font-semibold flex items-center gap-2">
                                    <Activity size={16} />
                                    Trading Activity
                                </h3>
                                <div>
                                    <label className="text-gray-300 text-sm">Minimum Trades</label>
                                    <input
                                        type="number"
                                        value={criteria.minTrades}
                                        onChange={(e) => onChange({
                                            ...criteria,
                                            minTrades: Number(e.target.value)
                                        })}
                                        className="w-full px-3 py-2 bg-gray-700 rounded text-white mt-1"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-300 text-sm">Minimum Volume ($)</label>
                                    <input
                                        type="number"
                                        value={criteria.minVolume}
                                        onChange={(e) => onChange({
                                            ...criteria,
                                            minVolume: Number(e.target.value)
                                        })}
                                        className="w-full px-3 py-2 bg-gray-700 rounded text-white mt-1"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Risk & Token Type */}
                            <div className="space-y-4">
                                <h3 className="text-yellow-400 font-semibold flex items-center gap-2">
                                    <Shield size={16} />
                                    Risk & Token Filters
                                </h3>
                                <div>
                                    <label className="text-gray-300 text-sm">Risk Level</label>
                                    <select
                                        value={criteria.riskLevel || ''}
                                        onChange={(e) => onChange({
                                            ...criteria,
                                            riskLevel: e.target.value || null
                                        })}
                                        className="w-full px-3 py-2 bg-gray-700 rounded text-white mt-1"
                                    >
                                        <option value="">Any</option>
                                        {riskLevels.map(level => (
                                            <option key={level} value={level}>{level}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-gray-300 text-sm">Token Type</label>
                                    <select
                                        value={criteria.tokenType || ''}
                                        onChange={(e) => onChange({
                                            ...criteria,
                                            tokenType: e.target.value || null
                                        })}
                                        className="w-full px-3 py-2 bg-gray-700 rounded text-white mt-1"
                                    >
                                        <option value="">Any</option>
                                        {tokenTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Timeframe Selection */}
                        <div className="mt-6">
                            <h3 className="text-purple-400 font-semibold flex items-center gap-2 mb-3">
                                <Clock size={16} />
                                Time Frame
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {timeFrames.map(frame => (
                                    <button
                                        key={frame}
                                        onClick={() => onChange({
                                            ...criteria,
                                            timeFrame: frame
                                        })}
                                        className={`px-4 py-2 rounded-lg ${
                                            criteria.timeFrame === frame
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        {frame}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        <div className="mt-6 flex flex-wrap gap-2">
                            {Object.entries(criteria).map(([key, value]) => {
                                if (value && value !== 0) {
                                    return (
                                        <div
                                            key={key}
                                            className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                                        >
                                            <span>
                                                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}: {value}
                                            </span>
                                            <X
                                                size={14}
                                                className="cursor-pointer hover:text-red-400"
                                                onClick={() => onChange({
                                                    ...criteria,
                                                    [key]: key.startsWith('min') ? 0 : null
                                                })}
                                            />
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}