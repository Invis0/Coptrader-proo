from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text, exc
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Union
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import json
import logging
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CopyTrading Analytics API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configuration
DATABASE_URL = "postgresql://postgres:Invis0704@localhost:5432/wallet_analyzer"
engine = create_engine(DATABASE_URL, pool_size=5, max_overflow=10)

# Pydantic Models with improved validation
class TokenStat(BaseModel):
    symbol: str
    roi: float
    volume: float
    num_trades: int
    profit: float

class RiskMetrics(BaseModel):
    max_drawdown: float = Field(default=0.0, ge=0.0, le=100.0)
    sharpe_ratio: float = Field(default=0.0)
    sortino_ratio: Optional[float] = None
    risk_rating: str = Field(default="Medium")

class WalletScore(BaseModel):
    address: str
    total_score: float = Field(ge=0.0, le=100.0)
    roi_score: float = Field(ge=0.0, le=100.0)
    consistency_score: float = Field(ge=0.0, le=100.0)
    volume_score: float = Field(ge=0.0, le=100.0)
    risk_score: float = Field(ge=0.0, le=100.0)
    trade_count: int = Field(ge=0)
    win_rate: float = Field(ge=0.0, le=100.0)
    avg_profit: float
    max_drawdown: float = Field(ge=0.0, le=100.0)
    sharpe_ratio: float
    token_stats: List[Dict] = Field(default_factory=list)
    risk_metrics: Dict = Field(default_factory=dict)

class SystemStats(BaseModel):
    total_wallets: int = Field(ge=0)
    average_roi: float
    average_winrate: float
    top_performers: int = Field(ge=0)
    best_roi: float
    worst_roi: float
    trends: List[Dict] = Field(default_factory=list)

def calculate_wallet_scores(row: pd.Series) -> dict:
    """Calculate composite scores for a wallet with error handling"""
    try:
        # Handle potential NULL/None values
        risk_metrics = json.loads(row['risk_metrics']) if row['risk_metrics'] and not pd.isna(row['risk_metrics']) else {}
        token_metrics = json.loads(row['token_metrics']) if row['token_metrics'] and not pd.isna(row['token_metrics']) else []
        
        # Calculate individual scores with bounds checking
        roi_score = min(max(row['roi_percentage'] / 100, 0), 1) * 100 if pd.notna(row['roi_percentage']) else 0
        consistency = float(row['consistency_score']) if pd.notna(row['consistency_score']) else 50.0
        volume_score = min(row['total_volume'] / 100000, 1) * 100 if pd.notna(row['total_volume']) else 0
        trade_score = min(row['total_trades'] / 200, 1) * 100 if pd.notna(row['total_trades']) else 0
        
        # Weighted score calculation
        total_score = (
            roi_score * 0.3 +
            consistency * 0.3 +
            volume_score * 0.2 +
            trade_score * 0.2
        )
        
        return {
            "total_score": round(total_score, 2),
            "roi_score": round(roi_score, 2),
            "consistency_score": round(consistency, 2),
            "volume_score": round(volume_score, 2),
            "risk_score": round(100 - (risk_metrics.get('max_drawdown', 0) or 0), 2),
            "risk_metrics": risk_metrics,
            "token_stats": token_metrics
        }
    except Exception as e:
        logger.error(f"Error calculating wallet scores: {e}")
        # Return default scores on error
        return {
            "total_score": 0,
            "roi_score": 0,
            "consistency_score": 0,
            "volume_score": 0,
            "risk_score": 0,
            "risk_metrics": {},
            "token_stats": []
        }
