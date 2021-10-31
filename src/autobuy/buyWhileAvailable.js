import { buy } from '../api.js';
import { createPriceOverview } from './createPriceOverview.js';

const getPriceOverview = createPriceOverview();

export const buyWhileAvailable = async (item, maxRate, maxPrice) => {
  try {
    const priceOverview = await getPriceOverview(item.info.market_hash_name);

    for (const offer of item.sell_offers.offers) {
      const rate = offer[0] / priceOverview.lowestPrice / 87;

      if (rate <= maxRate && offer[0] > maxPrice) {
        console.log(`price is too high: ${item.info.market_hash_name} ${rate} ${offer[0]}`);
      }

      if (!maxRate || !rate || rate > maxRate || offer[0] > maxPrice) {
        throw 0;
      }

      for (let i = 0; i < offer[1]; i++) {
        const { data: response } = await buy(item, offer[0]);

        if (response.result === 'ok') {
          console.log(item.info.market_hash_name, rate, offer[0] / 100, response);
        } else {
          console.log(response.result);
          break;
        }
      }
    }

    throw 0;
  } catch (e) {
    return Promise.resolve();
  }
};
