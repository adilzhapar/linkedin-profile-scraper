import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config();

const scrapeLinkedin = async (url) => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--disable-popup-blocking'] 
    });

    const waitUntilOptions = ["domcontentloaded", "networkidle2"];

    try {
        const page = await browser.newPage();

        await page.setViewport({ width: 1280, height: 1080 });
        page.setDefaultNavigationTimeout(0);

        await page.goto(url, { waitUntil: waitUntilOptions });
        
        await page.click('.authwall-join-form__form-toggle--bottom');
        
        page.setDefaultTimeout(3 * 1000);
        
        await page.type('#session_key', process.env.LINKEDIN_USERNAME);
        await page.type('#session_password', process.env.LINKEDIN_PASSWORD);
        await page.click('button.sign-in-form__submit-btn--full-width');
        
        await page.waitForNavigation({ waitUntil: waitUntilOptions });
        
        // await page.screenshot({ path: 'example.png' });
        await page.goto(url, { waitUntil: waitUntilOptions });
        
        let workPlace = await page.$eval('.pv-text-details__right-panel-item-text', el => el.children[0].innerHTML.trim());
        let position = await page.$eval('.text-body-medium', el => el.innerHTML.trim());
        console.log(workPlace);
        console.log(position);
    } catch (error) {
        console.log(error);
    } finally {
        console.log("nothing happened")
    }
     await browser.close();
}

const getFilteredLinks = () => {
    
}

links = getFilteredLinks();
scrapeLinkedin(links);