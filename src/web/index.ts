/**
 * Web Research Module
 *
 * Provides web scraping and search capabilities for real data collection.
 */

import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface PageContent {
  url: string;
  title: string;
  text: string;
  links: { text: string; href: string }[];
  metadata: Record<string, string>;
}

/**
 * Web researcher for fetching and parsing web content
 */
export class WebResearcher {
  private client: AxiosInstance;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;
  private rateLimitMs: number = 1000; // 1 request per second

  constructor() {
    this.client = axios.create({
      timeout: 30000,
      maxRedirects: 10,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      },
      validateStatus: (status) => status < 400
    });
  }

  /**
   * Rate limiting helper
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;

    if (elapsed < this.rateLimitMs) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitMs - elapsed));
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Fetch and parse a webpage
   */
  async fetchPage(url: string): Promise<PageContent> {
    await this.rateLimit();

    try {
      const response = await this.client.get(url);
      const $ = cheerio.load(response.data);

      // Extract title
      const title = $('title').first().text().trim() ||
                   $('h1').first().text().trim() ||
                   '';

      // Extract main text content
      // Remove script, style, nav, footer, header
      $('script, style, nav, footer, header, aside, .nav, .footer, .header, .sidebar').remove();

      // Get text from body or main content areas
      let text = '';
      const mainContent = $('main, article, .content, .main, #content, #main').first();

      if (mainContent.length) {
        text = mainContent.text();
      } else {
        text = $('body').text();
      }

      // Clean up whitespace
      text = text.replace(/\s+/g, ' ').trim();

      // Extract links
      const links: { text: string; href: string }[] = [];
      $('a[href]').each((_, el) => {
        const $el = $(el);
        const href = $el.attr('href');
        const linkText = $el.text().trim();

        if (href && linkText && !href.startsWith('#') && !href.startsWith('javascript:')) {
          // Resolve relative URLs
          let absoluteUrl = href;
          try {
            absoluteUrl = new URL(href, url).href;
          } catch {
            // Keep as-is if URL parsing fails
          }

          links.push({ text: linkText, href: absoluteUrl });
        }
      });

      // Extract metadata
      const metadata: Record<string, string> = {};

      $('meta').each((_, el) => {
        const $el = $(el);
        const name = $el.attr('name') || $el.attr('property');
        const content = $el.attr('content');

        if (name && content) {
          metadata[name] = content;
        }
      });

      return {
        url,
        title,
        text: text.substring(0, 50000), // Limit text size
        links: links.slice(0, 100), // Limit links
        metadata
      };
    } catch (error: any) {
      console.error(`[WebResearcher] Error fetching ${url}:`, error.message);
      return {
        url,
        title: '',
        text: '',
        links: [],
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Search Wikipedia for information
   */
  async searchWikipedia(query: string, limit: number = 5): Promise<WebSearchResult[]> {
    await this.rateLimit();

    try {
      // Use Wikipedia API
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=${limit}`;

      const response = await this.client.get(searchUrl);
      const data = response.data;

      if (!data.query?.search) {
        return [];
      }

      return data.query.search.map((result: any) => ({
        title: result.title,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title.replace(/ /g, '_'))}`,
        snippet: result.snippet.replace(/<[^>]+>/g, '') // Remove HTML tags
      }));
    } catch (error: any) {
      console.error('[WebResearcher] Wikipedia search error:', error.message);
      return [];
    }
  }

  /**
   * Get Wikipedia page content
   */
  async getWikipediaPage(title: string): Promise<PageContent> {
    await this.rateLimit();

    try {
      // Use Wikipedia API to get page content
      const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=extracts|info&inprop=url&format=json&explaintext=1`;

      const response = await this.client.get(apiUrl);
      const pages = response.data.query?.pages;

      if (!pages) {
        return {
          url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
          title,
          text: '',
          links: [],
          metadata: { error: 'Page not found' }
        };
      }

      const pageId = Object.keys(pages)[0];
      const page = pages[pageId];

      return {
        url: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        title: page.title,
        text: page.extract || '',
        links: [],
        metadata: {
          pageId: pageId,
          lastRevId: page.lastrevid?.toString() || ''
        }
      };
    } catch (error: any) {
      console.error('[WebResearcher] Wikipedia page error:', error.message);
      return {
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
        title,
        text: '',
        links: [],
        metadata: { error: error.message }
      };
    }
  }

  /**
   * Search using DuckDuckGo instant answer API
   */
  async searchDuckDuckGo(query: string): Promise<{ abstract: string; relatedTopics: string[] }> {
    await this.rateLimit();

    try {
      const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;

      const response = await this.client.get(url);
      const data = response.data;

      const relatedTopics: string[] = [];

      if (data.RelatedTopics) {
        for (const topic of data.RelatedTopics) {
          if (topic.Text) {
            relatedTopics.push(topic.Text);
          } else if (topic.Topics) {
            for (const subtopic of topic.Topics) {
              if (subtopic.Text) {
                relatedTopics.push(subtopic.Text);
              }
            }
          }
        }
      }

      return {
        abstract: data.Abstract || '',
        relatedTopics: relatedTopics.slice(0, 10)
      };
    } catch (error: any) {
      console.error('[WebResearcher] DuckDuckGo search error:', error.message);
      return { abstract: '', relatedTopics: [] };
    }
  }

  /**
   * Get request statistics
   */
  getStats(): { requestCount: number } {
    return { requestCount: this.requestCount };
  }
}

export default WebResearcher;
