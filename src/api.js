import axios from 'axios';
import proxyAxios from './proxyAxios.js';
import rateLimit from 'axios-rate-limit';
import fs from 'fs';

console.log('import api');
const limitedAxios = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: +process.env.REQUEST_TIMEOUT || 20000,
});

export function getPage(name) {
  return proxyAxios(`https://steamcommunity.com/market/listings/730/${encodeURI(name)}`);
}

export function getItemsBitskins(code) {
  return axios.get(
    `https://bitskins.com/api/v1/get_all_item_prices/?api_key=d5c0b0d8-3662-4efc-9351-4da9e56de438&app_id=730&code=${code}`
  );
}

export function getPrices(hash_name, item_nameid) {
  return proxyAxios(
    `https://steamcommunity.com/market/itemordershistogram?country=UA&language=russian&currency=18&item_nameid=${item_nameid}&two_factor=0&norender=1`,
    {
      headers: {
        Referer: `https://steamcommunity.com/market/listings/730/${hash_name}`,
        Host: 'steamcommunity.com',
      },
    }
  );
}

export function ping() {
  return axios.get(`https://steamids-parse.herokuapp.com/`);
}

const Cookie = fs.readFileSync('./src/cookie.txt').toString();

const getSteamApiPage = async function (start = 0, count = 100) {
  const response = await proxyAxios('https://steamcommunity.com/market/search/render/', {
    headers: { Cookie },
    params: {
      count,
      start,
      sort_dir: 'desc',
      norender: 1,
      sort_column: 'popular',
      appid: 730,
    },
  });

  if (response.status != 200) throw 1;

  const price = response.data.results[0].sell_price_text;

  if (price[price.length - 1] != '₴') {
    throw new Error('Invalid currency (update cookie.txt file)');
  }

  return response.data;
};

const sleep = async (ms = 1000) => {
  return await new Promise((res) => setTimeout(res, ms));
};

const retry = async function retry(callback, ...args) {
  try {
    return await callback(...args);
  } catch (e) {
    console.log('retry');
    await sleep(15000);
    return retry(callback, ...args);
  }
};

export const getSteamPrices = async (count = 1000) => {
  const items = [];

  const promiseArray = [];
  let leftToParse = count;
  while (leftToParse > 0) {
    const pageSize = leftToParse > 100 ? 100 : leftToParse;
    const start = count - leftToParse;
    leftToParse -= pageSize;
    promiseArray.push(retry(getSteamApiPage, start, pageSize));
  }

  const resultsArr = await Promise.all(promiseArray);

  for (const i of resultsArr) {
    for (const item of i.results) {
      items.push(item);
    }
  }

  return items;
};

export const getPricesClassInstance = () =>
  axios.get('https://market.csgo.com/api/v2/prices/class_instance/RUB.json');
