/**
 * Memory Writer Service
 * Automatically writes key points to global memory using qwen-flash (cheap model)
 * Called every 2 messages to summarize conversation insights
 */

const TOKENMIX_API_KEY = process.env.TOKENMIX_API_KEY || 'sk-tm-VOB9Vj6BAMSjUBJeJyNkQg0hKhoB7pfUpPL1dzaZpArOADLd';
const TOKENMIX_API_URL = 'https://api.tokenmix.ai/v1/chat/completions';

const BULLET_PREFIXES = ['- ', '* ', '• '];

function normalizeBulletLine(line) {
  return line
    .trim()
    .replace(/^\s*[-\*•]\s*/, '')
    .replace(/\.$/, '')
    .trim();
}

function parseBulletPoints(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => normalizeBulletLine(line));
}

function mergeMemoryPoints(currentMemory, newPoints) {
  const existingPoints = parseBulletPoints(currentMemory);
  const existingSet = new Set(existingPoints.map((point) => point.toLowerCase()));
  const merged = [...existingPoints];

  for (const point of newPoints) {
    const normalized = point.toLowerCase();
    if (!existingSet.has(normalized) && normalized.length > 0) {
      existingSet.add(normalized);
      merged.push(point);
    }
  }

  return merged.map((point) => `- ${point}`).join('\n');
}

/**
 * Extract key points from recent conversation and update global memory
 * @param {string} userId - User ID
 * @param {Array} recentMessages - Last 4-5 messages (2 user + 2 AI)
 * @param {string} currentMemory - Current global memory content
 * @returns {Promise<string>} Updated memory content
 */
export async function updateGlobalMemory(userId, recentMessages, currentMemory = '') {
  try {
    // Build conversation context from recent messages
    const conversationText = recentMessages
      .map((msg, idx) => {
        const role = msg.role === 'user' ? 'User' : 'AI';
        const text = typeof msg.content === 'string' ? msg.content : '';
        return `${idx + 1}. ${role}: ${text.substring(0, 200)}`;
      })
      .join('\n');

    // Build prompt for qwen-flash to extract only new key points
    const systemPrompt = `You are a memory manager for an AI assistant. Your job is to keep the user's long-term memory additive and sharp.

Current Global Memory (if any):
${currentMemory || '(empty)'}

Guidelines:
- Extract only NEW, important key points from the recent conversation.
- Do not rewrite or shorten existing memory.
- Do not remove or replace any prior memory points.
- Return only new bullet points, one per line, starting with "- ".
- Keep each point very concise and sharp.
- If there is no new memory, return an empty response.`;

    const userPrompt = `Recent conversation:\n${conversationText}\n\nProvide only new bullet points to add to the current global memory.`;

    // Call qwen-flash for memory writing (cheap model)
    const response = await fetch(TOKENMIX_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKENMIX_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 220,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TokenMix API error: ${response.status} ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const newMemoryText = data.choices?.[0]?.message?.content || '';
    const newPoints = parseBulletPoints(newMemoryText);
    if (newPoints.length === 0) {
      console.log(`[MEMORY_WRITER] No new memory points found for user ${userId}`);
      return currentMemory.trim();
    }

    const mergedMemory = mergeMemoryPoints(currentMemory, newPoints);

    console.log(`[MEMORY_WRITER] Added ${newPoints.length} new memory points for user ${userId}`);
    console.log(`[MEMORY_WRITER] Merged memory length: ${mergedMemory.length} chars`);

    return mergedMemory.trim();
  } catch (error) {
    console.error('[MEMORY_WRITER] Error updating global memory:', error.message);
    return currentMemory;
  }
}

export default {
  updateGlobalMemory
};
