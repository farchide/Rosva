/**
 * E2B Sandbox Integration for Rosva
 *
 * Runs research tasks in an isolated E2B sandbox environment.
 */

import { Sandbox } from '@e2b/code-interpreter';

const E2B_API_KEY = process.env.E2B_API_KEY || 'e2b_f5002b9e2454a3f8fcd111690e585b4e9d5ceaf7';

interface SandboxConfig {
  timeout?: number;
  template?: string;
}

/**
 * Create and run code in E2B sandbox
 */
export async function runInSandbox(code: string, config: SandboxConfig = {}): Promise<any> {
  console.log('[E2B] Creating sandbox...');

  const sandbox = await Sandbox.create({
    apiKey: E2B_API_KEY,
    ...config
  });

  try {
    console.log('[E2B] Sandbox created, executing code...');
    const result = await sandbox.runCode(code);
    console.log('[E2B] Execution complete');
    return result;
  } finally {
    await sandbox.kill();
    console.log('[E2B] Sandbox terminated');
  }
}

/**
 * Run a web search query in sandbox
 */
export async function sandboxWebSearch(query: string): Promise<string[]> {
  const code = `
import urllib.request
import urllib.parse
import json

query = "${query.replace(/"/g, '\\"')}"
encoded = urllib.parse.quote(query)

# Use DuckDuckGo instant answer API (no auth required)
url = f"https://api.duckduckgo.com/?q={encoded}&format=json&no_html=1"

try:
    with urllib.request.urlopen(url, timeout=10) as response:
        data = json.loads(response.read().decode())
        results = []

        if data.get('Abstract'):
            results.append(data['Abstract'])

        for topic in data.get('RelatedTopics', [])[:5]:
            if isinstance(topic, dict) and topic.get('Text'):
                results.append(topic['Text'])

        print(json.dumps(results))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;

  const result = await runInSandbox(code);
  try {
    const output = result.logs?.stdout?.[0] || '[]';
    return JSON.parse(output);
  } catch {
    return [];
  }
}

/**
 * Fetch and parse a webpage in sandbox
 */
export async function sandboxFetchPage(url: string): Promise<{ title: string; text: string }> {
  const code = `
import urllib.request
import re
import json

url = "${url.replace(/"/g, '\\"')}"

try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (compatible; RosvaBot/1.0)'})
    with urllib.request.urlopen(req, timeout=15) as response:
        html = response.read().decode('utf-8', errors='ignore')

        # Extract title
        title_match = re.search(r'<title[^>]*>([^<]+)</title>', html, re.IGNORECASE)
        title = title_match.group(1).strip() if title_match else ''

        # Remove script and style
        html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
        html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)

        # Remove tags and get text
        text = re.sub(r'<[^>]+>', ' ', html)
        text = re.sub(r'\\s+', ' ', text).strip()

        # Limit to first 5000 chars
        text = text[:5000]

        print(json.dumps({"title": title, "text": text}))
except Exception as e:
    print(json.dumps({"error": str(e), "title": "", "text": ""}))
`;

  const result = await runInSandbox(code);
  try {
    const output = result.logs?.stdout?.[0] || '{}';
    return JSON.parse(output);
  } catch {
    return { title: '', text: '' };
  }
}

/**
 * Main test function
 */
async function main() {
  console.log('=== Rosva E2B Sandbox Test ===\n');

  // Test 1: Basic sandbox
  console.log('Test 1: Basic sandbox execution');
  try {
    const result = await runInSandbox('print("Hello from E2B sandbox!")');
    console.log('Result:', result.logs?.stdout);
    console.log('Status: PASS\n');
  } catch (error) {
    console.error('Error:', error);
    console.log('Status: FAIL\n');
  }

  // Test 2: Web search
  console.log('Test 2: Web search in sandbox');
  try {
    const results = await sandboxWebSearch('Amir Abbas Fakhravar Iranian activist');
    console.log('Search results:', results.slice(0, 3));
    console.log('Status:', results.length > 0 ? 'PASS' : 'PARTIAL\n');
  } catch (error) {
    console.error('Error:', error);
    console.log('Status: FAIL\n');
  }

  // Test 3: Page fetch
  console.log('Test 3: Fetch webpage in sandbox');
  try {
    const page = await sandboxFetchPage('https://en.wikipedia.org/wiki/Amir_Abbas_Fakhravar');
    console.log('Page title:', page.title);
    console.log('Text preview:', page.text.substring(0, 200) + '...');
    console.log('Status:', page.text.length > 0 ? 'PASS' : 'FAIL\n');
  } catch (error) {
    console.error('Error:', error);
    console.log('Status: FAIL\n');
  }

  console.log('=== Sandbox tests complete ===');
}

// Run if executed directly
main().catch(console.error);

export { Sandbox };
