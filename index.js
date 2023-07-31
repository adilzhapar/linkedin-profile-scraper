import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import fs from 'fs';
import csvParser from 'csv-parser';

dotenv.config();

const scrapeLinkedin = async (links) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--disable-popup-blocking'] 
    });

    const waitUntilOptions = ["domcontentloaded", "networkidle2"];

    try {
        const page = await browser.newPage();

        await page.setViewport({ width: 1280, height: 1080 });
        page.setDefaultNavigationTimeout(0);

        await page.goto(links[0], { waitUntil: waitUntilOptions });
        
        await page.click('.authwall-join-form__form-toggle--bottom');
        
        page.setDefaultTimeout(3 * 1000);
        
        await page.type('#session_key', process.env.LINKEDIN_USERNAME);
        await page.type('#session_password', process.env.LINKEDIN_PASSWORD);
        await page.click('button.sign-in-form__submit-btn--full-width');
        
        await page.waitForNavigation({ waitUntil: waitUntilOptions });
        
        // await page.screenshot({ path: 'example.png' });
        const data = [];
        for(let link = 0; link < 10; link++){
            let workPlace = '';
            let position = '';
            try{
                await page.goto(links[link]);

                workPlace = await page.$eval('.pvs-entity', el=> el.innerHTML);
            
                // workPlace = await page.$eval('.pv-text-details__right-panel-item-text', el => el.children[0].innerHTML.trim());
                // position = await page.$eval('.text-body-medium', el => el.innerHTML.trim());
            } catch (error) {
                console.log(links[link], error);
            }
            data.push([links[link], workPlace]);
        }

        const csvData = data.map(row => row.join(',')).join('\n');
        fs.writeFile('./output.csv', csvData, (err) => {
            if (err) {
              console.error('Error writing to the file:', err);
            } else {
              console.log('Data has been written to the CSV file successfully.');
            }
          });

    } catch (error) {
        console.log(error);
    } finally {
        console.log("nothing happened")
    }
     await browser.close();
}

const getFilteredLinks = async () => {
    return new Promise((resolve, reject) => {
        let emails = []
        fs.createReadStream('emails.csv')
            .pipe(csvParser())
            .on('data', (row) => {
                emails.push(Object.values(row)[0]);
            })
            .on('end', () => {
                resolve(emails)
            })
            .on('error', (err) => {
                console.log(err);
            });

        return emails;
    });
}

let links = await getFilteredLinks();

scrapeLinkedin(links);