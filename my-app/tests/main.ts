import { chromium } from 'playwright-chromium';

/**
 * https://stephenhaney.com/2024/playwright-on-fly-io-with-bun/
 */
async function main() {
    // Launch the browser
    const browser = await chromium.launch();

    // Create a new page and navigate to a URL
    const page = await browser.newPage();
    await page.goto('https://example.com');

    // Log the page title to prove it's working
    console.log('Page title:', await page.title());

    // Clean up
    await browser.close();
    //console.log('browser closed');
}

main();
