import axios from 'axios';
import rateLimit from 'axios-rate-limit';
console.log('import api');
const limitedAxios = rateLimit(axios.create(), {
  maxRequests: 1,
  perMilliseconds: +process.env.REQUEST_TIMEOUT || 20000,
});

export function getPage(name) {
  return limitedAxios.get(`https://steamcommunity.com/market/listings/730/${encodeURI(name)}`);
}

export function getItemsBitskins(code) {
  return axios.get(
    `https://bitskins.com/api/v1/get_all_item_prices/?api_key=d5c0b0d8-3662-4efc-9351-4da9e56de438&app_id=730&code=${code}`
  );
}

export function getPrices(item_nameid) {
  return axios.get(
    `https://steamcommunity.com/market/itemordershistogram?country=UA&language=russian&currency=18&item_nameid=${item_nameid}&two_factor=0&norender=1`
  );
}

export function ping() {
  return axios.get(`https://steamids-parse.herokuapp.com/`);
}