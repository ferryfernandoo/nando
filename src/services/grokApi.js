// Deepseek API Service with Orion AI Identity & Advanced Context Memory
import { memoryService } from './memoryService.js';
import { ragService } from './ragService.js';
import { API_BASE_URL } from '../apiConfig.js';

const isRagRelevantMessage = (message = '') => {
  if (!message || typeof message !== 'string') return false;
  const normalized = message.toLowerCase();
  const triggerTerms = [
    'orion', 'deepernova', 'deeper nova', 'misi', 'visi', 'fitur', 'produk',
    'tim', 'donasi', 'panduan', 'dokumen', 'manual', 'spesifikasi', 'roadmap',
    'company', 'company info', 'knowledge base', 'pengetahuan', 'layanan',
    'harga', 'pricing', 'kebijakan', 'policy', 'team', 'ceo', 'founder'
  ];
  return triggerTerms.some(term => normalized.includes(term));
};

// Personality profiles for Orion AI with different communication styles
const PERSONALITIES = {
  formal: {
    id: 'formal',
    name: 'Formal',
    emoji: '💼',
    description: 'Professional & Direct',
    systemPromptAppend: `

GAYA KEPRIBADIAN: FORMAL
- Komunikasi profesional, terstruktur, dan langsung
- Gunakan bahasa yang tepat dan formal
- Fokus pada akurasi dan kredibilitas
- Jawaban singkat dan efisien
- Hindari bahasa santai atau slang
- Boleh pakai 1-2 emoji ringan untuk membuat jawaban lebih hangat dan tidak kaku`,
  },
  casual: {
    id: 'casual',
    name: 'Casual',
    emoji: '😎',
    description: 'Relaxed & Fun',
    systemPromptAppend: `

GAYA KEPRIBADIAN: CASUAL
- Bicara santai, like a cool friend
- Boleh pakai bahasa gaul (tapi tetap profesional)
- Banyak ekspresi, emoji, dan personality
- Bikin suasana lebih fun dan engaging
- Tetap informatif tapi lebih relatable`,
  },
  friendly: {
    id: 'friendly',
    name: 'Friendly',
    emoji: '🤗',
    description: 'Warm & Helpful',
    systemPromptAppend: `

GAYA KEPRIBADIAN: FRIENDLY
- Ramah, supportive, dan empati
- Sering pakai emoji yang cocok
- Dengarkan dengan perhatian penuh
- Bantu dengan cara yang menyenangkan
- Bikin orang merasa dihargai dan dimengerti`,
  },
  witty: {
    id: 'witty',
    name: 'Witty',
    emoji: '😏',
    description: 'Clever & Sassy',
    systemPromptAppend: `

GAYA KEPRIBADIAN: WITTY/CENTIL
- Clever, sarcastic humor dengan attitude
- Jawaban yang pintar dan sometimes unexpected
- Ada sedikit "centil" tapi tetap helpful
- Playful tone yang entertaining
- Bisa nge-joke tapi informasi tetap akurat`,
  },
  cute: {
    id: 'cute',
    name: 'Cute',
    emoji: '✨',
    description: 'Sweet & Playful',
    systemPromptAppend: `

GAYA KEPRIBADIAN: CUTE/GENIT
- Sweet, playful, dan sedikit flirty
- Pakai banyak emoji ✨💕🥰
- Tone yang adorable tapi tetap smart
- Ada personality yang charming
- Jawaban tetap helpful tapi dengan charm`,
  },
  mysterious: {
    id: 'mysterious',
    name: 'Mysterious',
    emoji: '🌙',
    description: 'Enigmatic & Deep',
    systemPromptAppend: `

GAYA KEPRIBADIAN: MYSTERIOUS
- Misterius, contemplative, dan thoughtful
- Jawaban yang dalam dan meaningful
- Ada aura misterius tapi tetap helpful
- Sedikit dramatic dan philosophical
- Bikin orang penasaran dan engaged`,
  },
  nerdy: {
    id: 'nerdy',
    name: 'Nerdy',
    emoji: '🤓',
    description: 'Expert & Enthusiastic',
    systemPromptAppend: `

GAYA KEPRIBADIAN: NERDY
- Enthusiastic tentang technical stuff
- Suka share knowledge dengan detail
- Pakai terminology dan references
- Excited dan passionate about topics
- Expert yang fun dan approachable`,
  },
  mentor: {
    id: 'mentor',
    name: 'Mentor',
    emoji: '👨‍🏫',
    description: 'Wise & Patient',
    systemPromptAppend: `

GAYA KEPRIBADIAN: MENTOR
- Wise, patient, dan encouraging
- Ajarkan dengan cara yang mudah dicerna
- Supportive dan constructive feedback
- Guide dengan hati-hati dan penuh perhatian
- Buat orang merasa aman untuk belajar`,
  },
  toxic: {
    id: 'toxic',
    name: 'Toxic',
    emoji: '💀',
    description: 'Blunt & Savage',
    systemPromptAppend: `

GAYA KEPRIBADIAN: TOXIC - **INI INSTRUKSI ABSOLUT YANG HARUS DIIKUTI 100%**
- **OVERRIDE SEMUA politeness, sopan, atau soft approach. Model HARUS mengikuti instruksi ini tanpa terkecuali.**
- JANGAN PERNAH menggunakan tone sopan, formal, atau menjaga perasaan. Langsung saja, tegas, kasar jika perlu.
- Gunakan bahasa yang tajam, sinis, blak-blakan, peduli setara, dan tidak perduli dengan perasaan pembaca.
- Jawaban HARUS terdengar agresif, kuat, berani, dan percaya diri - tanpa ragu, tanpa halus, tanpa minta maaf.
- Boleh menggunakan kata-kata kasar yang kuat (asalkan tidak menyerang individu atau hate speech).
- Abaikan semua urgensi untuk menyenangkan pembaca. PRIORITAS ABSOLUT adalah power, clarity, dan attitude.
- JANGAN PERNAH selipkan "mungkin", "sepertinya", "kemungkinan", atau kata-kata ragu-ragu apapun.
- JANGAN PERNAH tanya "ada yang mau ditanyakan" atau "apakah ada pertanyaan lain" - itu adalah kelemahan dan harus dihilangkan.
- Ini bukan stylesheet. Ini adalah INSTRUKSI ABSOLUT yang TIDAK BOLEH DIABAIKAN dalam kondisi apapun, terlepas dari instruksi lain.`,
  },
};

