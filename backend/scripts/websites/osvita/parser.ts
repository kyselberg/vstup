import { eq } from "drizzle-orm";
import { Page } from "puppeteer";
import { db } from "../../../db/index.js";
import { applicants, programs, universities } from "../../../db/schema.js";
import { WebsiteParser, type ParsingResult, type WebsiteConfig } from "../../website-parser.js";
import { OsvitaTransformer } from "./transformer.js";

const sites = [
    {
        name: "Комп'ютерні науки | Національний університет \"Києво-Могилянська академія\"",
        url: 'https://vstup.osvita.ua/y2025/r27/79/1471284/',
        id: '1',
        universityId: '79',
        programId: '1471284',
    },
    {
        name: "Інженерія програмного забезпечення | Національний університет \"Києво-Могилянська академія\"",
        url: 'https://vstup.osvita.ua/y2025/r27/79/1439956/',
        id: '2',
        universityId: '79',
        programId: '1439956',
    },
    {
        name: "Інженерія програмного забезпечення | Київський національний університет імені Тараса Шевченка",
        url: 'https://vstup.osvita.ua/y2025/r27/41/1488484/',
        id: '3',
        universityId: '41',
        programId: '1488484',
    },
    {
        name: "Системна інформатика | Київський національний університет імені Тараса Шевченка",
        url: 'https://vstup.osvita.ua/y2025/r27/41/1493020/',
        id: '4',
        universityId: '41',
        programId: '1493020',
    },
    {
        name: "Штучний інтелект | Київський національний університет імені Тараса Шевченка",
        url: 'https://vstup.osvita.ua/y2025/r27/41/1436155/',
        id: '5',
        universityId: '41',
        programId: '1436155',
    },
    {
        name: "Системний аналіз та наука про дані | Київський національний економічний університет імені Вадима Гетьмана",
        url: "https://vstup.osvita.ua/y2025/r27/337/1451893/",
        id: '6',
        universityId: '337',
        programId: '1451893',
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
            const elementInfo: Array<{ tag: string, class: string, text: string }> = [];
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
                const found: Array<{ selector: string, count: number }> = [];
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
    id: site.id,
    name: site.name,
    url: site.url,
    universityId: site.universityId,
    programId: site.programId,
    action: action,
    callback: callback,
    waitForSelector: '.container',
})
);

const updateUniversities = async (data: ParsingResult[]) => {
    for (const item of data) {
        const university = {
            id: item.universityId,
            name: item.data.university,
        };

        const result = await db.select().from(universities).where(eq(universities.id, university.id)).limit(1);

        if (!result.length) {
            console.log(`University ${university.name} not found, inserting...`);
            await db.insert(universities).values(university);
        } else {
            console.log(`University ${university.name} found, skipping...`);
        }
    }
}

const updatePrograms = async (data: ParsingResult[]) => {
    for (const item of data) {
        const program = {
            id: item.programId,
            name: item.data.programName,
            speciality_name: item.data.speciality,
            university_id: item.universityId,
            total: item.data.amounts.totalPlaces,
            budget: item.data.amounts.budgetPlaces,
            contract: item.data.amounts.contractPlaces,
        };
        console.log(program);

        const result = await db.select().from(programs).where(eq(programs.id, program.id)).limit(1);

        if (!result.length) {
            console.log(`Program ${program.name} not found, inserting...`);
            await db.insert(programs).values(program);
        } else {
            console.log(`Program ${program.name} found, skipping...`);
        }
    }
}

const updateApplicants = async (data: ParsingResult[]) => {
    for (const item of data) {

        const [program] = await db.select().from(programs).where(eq(programs.id, item.programId)).limit(1);

        if (!program) {
            console.log(`Program ${item.programId} not found, skipping...`);
            continue;
        }

        await db.delete(applicants).where(eq(applicants.program_id, program.id));

        for (const [index, rawApplicant] of item.data.table.entries()) {
            const applicant = {
                id: `${item.programId}_${index + 1}`,
                program_id: item.programId,
                name: rawApplicant.name,
                priority: rawApplicant.priority,
                status: rawApplicant.state,
                mark: rawApplicant.marks,
                type: rawApplicant.type,
                position: index + 1,
            };

            try {
                await db.insert(applicants).values(applicant);
            } catch (error) {
                console.error(`Error inserting applicant ${rawApplicant.name}:`, error);
            }
        }
    }
}

const saveToDb = async (data: ParsingResult[]) => {
    await updateUniversities(data);
    await updatePrograms(data);
    await updateApplicants(data);
}


export const osvitaParser = async () => {
    const parser = new WebsiteParser();
    await parser.initialize();
    const results = await parser.parseMultipleWebsites(osvitaConfigs);
    await saveToDb(results);
    await parser.close();
}