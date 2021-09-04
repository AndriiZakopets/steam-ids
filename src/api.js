import axios from 'axios';
import rateLimit from 'axios-rate-limit';
console.log('import api');
const limitedAxios = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 90000 });

export function getPage(name) {
  return limitedAxios.get(`https://steamcommunity.com/market/listings/730/${name}`);
}

export function getItemsBitskins(code) {
  return axios.get(`https://bitskins.com/api/v1/get_all_item_prices/?api_key=d5c0b0d8-3662-4efc-9351-4da9e56de438&app_id=730&code=${code}`);
}