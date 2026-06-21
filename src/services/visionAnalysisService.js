/**
 * Vision Analysis Service
 * Analyzes uploaded images using Tokenmix grok-4.1-fast-non-reasoning API
 * Used by Deepseek to understand image content before responding
 */

import { API_BASE_URL } from '../apiConfig';

class VisionAnalysisService {
  /**
   * Analyze image using Tokenmix grok-4.1-fast-non-reasoning
   * @param {string} imageUrl - Image URL or base64 data
   * @param {string} question - What to ask about the image (optional)
   * @returns {Promise<Object>} Analysis result with detected content
   */
  static async analyzeImage(imageUrl, question = 'What is in this image? Describe it briefly.') {
    try {
      console.log('[VisionAnalysis] Analyzing image:', imageUrl.substring(0, 60));

      const apiUrl = `${API_BASE_URL}/api/vision/analyze`;
      console.log('[VisionAnalysis] Request URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          imageUrl: imageUrl,
          question: question,
          model: 'grok-4.1-fast-non-reasoning',
        }),
      });

      if (!response.ok) {
        console.error('[VisionAnalysis] API error:', response.status, response.statusText);
        const errorData = await response.json().catch(() => null);
        console.error('[VisionAnalysis] Error response:', errorData);
        throw new Error(`Vision analysis failed: ${response.status} ${response.statusText} - ${errorData?.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('[VisionAnalysis] Result:', data.analysis?.substring(0, 100) || 'No analysis');
      return data;
    } catch (error) {
      console.error('[VisionAnalysis] Error:', error.message);
      throw error;
    }
  }

  /**
   * Batch analyze multiple images
   * @param {Array<string>} imageUrls - Array of image URLs
   * @returns {Promise<Array>} Array of analysis results
   */
  static async analyzeMultiple(imageUrls) {
    try {
      const results = await Promise.all(
        imageUrls.map(url => this.analyzeImage(url))
      );
      return results;
    } catch (error) {
      console.error('[VisionAnalysis] Batch error:', error.message);
      throw error;
    }
  }
}

export { VisionAnalysisService };
