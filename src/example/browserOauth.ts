import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { PuppeteerExtra } from "puppeteer-extra";

export async function getAuthCode() {
  (puppeteer as unknown as PuppeteerExtra).use(StealthPlugin());

  return new Promise<string>(async (resolve) => {
    const browser = await (puppeteer as unknown as PuppeteerExtra).launch({
      headless: false, // or 'new' in the latest Puppeteer to get partial headless mode
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setRequestInterception(true);

    console.log(
      "Please log in manually. The script will watch for the final redirect URL."
    );

    let oauthCode = null;

    page.on("request", async (request) => {
      const reqUrl = request.url();
      // If the request includes the OAuth code, capture it and abort
      if (reqUrl.includes("trade.thinkorswim.com/oauth?code=")) {
        const urlObj = new URL(reqUrl);
        oauthCode = urlObj.searchParams.get("code");
        console.log("OAuth Code Captured:", oauthCode);
        // Abort the request so the code isn't consumed
        return request.abort();
      }

      // Otherwise, let all other requests proceed normally
      request.continue();
    });

    await page.goto("https://trade.thinkorswim.com/");

    // Wait until we pick up the code
    while (!oauthCode) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    await browser.close();
    resolve(oauthCode);
  });
}
