import { Page } from "puppeteer";
import { type WebsiteConfig, WebsiteParser } from "../../website-parser.js";
import { OsvitaTransformer } from "./transformer.js";

const sites = [
    {
        name: "Комп'ютерні науки | Національний університет \"Києво-Могилянська академія\"",
        url: 'https://vstup.osvita.ua/y2025/r27/79/1471284/',
    },
    {
        name: "Інженерія програмного забезпечення | Національний університет \"Києво-Могилянська академія\"",
        url: 'https://vstup.osvita.ua/y2025/r27/79/1439956/',
    },
    {
        name: "Інженерія програмного забезпечення | Київський національний університет імені Тараса Шевченка",
        url: 'https://vstup.osvita.ua/y2025/r27/41/1488484/',
    },
    {
        name: "Системна інформатика | Київський національний університет імені Тараса Шевченка",
        url: 'https://vstup.osvita.ua/y2025/r27/41/1493020/',
    },
    {
        name: "Штучний інтелект | Київський національний університет імені Тараса Шевченка",
        url: 'https://vstup.osvita.ua/y2025/r27/41/1436155/',
    },
];

const transformer = new OsvitaTransformer();

const action = async (page: Page) => {
    try {
        console.log('Starting action execution...');

        // Wait for the page to be fully loaded
        await page.waitForSelector('.detail-link', { timeout: 10000 });
        console.log('Detail link selector found, page loaded');

        // Debug: Log all available elements to understand page structure
        const pageElements = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            const elementInfo: Array<{tag: string, class: string, text: string}> = [];
            for (let i = 0; i < Math.min(elements.length, 50); i++) {
                const el = elements[i];
                if (el?.tagName && el?.className) {
                    elementInfo.push({
                        tag: el.tagName,
                        class: el.className,
                        text: el.textContent?.substring(0, 50) || ''
                    });
                }
            }
            return elementInfo;
        });
        console.log('Available elements on page:', pageElements);

        // Check if the detail link exists
        const buttonExists = await page.evaluate(() => {
            const button = document.querySelector('.detail-link span');
            return button !== null;
        });

        if (!buttonExists) {
            console.log('No detail link found, proceeding without clicking');
            // Try to find alternative selectors
            const alternativeSelectors = await page.evaluate(() => {
                const selectors = [
                    '.detail-link',
                    '.expand-link',
                    '.show-more',
                    '.toggle-details',
                    '[onclick*="detail"]',
                    'a[href*="detail"]'
                ];
                const found: Array<{selector: string, count: number}> = [];
                selectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length > 0) {
                        found.push({ selector, count: elements.length });
                    }
                });
                return found;
            });
            console.log('Alternative selectors found:', alternativeSelectors);
            return;
        }

        console.log('Detail link found, attempting to click...');

        // Click the button
        await page.evaluate(() => {
            const button = document.querySelector('.detail-link span');
            if (button instanceof HTMLElement) {
                button.click();
                console.log('Button clicked successfully');
            }
        });

        // Wait for the page to update after clicking
        console.log('Waiting for page to update after click...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('Action execution completed');

    } catch (error) {
        console.error('Error in action:', error);
        // Continue execution even if action fails
    }
};

const callback = async (page: Page) => {
    const html = await page.content();
    const data = transformer.transform(html);

    return data;
}

const osvitaConfigs: WebsiteConfig[] = sites.map(site =>
({
    name: site.name,
    url: site.url,
    action: action,
    callback: callback,
    waitForSelector: '.container',
})
);


export const osvitaParser = async () => {
    const parser = new WebsiteParser();
    await parser.initialize();
    const results = await parser.parseMultipleWebsites(osvitaConfigs);
    await parser.saveResults(results);
}