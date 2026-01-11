/**
 * E2B-powered Search Provider
 *
 * Uses E2B Code Interpreter sandbox to perform real web searches
 * with full internet access. This bypasses network restrictions.
 */

import Sandbox from '@e2b/code-interpreter';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  date?: string;
}

export class E2BSearchProvider {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.E2B_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('E2B_API_KEY is required');
    }
  }

  /**
   * Search using E2B sandbox with Python web scraping
   */
  async search(query: string, maxResults: number = 10): Promise<SearchResult[]> {
    const sandbox = await Sandbox.create({ apiKey: this.apiKey });

    try {
      // Install required packages
      await sandbox.runCode(`
import subprocess
subprocess.run(['pip', 'install', '-q', 'requests', 'beautifulsoup4', 'duckduckgo-search', 'wikipedia-api'], capture_output=True)
      `);

      // Run search code in sandbox
      const result = await sandbox.runCode(`
import json
from duckduckgo_search import DDGS
import wikipediaapi

results = []

# DuckDuckGo search
try:
    with DDGS() as ddgs:
        for r in ddgs.text("${query.replace(/"/g, '\\"')}", max_results=${maxResults}):
            results.append({
                "title": r.get("title", ""),
                "url": r.get("href", ""),
                "snippet": r.get("body", ""),
                "source": "DuckDuckGo"
            })
except Exception as e:
    print(f"DDG error: {e}")

# Wikipedia search
try:
    wiki = wikipediaapi.Wikipedia('PRISM/1.0 (research tool)', 'en')
    search_term = "${query.split(' ')[0].replace(/"/g, '\\"')}"
    page = wiki.page(search_term)
    if page.exists():
        results.append({
            "title": page.title,
            "url": page.fullurl,
            "snippet": page.summary[:500] if page.summary else "",
            "source": "Wikipedia"
        })
except Exception as e:
    print(f"Wiki error: {e}")

print("---JSON_START---")
print(json.dumps(results))
print("---JSON_END---")
      `);

      // Parse results
      if (result.logs && result.logs.stdout) {
        const output = result.logs.stdout.join('\n');
        const jsonMatch = output.match(/---JSON_START---([\s\S]*?)---JSON_END---/);
        if (jsonMatch && jsonMatch[1]) {
          return JSON.parse(jsonMatch[1].trim()) as SearchResult[];
        }
      }

      return [];
    } finally {
      await sandbox.kill();
    }
  }

  /**
   * Comprehensive research on a subject
   */
  async researchSubject(subject: string): Promise<SearchResult[]> {
    const sandbox = await Sandbox.create({ apiKey: this.apiKey });
    const allResults: SearchResult[] = [];

    try {
      console.log('📦 Installing dependencies in E2B sandbox...');

      // Install packages
      await sandbox.runCode(`
import subprocess
subprocess.run(['pip', 'install', '-q', 'requests', 'beautifulsoup4', 'duckduckgo-search', 'wikipedia-api'], capture_output=True)
print("Dependencies installed")
      `);

      console.log('🔍 Executing comprehensive search queries...');

      // Comprehensive research queries
      const queries = [
        `${subject} biography`,
        `${subject} family wife children`,
        `${subject} political views Republican Democrat`,
        `${subject} Iran Iranian heritage`,
        `${subject} business company founder`,
        `${subject} controversy criticism`,
        `${subject} net worth`,
        `${subject} podcast YouTube`,
        `${subject} Trump interview`,
        `${subject} Woman Life Freedom Iran opposition`
      ];

      const result = await sandbox.runCode(`
import json
from duckduckgo_search import DDGS
import wikipediaapi
import time

subject = "${subject.replace(/"/g, '\\"')}"
queries = ${JSON.stringify(queries)}

all_results = []
seen_urls = set()

# Wikipedia first
print("Searching Wikipedia...")
try:
    wiki = wikipediaapi.Wikipedia('PRISM/1.0 (research tool)', 'en')
    page = wiki.page(subject)
    if page.exists():
        all_results.append({
            "title": page.title,
            "url": page.fullurl,
            "snippet": page.summary[:800] if page.summary else "",
            "source": "Wikipedia"
        })
        seen_urls.add(page.fullurl)
        print(f"Found Wikipedia page: {page.title}")

        # Get linked pages for more context
        for link_title in list(page.links.keys())[:5]:
            linked_page = wiki.page(link_title)
            if linked_page.exists() and linked_page.fullurl not in seen_urls:
                all_results.append({
                    "title": linked_page.title,
                    "url": linked_page.fullurl,
                    "snippet": linked_page.summary[:500] if linked_page.summary else "",
                    "source": "Wikipedia"
                })
                seen_urls.add(linked_page.fullurl)
except Exception as e:
    print(f"Wikipedia error: {e}")

# DuckDuckGo searches
print("Searching DuckDuckGo...")
try:
    with DDGS() as ddgs:
        for query in queries:
            print(f"  Query: {query[:50]}...")
            try:
                for r in ddgs.text(query, max_results=5):
                    url = r.get("href", "")
                    if url and url not in seen_urls:
                        all_results.append({
                            "title": r.get("title", ""),
                            "url": url,
                            "snippet": r.get("body", ""),
                            "source": "DuckDuckGo"
                        })
                        seen_urls.add(url)
                time.sleep(0.5)  # Rate limiting
            except Exception as e:
                print(f"  Query error: {e}")
                continue
except Exception as e:
    print(f"DDG error: {e}")

print(f"Total results: {len(all_results)}")
print("---JSON_START---")
print(json.dumps(all_results, ensure_ascii=False))
print("---JSON_END---")
      `);

      // Parse results
      if (result.logs && result.logs.stdout) {
        const output = result.logs.stdout.join('\n');
        console.log('E2B Output preview:', output.substring(0, 500));

        const jsonMatch = output.match(/---JSON_START---([\s\S]*?)---JSON_END---/);
        if (jsonMatch && jsonMatch[1]) {
          const parsed = JSON.parse(jsonMatch[1].trim()) as SearchResult[];
          allResults.push(...parsed);
        }
      }

      console.log(`✅ Collected ${allResults.length} search results from E2B sandbox`);
      return allResults;

    } finally {
      await sandbox.kill();
    }
  }
}

/**
 * Run research using E2B
 */
export async function runE2BResearch(subject: string): Promise<SearchResult[]> {
  const provider = new E2BSearchProvider();
  return provider.researchSubject(subject);
}
