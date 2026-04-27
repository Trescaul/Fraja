import { GoogleGenerativeAI } from "@google/generative-ai";

// Vite uses import.meta.env and variables MUST start with VITE_ to be visible in the browser
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Simple in-memory cache to prevent redundant calls and save quota
const analysisCache = new Map<string, { data: any, timestamp: number }>();
const COOL_DOWN = 300000; // 5 minutes cache

/**
 * Helper to handle retries for rate limits or network hiccups
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = error?.status === 429 || error?.status === 500 || String(error).includes("quota");
    
    if (retries > 0 && isRetryable) {
      console.warn(`[AI] Request failed. Retrying in ${delay}ms...`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * General technical analysis for the AI Intel tab
 */
export async function getGeneralAnalysis(symbol: string, currentPrice?: number) {
  console.log(`[CORTEX] Analyzing ${symbol} @ ${currentPrice || 'unknown'}`);
  const cacheKey = `general-${symbol}-${currentPrice}`;
  
  const cached = analysisCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < COOL_DOWN)) {
    return cached.data;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await withRetry(async () => {
    const prompt = `[SYSTEM: COMMAND_LEVEL_ULTRA_INSTITUTIONAL]
    [ENTITY: CORTEX_STRATEGIST_QUANT_V4]
    ACT AS A SENIOR INSTITUTIONAL QUANT FOR ${symbol}. 
    CURRENT SPOT PRICE: ${currentPrice || 'LATEST'}

    YOUR MISSION: Provide exact entry points, levels, and momentum bias.
    
    RESPONSE FORMAT: 
    Return a Markdown report starting with # ⚡ CORTEX OMNI-SYNTHESIS.
    Include sections for MARKET STATE, KILL ZONES (Sniper Entries), and SMART MONEY DATA.
    
    Final line must be: "CONFIDENCE_SCORE: [number between 70-98]"`;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    
    // Extract confidence score for the UI monitor, default to 85 if not found
    const confidenceMatch = text.match(/CONFIDENCE_SCORE:\s*(\d+)/);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 85;

    return {
      text: text.replace(/CONFIDENCE_SCORE:\s*\d+/, ''), // Clean score from display text
      confidence: confidence
    };
  });

  analysisCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}

/**
 * Deep market analysis using multiple timeframes (MTF)
 */
export async function analyzeMarket(ltfCandles: any[], ltf: string, symbol: string = "BTC/USDT") {
  const lastCandleTime = ltfCandles[ltfCandles.length - 1]?.time;
  const cacheKey = `${symbol}-${ltf}-${lastCandleTime}`;
  
  const cached = analysisCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < COOL_DOWN)) {
    return cached.data;
  }

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `Perform institutional-grade SMC analysis for ${symbol}.
  Data: ${JSON.stringify(ltfCandles.slice(-20))}
  
  OUTPUT FORMAT (STRICT JSON):
  {
    "Signal": "BUY" | "SELL" | "HOLD",
    "Confidence": number (0-100),
    "Reasoning": "Technical explanation.",
    "Analysis": {
      "MacroTrend": "Bullish" | "Bearish",
      "KeyLevel": "Entry Price"
    },
    "SL": "Price",
    "RiskReward": "1:3"
  }`;

  const result = await withRetry(async () => {
    const response = await model.generateContent(prompt);
    return JSON.parse(response.response.text() || "{}");
  });
  
  analysisCache.set(cacheKey, { data: result, timestamp: Date.now() });
  return result;
}