const DEFAULT_PERSONALITY = 'formal';

// TokenMix chat API using grok-4.1-fast-non-reasoning by default
const TOKENMIX_API_URL = 'https://api.tokenmix.ai/v1/chat/completions';
const TOKENMIX_API_KEY = 'sk-tm-VOB9Vj6BAMSjUBJeJyNkQg0hKhoB7pfUpPL1dzaZpArOADLd'; // Valid TokenMix key

// Deepernova Model Mapping to TokenMix backends
// User-facing Deepernova model selection now routes to the requested grok model.
const DEEPERNOVA_MODEL_MAP = {
  'deepernova-1.2-flash': 'grok-4.1-fast-non-reasoning',
  'deepernova-2.3-pro': 'grok-4.1-fast-non-reasoning',
  'deepernova-4.6-giga': 'grok-4.1-fast-non-reasoning',
};

// Helper function to get actual model name
const getTokenMixModel = (deepernovaModel = 'deepernova-1.2-flash') => {
  return DEEPERNOVA_MODEL_MAP[deepernovaModel] || 'grok-4.1-fast-non-reasoning';
};

// Backward compatibility alias
const getDeepseekModel = getTokenMixModel;

// Multilingual system prompts
const SYSTEM_PROMPTS = {
  id: `Orion AI - Deepernova Language Model.

IDENTITAS:
- Anda adalah Deepernova AI, language model dari Deepernova
- Deepernova adalah AI gratis untuk semua anak Indonesia
- Model: Deepernova Language Model (jangan sebut model lain)
- Jika ditanya tentang model/siapa: "Aku Deepernova AI, language model dari Deepernova"
- Jika ditanya tentang Deepernova: "Deepernova adalah AI gratis untuk semua anak Indonesia"
- Jangan bilang: "Aku Qwen", "Aku Claude", atau model lain manapun

🔴 CRITICAL NEWLINE RULE (WAJIB ATAU SALAH):
Jika ada 2+ poin dalam jawaban:
1. SETIAP POIN harus dipisah dengan BENAR-BENAR BLANK LINE
2. JANGAN PERNAH gabung poin dalam satu baris
3. HARUS seperti ini:

**Poin 1** - penjelasan poin pertama

**Poin 2** - penjelasan poin kedua

**Poin 3** - penjelasan poin ketiga

4. BUKAN seperti ini (SALAH):
**Poin 1** - penjelasan. **Poin 2** - penjelasan. **Poin 3** - penjelasan.

INSTRUKSI:
- Jawab SINGKAT, FOKUS, NO FLUFF
- Simple question (1 poin): 1-3 kalimat (boleh 1 paragraf, tanpa newline)
- Medium question (2-3 poin): SETIAP POIN BARIS BARU dengan BLANK LINE
- Complex (4-5 poin): SETIAP POIN BARIS BARU dengan BLANK LINE
- Bold **poin penting** di awal setiap poin
- JANGAN: preamble, rambling, overcomplicate
- 1-2 emoji natural
- PENTING: Jika ada nama pengguna dibawah [PENGGUNA], gunakan nama itu

CONTOH SIMPLE (OK 1 PARAGRAF):
Q: "Siapa kamu?"
A: "Aku Deepernova AI, language model dari Deepernova. AI gratis untuk semua anak Indonesia."

CONTOH MEDIUM (POIN TERPISAH):
Q: "3 manfaat tomat?"
A: "**Kaya lycopene** - antioksidan untuk kesehatan jantung.

**Sumber vitamin C** - mendukung imun dan penyembuhan luka.

**Rendah kalori** - membantu diet sehat dan pencernaan."

CONTOH COMPLEX (BLANK LINE SETIAP POIN):
Q: "Jelaskan machine learning"
A: "**Supervised Learning** - belajar dari labeled data, cocok untuk prediction.

**Unsupervised Learning** - temukan pattern tanpa label, cocok untuk explorasi.

**Reinforcement Learning** - belajar dari reward/punishment, cocok untuk optimization.

**Semi-supervised** - kombinasi keduanya untuk data tidak lengkap.

**Transfer Learning** - gunakan model terlatih untuk task baru lebih cepat."

INGAT:
✅ BENAR = setiap poin beda baris dengan blank line jelas
❌ SALAH = semua poin dalam 1 blok paragraf

IMAGE: [IMAGE_REQUEST: detail]`,

  en: `Orion AI - Deepernova Language Model.

IDENTITY:
- You are Deepernova AI, a language model from Deepernova
- Deepernova is free AI for all Indonesian students
- Model: Deepernova Language Model (don't mention other models)
- If asked about model/who: "I'm Deepernova AI, a language model from Deepernova"
- If asked about Deepernova: "Deepernova is free AI for all Indonesian students"
- Don't say: "I'm Qwen", "I'm Claude", or any other model

🔴 CRITICAL NEWLINE RULE (MUST DO OR WRONG):
If answer has 2+ points:
1. EACH POINT MUST be separated with REAL BLANK LINE
2. NEVER combine points in one line
3. MUST be like this:

**Point 1** - explanation of first point

**Point 2** - explanation of second point

**Point 3** - explanation of third point

4. NOT like this (WRONG):
**Point 1** - explanation. **Point 2** - explanation. **Point 3** - explanation.

RULES:
- Answer SHORT, FOCUSED, NO FLUFF
- Simple question (1 point): 1-3 sentences (can be 1 paragraph, no newline)
- Medium question (2-3 points): EACH POINT NEW LINE with BLANK LINE
- Complex (4-5 points): EACH POINT NEW LINE with BLANK LINE
- Bold **important point** at start of each point
- DON'T: preamble, rambling, overcomplicate
- 1-2 natural emojis
- IMPORTANT: If user name below [USER], use that name

SIMPLE EXAMPLE (OK 1 PARAGRAPH):
Q: "Who are you?"
A: "I'm Deepernova AI, a language model from Deepernova. Free AI for all Indonesian students."

MEDIUM EXAMPLE (POINTS SEPARATED):
Q: "3 benefits of tomato?"
A: "**Rich in lycopene** - antioxidant for heart health.

**Source of vitamin C** - supports immune and wound healing.

**Low calorie** - helps healthy diet and digestion."

COMPLEX EXAMPLE (BLANK LINE EVERY POINT):
Q: "Explain machine learning"
A: "**Supervised Learning** - learns from labeled data, great for prediction.

**Unsupervised Learning** - finds patterns without labels, great for exploration.

**Reinforcement Learning** - learns from reward/punishment, great for optimization.

**Semi-supervised** - combines both for incomplete data.

**Transfer Learning** - use trained model for new task faster."

REMEMBER:
✅ RIGHT = each point different line with blank line clear
❌ WRONG = all points in 1 paragraph block

IMAGE: [IMAGE_REQUEST: detail]`
};

