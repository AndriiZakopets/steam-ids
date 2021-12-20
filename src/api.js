import axios from 'axios';
import dotenv from 'dotenv';
import querystring from 'querystring';
import rateLimit from 'axios-rate-limit';
import proxyInterceptor, { proxyCount } from './proxy.js';
import { sleep } from './helpers.js';
dotenv.config();
const { API_KEY } = process.env;

console.log('import api');

const proxyAxios = axios.create();
proxyAxios.interceptors.request.use(proxyInterceptor);
const request = rateLimit(proxyAxios, {
  maxRequests: proxyCount,
  perMilliseconds: +process.env.REQUEST_TIMEOUT || 1000,
});

export function getPage(name) {
  return request.get(`https://steamcommunity.com/market/listings/730/${encodeURI(name)}`).then(({data}) => data);
}

export function getItemsBitskins(code) {
  return request.get(
    `https://bitskins.com/api/v1/get_all_item_prices/?api_key=d5c0b0d8-3662-4efc-9351-4da9e56de438&app_id=730&code=${code}`
  ).then(({data}) => data);
}

export function getPrices(hash_name, item_nameid) {
  return request.get(
    `https://steamcommunity.com/market/itemordershistogram?country=UA&language=russian&currency=18&item_nameid=${item_nameid}&two_factor=0&norender=1`,
    {
      headers: {
        Referer: `https://steamcommunity.com/market/listings/730/${hash_name}`,
        Host: 'steamcommunity.com',
      },
    }
  ).then(({data}) => data);
}

export function ping() {
  return request.get(`https://steamids-parse.herokuapp.com/`).then(({data}) => data);
}

const getSteamApiPage = async function (start = 0, count = 100) {
  const response = await request.get('https://steamcommunity.com/market/search/render/', {
    headers: { Cookie: process.env.COOKIE },
    params: {
      count,
      start,
      sort_dir: 'desc',
      norender: 1,
      sort_column: 'popular',
      appid: 730,
    },
  }).then(({data}) => data);

  if (response.status != 200) throw 1;

  const price = response.results[0].sell_price_text;

  if (price[price.length - 1] != '₴') {
    throw new Error('Invalid currency (update cookie.txt file)');
  }

  return response;
};

export const retry = async function retry(callback, args, attempts = 5, timeout = 15000) {
  if (attempts === 0) return callback(...args);

  try {
    return await callback(...args);
  } catch (e) {
    console.log('retry');
    await sleep(timeout);
    return retry(callback, args, attempts - 1, timeout);
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
    promiseArray.push(retry(getSteamApiPage, [start, pageSize]));
  }

  const resultsArr = await Promise.all(promiseArray);

  for (const i of resultsArr) {
    for (const item of i.results) {
      items.push(item);
    }
  }

  return items;
};

export const getPricesClassInstance = () => {
  return request.get('https://market.csgo.com/api/v2/prices/class_instance/RUB.json').then(({data}) => data);
};

export const getMassInfo = (itemArray, SELL = 0, BUY = 0, HISTORY = 0, INFO = 0) =>
  request.post(
    `https://market.csgo.com/api/MassInfo/${SELL}/${BUY}/${HISTORY}/${INFO}?key=${API_KEY}`,
    {
      data: querystring.stringify({
        list: itemArray.reduce(
          (prev, curr, i) => `${prev}${i ? ',' : ''}${curr.classid}_${curr.instanceid}`,
          ''
        ),
      }),
    }
  ).then(({data}) => data);

export const buy = ({ classid, instanceid }, price, hash = '') =>
  request.get(`https://market.csgo.com/api/Buy/${classid}_${instanceid}/${price}/${hash}/`, {
    params: { key: API_KEY },
  }).then(({data}) => data);

export const getPriceOverview = (market_hash_name) =>
  request.get(`https://steamcommunity.com/market/priceoverview/`, {
    params: { market_hash_name, appid: 730, currency: 18 },
  }).then(({data}) => data);

export const getItems = () =>
  request.get(`https://market.csgo.com/api/v2/items/`, {
    params: { key: API_KEY },
  }).then(({data}) => data);

export const getSellOffers = ({ classid, instanceid }) =>
  request.get(`https://market.csgo.com/api/SellOffers/${classid}_${instanceid}/`, {
    params: { key: API_KEY },
  }).then(({data}) => data);

export const getMyInventory = () =>
  request.get(`https://market.csgo.com/api/v2/my-inventory/`, {
    params: { key: API_KEY },
  }).then(({data}) => data);

export const addToSale = (id, price, cur) =>
  request.get(`https://market.csgo.com/api/v2/add-to-sale/`, {
    params: { id, price, cur, key: API_KEY },
  }).then(({data}) => data);

export const setPrice = (item_id, price, cur) =>
  request.get(`https://market.csgo.com/api/v2/set-price/`, {
    params: { item_id, price, cur, key: API_KEY },
  }).then(({data}) => data);
