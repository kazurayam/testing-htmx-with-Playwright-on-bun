// src/index.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { chromium } from 'playwright-chromium';

describe('E2E testing using playwright-chromium', async () => {
    /* Here I assume that the server at http://localhost:3000 is up and running.
     * I can start the server by "bun run dev".
     */
    let browser = null;
    beforeAll(async () => {
        // Launch the browser
        browser = await chromium.launch()
    })
    it("should return HTML content with 'Hello htmx!'", async () => {
        // Create a new page and navigate to a URL
        const page = await browser.newPage();
        await page.goto('http://localhost:3000');
        //
        const button = page.getByText('読み込み');
        expect(await button.isVisible()).toBeTrue();
    })
    afterAll(async () => {
        // Clean up
        await browser.close();
    })
})