@app.get("/wallets/top", response_model=List[WalletScore])
async def get_top_wallets(
    min_roi: float = Query(0.0, ge=0),
    min_win_rate: float = Query(0.0, ge=0, le=100),
    min_trades: int = Query(0, ge=0),
    min_volume: float = Query(0.0, ge=0),
    min_profit: float = Query(0.0, ge=0),
    risk_level: Optional[str] = None,
    token_type: Optional[str] = None,
    time_frame: str = "7d",
    limit: int = Query(50, ge=1, le=100)
):
    """Get top performing wallets based on criteria with improved error handling"""
    try:
        query = """
        WITH filtered_wallets AS (
            SELECT 
                wa.wallet_address,
                wa.total_pnl_usd,
                wa.winrate,
                wa.total_trades,
                wa.roi_percentage,
                wa.avg_trade_size,
                wa.total_volume,
                wa.consistency_score,
                COALESCE(wa.token_metrics, '[]'::jsonb) as token_metrics,
                COALESCE(wa.risk_metrics, '{}'::jsonb) as risk_metrics
            FROM wallet_analysis wa
            WHERE wa.roi_percentage >= :min_roi
            AND wa.winrate >= :min_win_rate
            AND wa.total_trades >= :min_trades
            AND wa.total_volume >= :min_volume
            AND wa.total_pnl_usd >= :min_profit
            AND CASE 
                WHEN :risk_level IS NOT NULL THEN 
                    COALESCE(wa.risk_metrics->>'risk_rating', 'Medium') = :risk_level
                ELSE true
            END
        )
        SELECT * FROM filtered_wallets
        ORDER BY roi_percentage DESC
        LIMIT :limit
        """

        with engine.connect() as conn:
            result = conn.execute(
                text(query),
                {
                    "min_roi": min_roi,
                    "min_win_rate": min_win_rate,
                    "min_trades": min_trades,
                    "min_volume": min_volume,
                    "min_profit": min_profit,
                    "risk_level": risk_level,
                    "limit": limit
                }
            )
            
            rows = result.fetchall()
            logger.info(f"Found {len(rows)} wallets matching criteria")
            
            if not rows:
                return []

            wallets = []
            for row in rows:
                row_dict = dict(row._mapping)
                scores = calculate_wallet_scores(row_dict)
                
                try:
                    wallet = WalletScore(
                        address=row_dict['wallet_address'],
                        trade_count=row_dict['total_trades'],
                        win_rate=row_dict['winrate'],
                        avg_profit=row_dict['total_pnl_usd'] / row_dict['total_trades'] if row_dict['total_trades'] > 0 else 0,
                        max_drawdown=scores['risk_metrics'].get('max_drawdown', 0),
                        sharpe_ratio=scores['risk_metrics'].get('sharpe_ratio', 0),
                        token_stats=json.loads(str(row_dict['token_metrics'])) if row_dict['token_metrics'] else [],
                        risk_metrics=json.loads(str(row_dict['risk_metrics'])) if row_dict['risk_metrics'] else {},
                        total_score=scores['total_score'],
                        roi_score=scores['roi_score'],
                        consistency_score=scores['consistency_score'],
                        volume_score=scores['volume_score'],
                        risk_score=scores['risk_score']
                    )
                    wallets.append(wallet)
                except Exception as e:
                    logger.error(f"Error processing wallet {row_dict['wallet_address']}: {e}")
                    continue

            return sorted(wallets, key=lambda x: x.total_score, reverse=True)

    except exc.SQLAlchemyError as e:
        logger.error(f"Database error in get_top_wallets: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error in get_top_wallets: {e}")
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/wallet/{address}")
async def get_wallet_details(address: str):
    """Get detailed metrics for a specific wallet with NULL handling"""
    try:
        query = """
        SELECT 
            wa.wallet_address,
            COALESCE(wa.total_pnl_usd, 0) as total_pnl_usd,
            COALESCE(wa.winrate, 0) as winrate,
            COALESCE(wa.total_trades, 0) as total_trades,
            COALESCE(wa.roi_percentage, 0) as roi_percentage,
            COALESCE(wa.avg_trade_size, 0) as avg_trade_size,
            COALESCE(wa.total_volume, 0) as total_volume,
            COALESCE(wa.consistency_score, 0) as consistency_score,
            COALESCE(wa.token_metrics, '[]'::jsonb) as token_metrics,
            COALESCE(wa.risk_metrics, '{}'::jsonb) as risk_metrics,
            wa.last_updated
        FROM wallet_analysis wa
        WHERE wa.wallet_address = :address
        """

        with engine.connect() as conn:
            result = conn.execute(text(query), {"address": address}).first()
            
            if not result:
                raise HTTPException(status_code=404, detail="Wallet not found")
            
            # Convert row to dict
            wallet_data = dict(result._mapping)
            
            # Process token metrics and risk metrics
            token_metrics = json.loads(str(wallet_data['token_metrics']))
            risk_metrics = json.loads(str(wallet_data['risk_metrics']))
            
            # Calculate performance scores
            scores = calculate_wallet_scores(wallet_data)
            
            return {
                "address": wallet_data['wallet_address'],
                "total_pnl": float(wallet_data['total_pnl_usd']),
                "win_rate": float(wallet_data['winrate']),
                "trade_count": int(wallet_data['total_trades']),
                "avg_trade_size": float(wallet_data['avg_trade_size']),
                "roi": float(wallet_data['roi_percentage']),
                "volume": float(wallet_data['total_volume']),
                "consistency_score": float(wallet_data['consistency_score']),
                "tokens": token_metrics,
                "risk_metrics": risk_metrics,
                "scores": scores,
                "last_updated": wallet_data['last_updated']
            }
            
    except Exception as e:
        logger.error(f"Error fetching wallet details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/wallets")