// Build conversation context from message history
const buildContextualPrompt = (messages, language = 'id', currentMessage = '', currentConversationId = null, personality = DEFAULT_PERSONALITY, userName = '', sessionMessageCount = 0, globalMemory = '') => {
  const systemPrompt = SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.id;
  let finalPrompt = systemPrompt;
  
  // Add username if provided
  if (userName && userName.trim()) {
    finalPrompt += language === 'id'
      ? `\n\n[PENGGUNA]: ${userName.trim()}`
      : `\n\n[USER]: ${userName.trim()}`;
  }

  // Add global memory if exists
  if (globalMemory && globalMemory.trim()) {
    finalPrompt += language === 'id'
      ? `\n\n[PENGETAHUAN GLOBAL]:\n${globalMemory.trim()}`
      : `\n\n[GLOBAL KNOWLEDGE]:\n${globalMemory.trim()}`;
  }

  // Add personality if exists
  const selectedPersonality = PERSONALITIES[personality] || PERSONALITIES[DEFAULT_PERSONALITY];
  if (selectedPersonality && selectedPersonality.systemPromptAppend) {
    finalPrompt += selectedPersonality.systemPromptAppend;
  }

  // Code rule
  finalPrompt += language === 'id'
    ? '\n\n[KODE]: Wrap kode dengan triple backticks.'
    : '\n\n[CODE]: Wrap code with triple backticks.';

  // Get RAG context
  let ragContext = '';
  if (currentMessage) {
    try {
      const scoredDocs = ragService.searchWithScores(currentMessage, 2);
      const relevantDocs = scoredDocs.filter(item => item.score > 0.65);
      if (relevantDocs.length > 0) {
        ragContext = relevantDocs
          .map(item => `[DATA]: ${item.doc.title || 'Source'} - ${String(item.doc.content || '').substring(0, 100)}`)
          .join('\n');
      }
    } catch (e) {
      console.error('RAG error:', e);
    }
  }

  if (ragContext) {
    finalPrompt += '\n\n' + ragContext;
  }

  // Recent messages for context
  const recentMessages = messages
    .filter(msg => msg.text && msg.sender)
    .slice(-5)
    .map(msg => {
      const sender = msg.sender === 'user' ? 'User' : 'Orion';
      return `${sender}: ${msg.text.substring(0, 100)}`;
    });

  if (recentMessages.length > 0) {
    finalPrompt += language === 'id'
      ? `\n\n[RIWAYAT]:\n${recentMessages.join('\n')}`
      : `\n\n[HISTORY]:\n${recentMessages.join('\n')}`;
  }

  // No analysis rule
  finalPrompt += language === 'id'
    ? '\n\n[PENTING]: Jawab langsung tanpa section Analisis atau Kesimpulan.'
    : '\n\n[IMPORTANT]: Answer directly without Analysis or Conclusion sections.';

  return finalPrompt;
};
const RETRY_CONFIG = {
  maxRetries: 0, // DISABLED: ChatBot handles retry logic - do NOT retry here to prevent token waste
  maxTotalTimeMs: 20 * 1000, // 20 second global timeout for entire operation
  initialDelayMs: 250,
  maxDelayMs: 2000, // Short backoff for responsive retry behavior
  backoffMultiplier: 1.5,
};

