import { sleep } from '../utils.js';
import { getPriceOverview } from '../api.js';
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 1000 });
const limitedGetPriceOverview = limiter.wrap((name) => getPriceOverview(name));

const retryPriceOverview = async function repeat(callback, name) {
  console.log(`getting price for ${name}`);
  try {
    const {data: response} = await callback(name);

    if (!(response.success && response.lowest_price && response.volume && response.median_price))
      throw 1;

    return response;
  } catch (e) {
    await sleep(10000);
    console.log('priceOverviev error');
    return await repeat(callback, name);
  }
};

export const createPriceOverview = function () {
  const parsePrice = (price = '') => parseFloat(price.replace(',', '.'));
  const priceOverview = {};

  return async (name) => {
    if (!priceOverview[name]) {
      const newPrice = await retryPriceOverview(limitedGetPriceOverview, name);
      console.log(`new priceOverview (${Object.keys(priceOverview).length}) ${name}: ${newPrice.lowest_price}`);

      priceOverview[name] = {
        lowestPrice: parsePrice(newPrice.lowest_price),
        medianPrice: parsePrice(newPrice.median_price),
        volume: parseFloat(newPrice.volume),
      };
    }

    return priceOverview[name];
  };
};