async def get_wallets_page(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = "roi_percentage",
    sort_desc: bool = True
):
    """Get paginated list of all wallets"""
    try:
        query = f"""
        SELECT 
            wa.*,
            COALESCE(wa.token_metrics, '[]'::jsonb) as token_metrics,
            COALESCE(wa.risk_metrics, '{{}}'::jsonb) as risk_metrics
        FROM wallet_analysis wa
        ORDER BY {sort_by} {'DESC' if sort_desc else 'ASC'}
        LIMIT :limit OFFSET :offset
        """

        count_query = "SELECT COUNT(*) FROM wallet_analysis"

        with engine.connect() as conn:
            # Get total count
            total_count = conn.execute(text(count_query)).scalar()
            
            # Get page of wallets
            result = conn.execute(
                text(query),
                {
                    "limit": page_size,
                    "offset": (page - 1) * page_size
                }
            )
            
            wallets = []
            for row in result:
                row_dict = dict(row._mapping)
                scores = calculate_wallet_scores(row_dict)
                
                wallet = {
                    "address": row_dict['wallet_address'],
                    "total_pnl": float(row_dict['total_pnl_usd']),
                    "win_rate": float(row_dict['winrate']),
                    "trade_count": int(row_dict['total_trades']),
                    "roi": float(row_dict['roi_percentage']),
                    "volume": float(row_dict['total_volume']),
                    **scores
                }
                wallets.append(wallet)

            return {
                "total": total_count,
                "page": page,
                "page_size": page_size,
                "total_pages": (total_count + page_size - 1) // page_size,
                "wallets": wallets
            }

    except Exception as e:
        logger.error(f"Error fetching wallets page: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/copytrade/settings/{address}")
async def get_copy_trade_settings(address: str):
    """Get copy trade settings for a wallet"""
    try:
        query = """
        SELECT 
            active,
            max_trade_size,
            stop_loss,
            take_profit,
            notes
        FROM copy_trade_setups
        WHERE wallet_address = :address
        """
        
        with engine.connect() as conn:
            result = conn.execute(text(query), {"address": address}).first()
            
            if not result:
                # Return default settings if none exist
                return {
                    "active": False,
                    "max_trade_size": 500,
                    "stop_loss": 10,
                    "take_profit": 20,
                    "notes": ""
                }
            
            return dict(result._mapping)
            
    except Exception as e:
        logger.error(f"Error fetching copy trade settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/copytrade/setup")
async def setup_copy_trade(setup: dict):
    """Create or update copy trade setup"""
    try:
        query = """
        INSERT INTO copy_trade_setups (
            wallet_address, active, max_trade_size,
            stop_loss, take_profit, notes, updated_at
        ) VALUES (
            :wallet_address, :active, :max_trade_size,
            :stop_loss, :take_profit, :notes, CURRENT_TIMESTAMP
        )
        ON CONFLICT (wallet_address) 
        DO UPDATE SET
            active = EXCLUDED.active,
            max_trade_size = EXCLUDED.max_trade_size,
            stop_loss = EXCLUDED.stop_loss,
            take_profit = EXCLUDED.take_profit,
            notes = EXCLUDED.notes,
            updated_at = CURRENT_TIMESTAMP
        """
        
        with engine.connect() as conn:
            result = conn.execute(text(query), setup)
            conn.commit()
            
            return {"status": "success", "message": "Copy trade setup updated"}
            
    except Exception as e:
        logger.error(f"Error updating copy trade setup: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics/{address}")