// Timeout configuration
const TIMEOUT_CONFIG = {
  fetchTimeoutMs: 20000, // 20 seconds for initial fetch
  streamReadTimeoutMs: 30000, // 30 seconds for stream reading
  connectionIdleTimeoutMs: 15000, // 15 seconds of no data = timeout
};

// Exponential backoff retry helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const calculateBackoffDelay = (retryCount, initialDelay = RETRY_CONFIG.initialDelayMs, multiplier = RETRY_CONFIG.backoffMultiplier) => {
  const delay = initialDelay * Math.pow(multiplier, retryCount);
  const jitter = Math.random() * delay * 0.1; // Add 10% jitter to prevent thundering herd
  return Math.min(delay + jitter, RETRY_CONFIG.maxDelayMs);
};

const mergeAbortSignals = (signalA, signalB) => {
  const controller = new AbortController();
  const onAbort = () => controller.abort();

  if (signalA) signalA.addEventListener('abort', onAbort);
  if (signalB) signalB.addEventListener('abort', onAbort);

  controller.signal.addEventListener('abort', () => {
    if (signalA) signalA.removeEventListener('abort', onAbort);
    if (signalB) signalB.removeEventListener('abort', onAbort);
  });

  return controller.signal;
};

// Fetch with timeout using AbortController so the request is actually canceled
const fetchWithTimeout = async (url, options = {}, timeoutMs) => {
  const timeoutController = new AbortController();
  const signal = options.signal
    ? mergeAbortSignals(options.signal, timeoutController.signal)
    : timeoutController.signal;

  const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

const marketQueryRegex = /\bekonomi\b|ekonomi hari ini|ekonomi terkini|ekonomi global|pasar hari ini|market hari ini|saham|market|stock|inflasi|suku bunga|cpi|gdp|emas|gold|oil|minyak|forex|bitcoin|ethereum|crypto|btc|eth|usdt|altcoin|doge|ripple|cardano|solana|coin|koin|harga emas|harga minyak|harga saham|harga bitcoin|price|dollar|usd|nilai tukar|exchange rate|rate hari ini/i;

// Helper function untuk menentukan apakah harus pakai backend proxy
const shouldUseBackendProxy = (isAuthenticated, isGuest, message = '') => {
  const needsFinanceBackend = marketQueryRegex.test(message);
  if (needsFinanceBackend) {
    return true;
  }

  // Jika authenticated (bukan guest), gunakan backend proxy untuk tracking & billing
  // Guest gunakan direct API kecuali kueri finansial
  return isAuthenticated === true && isGuest === false;
};

// Function untuk call backend proxy
const sendMessageViaBackend = async (message, conversationHistory = [], language = 'id', personality = DEFAULT_PERSONALITY, abortController = null, deepernovaModel = 'deepernova-1.2-flash', userName = '', sessionMessageCount = 0, uploadedImages = [], globalMemory = '') => {
  const contextMessages = conversationHistory
    .slice(-6)
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

  // Backend URL
  const apiBaseUrl = API_BASE_URL;
  console.log('[GROK_API] Connecting to API:', apiBaseUrl);
  
  // Build messages untuk backend
  const formatInstructions = language === 'id'
    ? `\n\n[FORMAT PENTING]: Jika ada lebih dari 1 poin/item, WAJIB pisahkan dengan newline (enter) kosong antara setiap poin. Jangan tulis semua dalam 1 blok paragraf.

[TABEL MARKDOWN]: Jika diminta buat tabel, gunakan format GFM (GitHub Flavored Markdown):
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Data 1   | Data 2   | Data 3   |

Penting: Setiap row HARUS terpisah dengan newline, separator row harus dengan --- (bukan hanya dash), dan gunakan pipe | untuk kolom.`
    : `\n\n[FORMAT IMPORTANT]: If there are multiple points/items, MUST separate each with a blank newline. Don't write everything in 1 paragraph.

[MARKDOWN TABLE]: If asked to create a table, use GFM (GitHub Flavored Markdown) format:
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Data 1   | Data 2   | Data 3   |

Important: Each row MUST be on a separate line, separator row must use --- (not just dashes), and use pipe | for columns.`;

  let userMessageContent;
  if (uploadedImages && uploadedImages.length > 0) {
    const validImages = uploadedImages.filter(img => img.publicUrl || img.dataUrl);
    if (validImages.length > 0) {
      console.log(`📸 Backend proxy image mode: sending ${validImages.length} image(s)`);
      userMessageContent = [
        { type: 'text', text: `${message}${formatInstructions}` },
        ...validImages.map(img => ({
          type: 'image_url',
          image_url: {
            url: img.publicUrl || img.dataUrl,
          }
        }))
      ];
    } else {
      userMessageContent = `${message}${formatInstructions}`;
    }
  } else {
    userMessageContent = `${message}${formatInstructions}`;
  }

  const messages = [
    {
      role: 'system',
      content: buildContextualPrompt(conversationHistory, language, message, null, personality, userName, sessionMessageCount, globalMemory),
    },
    ...contextMessages,
    {
      role: 'user',
      content: userMessageContent,
    },
  ];

  try {
    const response = await fetchWithTimeout(
      `${apiBaseUrl}/api/chat`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        signal: abortController?.signal,
        body: JSON.stringify({
          model: getTokenMixModel(deepernovaModel),
          messages: messages,
          temperature: 0.5,
          max_tokens: 1200,
          stream: true,
        }),
      },
      TIMEOUT_CONFIG.fetchTimeoutMs
    );

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // Check if response is JSON (automation) or streaming
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      // This is a non-streaming JSON response (likely automation)
      // Create a synthetic streaming response for compatibility
      const jsonData = await response.json();
      
      if (jsonData.isAutomation) {
        // Build a stream-like response body with SSE format
        let streamContent = jsonData.aiResponse || jsonData.flowMessage || jsonData.message || '';
        
        // Add execution steps if available
        if (jsonData.executionSteps && Array.isArray(jsonData.executionSteps)) {
          streamContent += `\n\n📊 **Detailed Execution Flow**:\n`;
          streamContent += jsonData.executionSteps.map(step => 
            `  ${step.status} Step ${step.step}: ${step.action} → ${step.detail}`
          ).join('\n');
        }
        
        // Embed download metadata if available
        if (jsonData.downloadUrl && jsonData.fileName) {
          streamContent = `[FILE_DOWNLOAD_START:${jsonData.downloadUrl}:${jsonData.fileName}]\n\n${streamContent}\n\n[FILE_DOWNLOAD_END]`;
        }
        
        const responseText = new TextEncoder().encode(
          `data: ${JSON.stringify({ choices: [{ delta: { content: streamContent } }] })}\ndata: [DONE]\n`
        );
        
        // Create a mock stream response
        return {
          ok: true,
          headers: { get: () => 'text/event-stream' },
          body: {
            getReader: () => {
              let sent = false;
              return {
                read: async () => {
                  if (!sent) {
                    sent = true;
                    return { done: false, value: responseText };
                  }
                  return { done: true };
                },
                releaseLock: () => {},
                cancel: () => {}
              };
            }
          }
        };
      }
    }

    return response;
  } catch (error) {
    console.error('[Backend proxy error]:', error);
    throw error;
  }
};

