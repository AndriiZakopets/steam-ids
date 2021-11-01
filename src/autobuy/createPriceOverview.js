import fs from 'fs';
import { sleep } from '../utils.js';
import { getPriceOverview } from '../api.js';
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({ maxConcurrent: 1, minTime: 1000 });
const limitedGetPriceOverview = limiter.wrap((name) => getPriceOverview(name));

const retryPriceOverview = async function repeat(callback, name) {
  console.log(`getting price for ${name}`);
  try {
    const { data: response } = await callback(name);

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
  let priceOverview = {};
  try {
    priceOverview = JSON.parse(fs.readFileSync('./src/autobuy/priceOverview.json'));
  } catch (e) {}

  return async (name) => {
    const timestamp = new Date().getTime();

    if (!priceOverview[name] || timestamp - priceOverview[name].timestamp > 1000 * 60 * 60 * 10) {
      const newPrice = await retryPriceOverview(limitedGetPriceOverview, name);
      console.log(
        `new priceOverview (${Object.keys(priceOverview).length}) ${name}: ${newPrice.lowest_price}`
      );

      priceOverview[name] = {
        lowestPrice: parsePrice(newPrice.lowest_price),
        medianPrice: parsePrice(newPrice.median_price),
        volume: parseFloat(newPrice.volume),
        timestamp,
      };

      fs.writeFileSync('./src/autobuy/priceOverview.json', JSON.stringify(priceOverview));
    }

    return priceOverview[name];
  };
};
