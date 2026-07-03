import { generateText } from './provider.js';
import axios from 'axios';

export async function generateLinkPreview(url: string, userId: string) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const html = response.data;
    
    const title = extractMeta(html, 'og:title') || extractMeta(html, 'title') || url;
    const description = extractMeta(html, 'og:description') || extractMeta(html, 'description') || 'No description';
    const image = extractMeta(html, 'og:image') || '';
    
    const analysis = await generateText({
      systemPrompt: `You are a web analyst. Analyze this webpage and return JSON:
{
  "summary": "one paragraph - what it's about, who it's for",
  "techStack": ["tech1", "tech2"] if detectable,
  "quality": "professional|personal|portfolio|blog|docs|ecommerce|unknown",
  "topics": ["topic1", "topic2"],
  "trustIndicators": ["https", "professional_design", "contact_info", ...]
}`,
      userPrompt: `URL: ${url}\nTitle: ${title}\nDescription: ${description}\nHTML: ${html.slice(0, 8000)}`,
      temperature: 0.6,
      maxTokens: 800,
      model: 'fast',
      json: true
    });
    
    const parsed = JSON.parse(analysis);
    
    return {
      url,
      title,
      description,
      image,
      ...parsed
    };
  } catch (error) {
    console.error('Link preview failed:', error);
    return { url, error: 'Unable to generate preview', title: url };
  }
}

function extractMeta(html: string, property: string): string {
  const regex = new RegExp(`<meta\\s+(?:property|name)=["']${property}["']\\s+content=["']([^"']*)["']`, 'i');
  const match = html.match(regex);
  return match ? match[1] : '';
}