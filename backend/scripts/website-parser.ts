import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import puppeteer, { Browser, Page } from 'puppeteer';
import { findParentDir } from '../utils/paths.js';

export interface WebsiteConfig {
  name: string;
  url: string;
  action?: (page: Page) => Promise<void>;
  callback: (page: Page) => Promise<Record<string, any>>;
  waitForSelector?: string;
  waitForTimeout?: number;
  scrollToBottom?: boolean;
  takeScreenshot?: boolean;
  screenshotPath?: string;
}

export interface ParsingResult {
  website: string;
  url: string;
  timestamp: Date;
  data: Record<string, any>;
  screenshot?: string;
  error?: string;
}

export class WebsiteParser {
  private browser: Browser | null = null;
  private isRunning = false;

  constructor(
    private options: any = {
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
  ) {}

  async initialize(): Promise<void> {
    if (this.browser) return;

    try {
      this.browser = await puppeteer.launch(this.options);
      console.log('Puppeteer browser initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Puppeteer browser:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('Puppeteer browser closed');
    }
  }

  async parseWebsite(config: WebsiteConfig): Promise<ParsingResult> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const result: ParsingResult = {
      website: config.name,
      url: config.url,
      timestamp: new Date(),
      data: {},
    };

    let page: Page | null = null;

    try {
      page = await this.browser.newPage();

      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      console.log(`Navigating to ${config.url}...`);
      await page.goto(config.url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      if (config.waitForSelector) {
        await page.waitForSelector(config.waitForSelector, { timeout: 10000 });
      }

      if (config.waitForTimeout) {
        await new Promise(resolve => setTimeout(resolve, config.waitForTimeout));
      }

      if (config.scrollToBottom) {
        await this.scrollToBottom(page);
      }

      if (config.takeScreenshot) {
        const screenshotPath = config.screenshotPath || `screenshots/${config.name}_${Date.now()}.png`;
        await page.screenshot({
          path: screenshotPath as any,
          fullPage: true
        });
        result.screenshot = screenshotPath;
      }

      // Execute the single callback to extract all data
      console.log(`Executing callback for ${config.name}...`);
      if (config.action) {
        await config.action(page);
      }
      result.data = await config.callback(page);

      console.log(`Successfully parsed ${config.name}: ${Object.keys(result.data).length} fields extracted`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.error = errorMessage;
      console.error(`Error parsing ${config.name}:`, errorMessage);
    } finally {
      if (page) {
        await page.close();
      }
    }

    return result;
  }

  async parseMultipleWebsites(configs: WebsiteConfig[]): Promise<ParsingResult[]> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    console.log(`Starting to parse ${configs.length} websites...`);
    const results: ParsingResult[] = [];

    for (const config of configs) {
      try {
        const result = await this.parseWebsite(config);
        results.push(result);

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to parse ${config.name}:`, error);
        results.push({
          website: config.name,
          url: config.url,
          timestamp: new Date(),
          data: {},
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }

  private async scrollToBottom(page: Page): Promise<void> {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  async saveResults(results: ParsingResult[], filename?: string): Promise<void> {
    const defaultFilename = `parsing_results.json`;
    const outputDir = findParentDir('data') || import.meta.url;
    const outputPath = join(outputDir, filename || defaultFilename);

    writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`Results saved to: ${outputPath}`);
  }

  async loadResults(filename: string): Promise<ParsingResult[]> {
    const outputDir = findParentDir('data') || import.meta.url;
    const filePath = join(outputDir, filename);

    if (!existsSync(filePath)) {
      throw new Error(`Results file not found: ${filePath}`);
    }

    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  }
}

// Example website configurations using single callbacks
export const exampleConfigs: WebsiteConfig[] = [
  {
    name: 'Example News Site',
    url: 'https://example.com',
    action: async (page: Page) => {
      await page.evaluate(() => {
        const button = document.querySelector('.detail-link');
        if (button instanceof HTMLElement) {
          button.click();
        }
      });
    },
    callback: async (page: Page) => {
      return {
        title: await page.$eval('h1', el => el.textContent?.trim() || ''),
        articles: await page.$$eval('.article', articles =>
          articles.map(article => article.textContent?.trim() || '').slice(0, 5)
        ),
        links: await page.$$eval('a', links =>
          links.map(link => link.getAttribute('href') || '').slice(0, 10)
        )
      };
    },
    waitForSelector: '.content',
    takeScreenshot: true,
    screenshotPath: 'screenshots/example_news.png'
  }
];

export async function createParser(options?: any): Promise<WebsiteParser> {
  const parser = new WebsiteParser(options);
  await parser.initialize();
  return parser;
}
