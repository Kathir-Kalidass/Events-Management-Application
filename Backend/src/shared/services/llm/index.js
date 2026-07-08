import OpenAI from 'openai';
import logger from '../../utils/logger.js';
import PROMPTS from './prompts.js';
import templates from './ruleBasedFallback.js';

let openai = null;
let useLLM = false;

export function initLLM() {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  if (apiKey) {
    openai = new OpenAI({ apiKey, baseURL });
    useLLM = true;
    logger.info('LLM service initialized with OpenAI-compatible provider');
    return { available: true, provider: 'openai', model: process.env.LLM_MODEL || 'gpt-4o-mini' };
  }

  logger.warn('No OPENAI_API_KEY found. LLM features will use rule-based fallback.');
  return { available: false, provider: 'rule-based-fallback' };
}

const defaultModel = () => process.env.LLM_MODEL || 'gpt-4o-mini';

async function queryLLM(system, user, model = defaultModel()) {
  if (!useLLM || !openai) return null;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: user.includes('JSON') ? { type: 'json_object' } : undefined,
    });

    return response.choices[0].message.content;
  } catch (err) {
    logger.error(`LLM query failed: ${err.message}`);
    return null;
  }
}

export async function generateContent(type, params, options = {}) {
  const promptKey = options.promptKey || type;
  const prompt = PROMPTS[promptKey];

  if (prompt && useLLM) {
    const { system, user } = prompt(params);
    const result = await queryLLM(system, user, options.model);
    if (result) {
      try {
        return JSON.parse(result);
      } catch {
        return result;
      }
    }
  }

  const fallbackKey = options.fallbackKey || type;
  const fn = templates[fallbackKey];
  if (fn) {
    try {
      return fn(params);
    } catch (err) {
      logger.error(`Fallback failed for ${type}: ${err.message}`);
    }
  }

  if (prompt && !useLLM) {
    const { user } = prompt(params);
    return { generatedText: user, note: 'Rule-based fallback used — set OPENAI_API_KEY for AI-generated content' };
  }

  return null;
}

export async function generateText(type, params, options = {}) {
  const promptKey = options.promptKey || type;
  const prompt = PROMPTS[promptKey];

  if (prompt && useLLM) {
    const { system, user } = prompt(params);
    const result = await queryLLM(system, user, options.model);
    if (result) return result;
  }

  const fallbackKey = options.fallbackKey || type;
  const fn = templates[fallbackKey];
  if (fn) {
    try {
      const result = fn(params);
      return typeof result === 'string' ? result : JSON.stringify(result);
    } catch (err) {
      logger.error(`Fallback failed for ${type}: ${err.message}`);
    }
  }

  return null;
}

export async function checkHealth() {
  if (!useLLM || !openai) {
    return { available: false, provider: 'none', message: 'No LLM provider configured. Set OPENAI_API_KEY.' };
  }

  try {
    const models = await openai.models.list();
    return { available: true, provider: 'openai', model: defaultModel(), modelsAvailable: models.data.length };
  } catch (err) {
    return { available: false, provider: 'openai', error: err.message };
  }
}

export default { initLLM, generateContent, generateText, checkHealth };