async def get_wallet_analytics(address: str, timeframe: str = "7d"):
    """Get detailed analytics for a wallet"""
    try:
        days = int(timeframe.replace("d", ""))
        
        query = """
        WITH daily_stats AS (
            SELECT 
                DATE_TRUNC('day', created_at) as date,
                COUNT(*) as trades,
                SUM(CASE WHEN status = 'executed' THEN 1 ELSE 0 END) as successful,
                SUM(CASE 
                    WHEN trade_type = 'sell' AND status = 'executed'
                    THEN price_usd * amount
                    ELSE -price_usd * amount
                    END) as daily_pnl
            FROM trades
            WHERE wallet_address = :address
            AND created_at >= NOW() - :days * INTERVAL '1 day'
            GROUP BY DATE_TRUNC('day', created_at)
        )
        SELECT json_agg(ds.*) as stats
        FROM daily_stats ds
        """
        
        with engine.connect() as conn:
            result = conn.execute(
                text(query), 
                {
                    "address": address,
                    "days": days
                }
            ).first()
            
            return {
                "daily_stats": json.loads(result.stats) if result.stats else []
            }
            
    except Exception as e:
        logger.error(f"Error fetching wallet analytics: {e}")
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/stats/overview")
async def get_system_stats():
    """Get overall system statistics and trends"""
    try:
        with engine.connect() as conn:
            # Get basic stats
            basic_stats_query = """
                SELECT 
                    COUNT(*) as total_wallets,
                    AVG(roi_percentage) as avg_roi,
                    AVG(winrate) as avg_winrate,
                    COUNT(*) FILTER (WHERE roi_percentage > 50 AND winrate > 60) as top_performers,
                    MAX(roi_percentage) as best_roi,
                    MIN(roi_percentage) as worst_roi
                FROM wallet_analysis
                WHERE roi_percentage > 0
                  AND winrate > 0
            """
            
            basic_stats = conn.execute(text(basic_stats_query)).first()
            
            # Get trend data (last 7 days vs previous 7 days)
            trend_query = """
                WITH current_week AS (
                    SELECT 
                        AVG(roi_percentage) as curr_roi,
                        AVG(winrate) as curr_winrate,
                        COUNT(*) as curr_wallet_count,
                        COUNT(*) FILTER (WHERE roi_percentage > 50 AND winrate > 60) as curr_top_performers
                    FROM wallet_analysis
                    WHERE last_updated >= NOW() - INTERVAL '7 days'
                ),
                prev_week AS (
                    SELECT 
                        AVG(roi_percentage) as prev_roi,
                        AVG(winrate) as prev_winrate,
                        COUNT(*) as prev_wallet_count,
                        COUNT(*) FILTER (WHERE roi_percentage > 50 AND winrate > 60) as prev_top_performers
                    FROM wallet_analysis
                    WHERE last_updated >= NOW() - INTERVAL '14 days'
                        AND last_updated < NOW() - INTERVAL '7 days'
                )
                SELECT 
                    ROUND(((curr_roi - prev_roi) / NULLIF(prev_roi, 0) * 100)::numeric, 2) as roi_change,
                    ROUND(((curr_winrate - prev_winrate) / NULLIF(prev_winrate, 0) * 100)::numeric, 2) as winrate_change,
                    ROUND(((curr_wallet_count - prev_wallet_count) / NULLIF(prev_wallet_count, 0) * 100)::numeric, 2) as wallet_count_change,
                    ROUND(((curr_top_performers - prev_top_performers) / NULLIF(prev_top_performers, 0) * 100)::numeric, 2) as top_performers_change
                FROM current_week, prev_week
            """
            
            trends = conn.execute(text(trend_query)).first()
            
            return {
                "total_wallets": basic_stats.total_wallets,
                "average_roi": round(float(basic_stats.avg_roi or 0), 2),
                "average_winrate": round(float(basic_stats.avg_winrate or 0), 2),
                "top_performers": basic_stats.top_performers,
                "best_roi": round(float(basic_stats.best_roi or 0), 2),
                "worst_roi": round(float(basic_stats.worst_roi or 0), 2),
                "trends": [{
                    "roi_change": float(trends.roi_change or 0),
                    "winrate_change": float(trends.winrate_change or 0),
                    "wallet_count_change": float(trends.wallet_count_change or 0),
                    "top_performers_change": float(trends.top_performers_change or 0)
                }] if trends else []
            }
            
    except Exception as e:
        logger.error(f"Error in get_system_stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global error handler caught: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred"}
    )
@app.get("/alerts")
async def get_alerts(user_id: str):
    """Get user alerts"""
    # Implement alerts functionality
    return {"alerts": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")