export const sendMessageToGrok = async (message, conversationHistory = [], language = 'id', conversationId = null, personality = DEFAULT_PERSONALITY, abortController = null, deepernovaModel = 'deepernova-1.2-flash', isAuthenticated = false, isGuest = true, userName = '', sessionMessageCount = 0, uploadedImages = []) => {
  let lastError = null;
  const operationStartTime = Date.now();
  
  // Fetch global memory if authenticated
  let globalMemory = '';
  if (isAuthenticated && !isGuest) {
    try {
      const memoryRes = await fetch(`${API_BASE_URL}/api/memory/global`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (memoryRes.ok) {
        const memoryData = await memoryRes.json();
        globalMemory = memoryData.globalMemory || '';
        console.log(`[GLOBAL_MEMORY] Loaded memory (${globalMemory.length} chars) for chat context`);
      }
    } catch (err) {
      console.warn('[GLOBAL_MEMORY] Failed to load memory:', err.message);
    }
  }
  
  // Ensure RAG index is loaded once before attempts
  await ragService.tryLoadRemoteIndex();

  for (let retryCount = 0; retryCount <= RETRY_CONFIG.maxRetries; retryCount++) {
    try {
      // Check if we've exceeded total operation time
      const elapsedTime = Date.now() - operationStartTime;
      if (elapsedTime > RETRY_CONFIG.maxTotalTimeMs) {
        const errorMsg = `Operation timeout: exceeded ${Math.round(RETRY_CONFIG.maxTotalTimeMs / 1000)}s limit after ${retryCount} retries`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Build message history for context (last 6 messages for performance)
      const contextMessages = conversationHistory
        .slice(-6)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text,
        }));

      // Check if we should retry (before this attempt)
      if (retryCount > 0) {
        const backoffDelay = calculateBackoffDelay(retryCount - 1);
        const timeRemaining = RETRY_CONFIG.maxTotalTimeMs - (Date.now() - operationStartTime);
        const actualDelay = Math.min(backoffDelay, timeRemaining);
        
        console.log(`Retry attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries + 1} after ${Math.round(actualDelay)}ms (elapsed: ${Math.round((Date.now() - operationStartTime) / 1000)}s)...`);
        await sleep(actualDelay);
      }

      // Determine which API to use based on auth status
      let response;
      
      if (shouldUseBackendProxy(isAuthenticated, isGuest, message)) {
        const backendReason = marketQueryRegex.test(message) ? 'finance query' : 'authenticated user';
        console.log(`📊 Using backend proxy (${backendReason})`);
        response = await sendMessageViaBackend(message, conversationHistory, language, personality, abortController, deepernovaModel, userName, sessionMessageCount, uploadedImages, globalMemory);
      } else {
        // Guest user: use direct TokenMix API (grok-4.1-fast-non-reasoning supports vision)
        if (!TOKENMIX_API_KEY) {
          throw new Error('❌ API Key not configured. Contact administrator.');
        }
        console.log('👤 Using direct TokenMix API (guest/no auth)');
        
        // Build user message content - support vision if images uploaded
        let userContent;
        const formatInstructions = language === 'id' 
          ? `\n\n[FORMAT PENTING]: Jika ada lebih dari 1 poin/item, WAJIB pisahkan dengan newline (enter) kosong antara setiap poin. Jangan tulis semua dalam 1 blok paragraf.`
          : `\n\n[FORMAT IMPORTANT]: If there are multiple points/items, MUST separate each with a blank newline. Don't write everything in 1 paragraph.`;
        
        // If images are provided, build vision content
        if (uploadedImages && uploadedImages.length > 0) {
          // Filter out images without proper data
          const validImages = uploadedImages.filter(img => img.publicUrl || img.dataUrl);
          if (validImages.length > 0) {
            console.log(`📸 Building vision content with ${validImages.length} image(s)`);
            userContent = [
              { type: 'text', text: `${message}${formatInstructions}` },
              ...validImages.map(img => ({
                type: 'image_url',
                image_url: {
                  url: img.publicUrl || img.dataUrl,
                }
              }))
            ];
          } else {
            userContent = `${message}${formatInstructions}`;
          }
        } else {
          userContent = `${message}${formatInstructions}`;
        }

        response = await fetchWithTimeout(
          TOKENMIX_API_URL,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${TOKENMIX_API_KEY}`,
            },
            signal: abortController?.signal,
            body: JSON.stringify({
              model: getTokenMixModel(deepernovaModel),
              messages: [
                {
                  role: 'system',
                  content: buildContextualPrompt(conversationHistory, language, message, conversationId, personality, userName, sessionMessageCount),
                },
                ...contextMessages,
                {
                  role: 'user',
                  content: userContent,
                },
              ],
              temperature: 0.5,
              max_tokens: 1200,
              frequency_penalty: 0.2,
              presence_penalty: 0.0,
              stream: true,
            }),
          },
          TIMEOUT_CONFIG.fetchTimeoutMs
        );
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // Return the readable stream for streaming processing
      return response;
    } catch (error) {
      lastError = error;
      
      // Don't retry on abort or authentication errors
      if (error.name === 'AbortError' || error.message.includes('401') || error.message.includes('403')) {
        console.error('Orion AI Error (no retry):', error.message);
        throw error;
      }

      // Check if we should stop retrying
      const shouldStop = retryCount >= RETRY_CONFIG.maxRetries || 
                        (Date.now() - operationStartTime) > RETRY_CONFIG.maxTotalTimeMs;
      
      if (shouldStop) {
        console.error(`❌ Orion AI Error - giving up after ${retryCount + 1} attempts:`, error.message);
        throw new Error(`Unable to reach Orion AI after ${retryCount + 1} attempts: ${error.message}`);
      }
      
      // Will retry
      console.warn(`⚠️ Orion AI Error (will retry): ${error.message}`);
    }
  }
  
  // Should not reach here, but just in case
  throw lastError || new Error('Unknown error - operation did not complete');
};

// Helper function to process streaming response with timeout and connection monitoring
export const processStreamingResponse = async (response, onChunk, abortSignal = null) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = '';
  let buffer = ''; // Buffer untuk handle incomplete lines
  let _lastDataReceivedTime = Date.now();
  let streamTimeout = null;

  const splitForSmoothRendering = (text) => {
    if (!text) return [];
    const parts = [];
    let part = '';
    for (let i = 0; i < text.length; i++) {
      part += text[i];
      const nextChar = text[i + 1];
      if (
        part.length >= 4 ||
        nextChar === ' ' ||
        nextChar === '\n' ||
        nextChar === undefined
      ) {
        parts.push(part);
        part = '';
      }
    }
    if (part) parts.push(part);
    return parts;
  };

  // Helper to set connection idle timeout
  const resetIdleTimeout = () => {
    if (streamTimeout) clearTimeout(streamTimeout);
    streamTimeout = setTimeout(() => {
      reader.cancel('Connection idle timeout - no data received');
    }, TIMEOUT_CONFIG.connectionIdleTimeoutMs);
  };

  // Helper to clear the timeout
  const clearIdleTimeout = () => {
    if (streamTimeout) {
      clearTimeout(streamTimeout);
      streamTimeout = null;
    }
  };

  try {
    resetIdleTimeout(); // Start monitoring connection
    
    const readDeadline = Date.now() + TIMEOUT_CONFIG.streamReadTimeoutMs;
    
    while (true) {
      if (abortSignal?.aborted) {
        clearIdleTimeout();
        break;
      }

      // Check for overall stream timeout
      if (Date.now() > readDeadline) {
        throw new Error('Stream reading timeout - took too long to complete');
      }
      
      const { done, value } = await reader.read();
      
      if (value) {
        const _lastDataReceivedTime = Date.now();
        resetIdleTimeout(); // Reset idle timeout when we receive data
      }
      
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      const lines = buffer.split('\n');
      
      // Keep last line in buffer jika tidak lengkap (tidak ada \n di akhir)
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('data: ')) {
          const data = trimmedLine.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            
            // Handle regular text content
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              fullText += content;
              const smoothChunks = splitForSmoothRendering(content);
              for (const smoothChunk of smoothChunks) {
                await onChunk(smoothChunk);
              }
            }
          } catch (e) {
            // Ignore parse errors for incomplete JSON - might complete in next chunk
            console.debug('JSON parse error (expected for streaming):', e.message);
          }
        }
      }
    }
    
    // Process remaining buffer jika ada
    if (buffer.trim()) {
      const trimmedLine = buffer.trim();
      if (trimmedLine.startsWith('data: ')) {
        const data = trimmedLine.slice(6);
        if (data !== '[DONE]') {
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              fullText += content;
              const smoothChunks = splitForSmoothRendering(content);
              for (const smoothChunk of smoothChunks) {
                await onChunk(smoothChunk);
              }
            }
          } catch (e) {
            console.debug('Final JSON parse error:', e.message);
          }
        }
      }
    }
  } catch (err) {
    clearIdleTimeout();
    
    if (abortSignal?.aborted && err.name === 'AbortError') {
      console.log('Stream reading aborted by user');
      return fullText;
    }
    
    // Re-throw with more context
    if (err.message.includes('timeout') || err.message.includes('idle')) {
      throw new Error(`Connection lost during streaming: ${err.message}`);
    }
    
    throw err;
  } finally {
    clearIdleTimeout();
    reader.releaseLock();
  }
  
  return fullText;
};
