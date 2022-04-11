// ran "npm init -y" in terminal to create package.json
// - now we can install packages
// install puppeteer with "npm install puppeteer" -> headless browser
// after installing a package (puppeteer) we now have a package-lock.json

//require puppeteer from puppeteer package
const puppeteer = require("puppeteer");

// playwright.js -> look up for web scraping

function asDateString(date) {
  return `${date.getFullYear().toString(10)}-${(date.getMonth() + 1)
    .toString(10)
    .padStart(2, "0")}-${date.getDate().toString(10).padStart(2, "0")}`;
}

function today() {
  return asDateString(new Date());
}

async function scrapeProduct(url) {
  // await puppeteer to launch headless browser
  const browser = await puppeteer.launch();
  // await puppeteer to give us blank new page in browser
  const page = await browser.newPage();
  //
  await page.goto(url);

  // paste xpath here $x(``)
  // using page.$x() is like using query on page /open page const
  // using [el] is pulling out first item of array
  // const [el] = await page.$x(`/html/body/div[5]/table/tbody/tr[1]/td[5]/span`);
  let outputArray = [];

  for (let i = 1; i < 100; i++) {
    // Rank
    let xpathRank = `//*[@id="cmkt"]/div[5]/table/tbody/tr[${i}]/td[2]/div[2]/a/div[2]`;

    const [el3] = await page.$x(xpathRank);

    const txt3 = await el3.getProperty("textContent");

    const rankProperty = await txt3.jsonValue();

    const modifiedRank = rankProperty.replace(/[A-Z]/g, "");

    const market_cap_rank = Number(modifiedRank);

    //Market Cap
    let xpathMarketCap = `//*[@id="cmkt"]/div[5]/table/tbody/tr[${i}]/td[3]`;

    const [el5] = await page.$x(xpathMarketCap);

    const txt5 = await el5.getProperty("textContent");

    const marketCapProperty = await txt5.jsonValue();

    let market_cap;

    if (marketCapProperty.includes("T")) {
      modifiedMarketCap = marketCapProperty
        .replace(/[' ', $, T, "." ]/g, "")
        .concat("000000000");
    } else if (marketCapProperty.includes("B")) {
      modifiedMarketCap = marketCapProperty
        .replace(/[' ', $, B, "." ]/g, "")
        .concat("0000000");
    }

    market_cap = Number(modifiedMarketCap);

    // Company Name
    let xpathCompanyName = `//*[@id="cmkt"]/div[5]/table/tbody/tr[${i}]/td[2]/div[2]/a/div[1]`;

    const [el4] = await page.$x(xpathCompanyName);

    const txt4 = await el4.getProperty("textContent");

    const companyNameProperty = await txt4.jsonValue();

    const company_name = companyNameProperty.replace(/[\n]/g, "");

    // Ticker
    let xpathTicker = `//*[@id="cmkt"]/div[5]/table/tbody/tr[${i}]/td[2]/div[2]/a/div[2]`;

    const [el2] = await page.$x(xpathTicker);

    const txt2 = await el2.getProperty("textContent");

    const tickerProperty = await txt2.jsonValue();

    const ticker = tickerProperty.replace(/[0-9]/g, "");

    // Price
    let xpathPrice = `//*[@id="cmkt"]/div[5]/table/tbody/tr[${i}]/td[4]`;

    const [el6] = await page.$x(xpathPrice);

    const txt6 = await el6.getProperty("textContent");

    const priceProperty = await txt6.jsonValue();

    const modifiedPrice = priceProperty.replace(/[$]/g, "");

    const price = Number(modifiedPrice);

    // PercentChange
    let xpathPercentChange = `//*[@id="cmkt"]/div[5]/table/tbody/tr[${i}]/td[5]/span`;

    const [el] = await page.$x(xpathPercentChange);

    const txt = await el.getProperty("textContent");

    const percentChangePropety = await txt.jsonValue();

    const modifiedPercentChange = percentChangePropety.replace(/[' ', %]/g, "");

    const percent_change = Number(modifiedPercentChange);

    // Date
    const date = today();

    if (!ticker.includes(".") || !market_cap > 300000000) {
      outputArray.push({
        market_cap_rank,
        market_cap,
        market_cap_size:
          (market_cap > 300000000) && (market_cap < 2000000000)
            ? (market_cap_size = "Small Cap")
            : (market_cap < 10000000000) & (market_cap > 2000000000)
            ? (market_cap_size = "Medium Cap")
            : (market_cap_size = "Large Cap"),
        company_name,
        ticker,
        price,
        percent_change,
        date,
      });
    }
    // using (rawTxt) returns an Array
    //using ({rawTxt}) returns an Array of Objects
    // console.log({rawTxt});
    // browser.close()
    outputArray.sort(
      (tickerA, tickerB) => tickerB.percent_change - tickerA.percent_change
    );
  }
  return outputArray;
  //   console.log(outputArray);
}

// scrapeProduct("https://companiesmarketcap.com/top-companies-by-market-cap-gain/");

// scrapeProduct("https://companiesmarketcap.com/top-companies-by-market-cap-loss/#");

// scrapeProduct("https://companiesmarketcap.com/");

async function scrapeAllPages() {
  let output = [];

  // change back to i <= 60 for full scan
  try {
    await scrapeProduct("https://companiesmarketcap.com/").then((data) =>
      output.push(...data)
    );

    for (let i = 2; i <= 60; i++) {
      await scrapeProduct(`https://companiesmarketcap.com/page/${i}/`).then(
        (data) => output.push(...data)
      );
    }
  } catch (error) {
    console.log(error);
  }

  const finalSort = output.sort(
    (tickerA, tickerB) => tickerB.percent_change - tickerA.percent_change
  );

  const top100Gainers = finalSort.splice(0, 101);
  const top100Losers = finalSort.splice(
    finalSort.length - 101,
    finalSort.length - 1
  );

  console.log("Top 100 Gainers ==>");
  console.table(top100Gainers);
  console.log("Top 100 Losers ==>");
  console.table(top100Losers);

  console.log("Stocks Checked:", finalSort.length - 1);
  outputArray = finalSort;
  // console.table(outputArray);
  return outputArray;
}

scrapeAllPages();

