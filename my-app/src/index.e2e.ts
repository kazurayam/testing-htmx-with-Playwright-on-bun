// src/index.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';
import { chromium } from 'playwright-chromium';

describe('E2E testing using playwright-chromium', async () => {
    /* Here I assume that the server at http://localhost:3000 is up and running.
     * I can start the server by "bun run dev".
     */
    it("Click the button, then a text 'こんにちは!' should appear", async () => {
        // Launch the browser
        const browser = await chromium.launch()
        // Create a new page and navigate to a URL
        const page = await browser.newPage();
        await page.goto('http://localhost:3000');
        //
        const button = page.getByText('読み込み');
        expect(await button.isVisible()).toBeTrue();
        // Click the button!
        await button.click();
        const p = page.getByText('こんにちは!');
        expect(await button.isVisible()).toBeTrue();
        // Clean up
        await browser.close();
    });
})
