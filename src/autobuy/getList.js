import { getPricesClassInstance } from '../api.js';

export const getList = async (size = 200, maxPrice) => {
  const prices = await getPricesClassInstance();
  const table = [];
  const list = new Array(size);

  for (const ci in prices.items) {
    if (
      prices.items[ci].popularity_7d === null ||
      parseFloat(prices.items[ci].avg_price) * 100 > maxPrice
    )
      continue;
    table.push(ci);
  }

  table.sort((f, s) => prices.items[s].popularity_7d - prices.items[f].popularity_7d);

  for (let i = 0; i < size; i++) {
    const [classid, instanceid] = table[i].split('_');
    list[i] = {
      classid,
      instanceid,
    };
  }

  return list;
};
