import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Simple in-memory cache to prevent redundant calls
const analysisCache = new Map<string, { data: any, timestamp: number }>();
const COOL_DOWN = 300000; // 5 minutes client cache

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = error?.status === 429 || error?.status === 500 || String(error).includes("Rpc failed") || String(error).includes("quota");
    
    if (retries > 0 && isRetryable) {
      console.warn(`[AI] Request failed. Retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function getGeneralAnalysis(symbol: string, currentPrice?: number) {
  console.log(`[CORTEX] Analyzing ${symbol} @ ${currentPrice || 'unknown'}`);
  const cacheKey = `general-${symbol}-${currentPrice}`;
  const cached = analysisCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < COOL_DOWN)) {
    return cached.data;
  }

  const result = await withRetry(async () => {
    const prompt = `[SYSTEM: COMMAND_LEVEL_ULTRA_INSTITUTIONAL]
    [ENTITY: CORTEX_STRATEGIST_QUANT_V4]
    [MODE: OMNI_SYNTHESIS_EXECUTION]

    ACT AS A SENIOR INSTITUTIONAL QUANT FOR ${symbol}. 
    CURRENT MARKET DATA: [EXACT REAL-TIME SPOT PRICE: ${currentPrice || 'LATEST'}]

    CRITICAL INSTRUCTION: You MUST anchor all of your analysis, target levels, entries, and invalidations EXACTLY around the provided SPOT PRICE of ${currentPrice}. Do NOT use your pre-trained knowledge of what the price of ${symbol} "should" be. If I give you a price of ${currentPrice}, treat it as absolute truth for this simulated execution.

    YOUR MISSION: Provide the most powerful, clean, and exact entry points by synthesizing deep technical data with macroeconomic sentiment.

    STRATEGIC SYNTHESIS REQUIREMENTS (SIMULATE/ANALYZE BASED ON CURRENT MARKET CONTEXT):
    1. GENERAL DIRECTION: Identify the immediate structural bias based on standard price action near ${currentPrice}.
    2. KEY LEVELS: Give precise support and resistance zones based on pure price geometry.
    3. MOMENTUM POTENTIAL: Does the current level suggest a breakout, breakdown, or chop?
    
    RESPONSE FORMAT (MANDATORY MARKDOWN STRUCTURE):
    
    # ⚡ CORTEX OMNI-SYNTHESIS: ${symbol}
    
    ### 🛡️ MARKET STATE
    *   **CORE DIRECTION**: [BULLISH | BEARISH | NEUTRAL]
    *   **MOMENTUM**: [e.g., Expansion / Consolidation]
    *   **PRIMARY FOCUS**: [Brief overall summary of what to watch around ${currentPrice}]

    ### 📍 THE KILL ZONES (SNIPER ENTRIES)
    
    **🔴 SCALP ENTRIES (QUICK/SMALL MOVES)**
    *   **ENTRY ZONE**: [Precise Price Range near ${currentPrice}]
    *   **INVALIDATION (SL)**: [Precise Price]
    *   **PRIMARY LIQUIDITY TARGET**: [Price]

    **🟣 SWING ENTRIES (BIG MACRO MOVES)**
    *   **CORE ENTRY ZONE**: [Key Level]
    *   **MACRO INVALIDATION (SL)**: [Price]
    *   **ULTIMATE TARGET**: [Price]

    ### 🔍 SMART MONEY DATA POINTS
    *   **KEY SUPPORTS**: Immediate floors below ${currentPrice}.
    *   **KEY RESISTANCE**: Immediate ceilings above ${currentPrice}.
    *   **TRAP AVOIDANCE**: Current potential fakeout zone.

    [FINALIZE WITH A "CORTEX_ALPHA" ONE-LINER TO INSTRUCT THE USER]`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  });

  analysisCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

const TIMEFRAME_MAP: Record<string, string[]> = {
  "1m": ["5m", "15m"],
  "5m": ["15m", "1h"],
  "15m": ["1h", "4h"],
  "1h": ["4h", "1d"],
  "4h": ["1d", "1w"],
  "1d": ["1w"],
};

async function fetchHTFData(symbol: string, interval: string) {
  try {
    const res = await fetch(`/api/history?symbol=${encodeURIComponent(symbol)}&interval=${interval}`);
    const data = await res.json();
    return Array.isArray(data) ? data.slice(-20) : [];
  } catch (e) {
    console.error(`Failed to fetch HTF ${interval}`, e);
    return [];
  }
}

export async function analyzeMarket(ltfCandles: any[], ltf: string, symbol: string = "BTC/USDT") {
  const lastCandleTime = ltfCandles[ltfCandles.length - 1]?.time;
  const cacheKey = `${symbol}-${ltf}-${lastCandleTime}`;
  
  const cached = analysisCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < COOL_DOWN)) {
    console.log("[AI Client] Using cached MTF analysis");
    return cached.data;
  }

  // Fetch High Timeframe (HTF) and Medium Timeframe (MTF) for Top-Down Confluence
  const htfIntervals = TIMEFRAME_MAP[ltf] || ["1h", "1d"];
  const htfDataPromises = htfIntervals.map(interval => fetchHTFData(symbol, interval));
  const htfResults = await Promise.all(htfDataPromises);

  let datasetsContext = `Timeframe: ${ltf} (Execution)\n${JSON.stringify(ltfCandles.slice(-20))}\n\n`;
  htfIntervals.forEach((interval, idx) => {
    datasetsContext += `Timeframe: ${interval} (Context)\n${JSON.stringify(htfResults[idx])}\n\n`;
  });

  const prompt = `Perform a high-precision, institutional-grade Technical & Sentiment Analysis for ${symbol}.
You are provided with data from multiple timeframes (LTF for execution, HTF for context).

CRITICAL INSTRUCTION: You MUST anchor all of your analysis, target levels, entries, and invalidations EXACTLY around the latest CLOSE price in the provided LTF dataset. Do NOT use your pre-trained knowledge of what the price of ${symbol} "should" be. Treat the provided candlestick data as absolute truth.

YOUR MISSION: Synthesize advanced price action (SMC) with institutional insights (simulated Retail Sentiment, COT data, Fear & Greed) to find extreme high-probability entry points.

MARKET DATA:
${datasetsContext}

STRICT ANALYTICAL REQUIREMENTS:
1. INTRADAY BIAS: Analyze HTF and LTF. Look for precise Market Structure Shifts (MSS) that offer scalping/swing opportunities.
2. SENTIMENT & INSTITUTIONAL FOOTRPINT: Is retail mostly long while smart money is accumulating short? Factor this into the reasoning.
3. POI VERIFICATION: Entry MUST be at a valid LTF Point of Interest (Order Block, Fair Value Gap, Liquidity Void, or Liquidity Sweep).
4. LIQUIDITY ZONES: Identify internal/external range liquidity targets for both scalp and swing.
5. NO HALLUCINATION: If the market is too choppy or lacks clear structure, suggest 'HOLD'.

OUTPUT FORMAT (STRICT JSON):
{
  "Signal": "BUY" | "SELL" | "HOLD",
  "Confidence": number (0-100),
  "Reasoning": "A high-precision technical explanation (max 3 sentences) focusing on sentiment squeeze, structure shift, and confluence.",
  "Analysis": {
    "MacroTrend": "Bullish" | "Bearish" | "Sideways",
    "IntradayBias": "Bullish" | "Bearish" | "Corrective",
    "Sentiment": "e.g., Extreme Retail Longs / COT Bearish",
    "Pattern": "SMC Setup Name (e.g. FVG + Sweep)",
    "KeyLevel": "The precise entry zone (e.g. 64200.50 - 64250.00)"
  },
  "ScalpTarget": "Price as string (Short term liquidity)",
  "SwingTarget": "Price as string (Macro target)",
  "SL": "Price as string",
  "RiskReward": "string (e.g. 1:3.2)"
}

Prioritize high-efficiency execution. We want extreme precision. Return 'HOLD' if confidence is below 75%.`;

  const result = await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || "{}");
  });
  
  // Cache the result
  analysisCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}
