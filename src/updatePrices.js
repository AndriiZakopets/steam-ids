import './db.js';
import { getPrices, getSteamPrices, getPricesClassInstance, retry } from './api.js';
import { Item, Price } from './models.js';

const idMap = {};
const itemsIds = await Item.find({}).exec();
itemsIds.forEach(({ market_hash_name, item_nameid }) => {
  idMap[market_hash_name] = item_nameid;
});

const steamPrices = await getSteamPrices(parseInt(process.argv[2] || '1000'));

function getTs() {
  return new Date();
}
const steam = {};
const delay = 100;

let startTs = getTs();
let errors = 0;
let total = 0;
const promiseArr = [];
for (let i = 0; i < steamPrices.length; i++) {
  const fromStart = getTs() - startTs;
  const timeout = i * delay - fromStart;
  await new Promise((res) => setTimeout(res, timeout > 0 ? timeout : 0));
  const name = steamPrices[i].hash_name;
  const promise = retry(getPrices, [name, idMap[name]], 2, 5000);
  promise.then(async (prices) => {
      console.log(`${i}. ${fromStart / 1000} ${name}: ${prices.buy_order_price}`);
      steam[name] = parseInt(prices.highest_buy_order);
    })
    .catch((e) => {
      errors++;
    })
    .finally(() => {
      total++;
      console.log(`errors: ${errors}/${total} (${((100 * errors) / total).toFixed(2)}%)`);
    });
  promiseArr.push(promise);
}

await Promise.allSettled(promiseArr);

const response = await getPricesClassInstance();
console.log('cstm done.');
const arr = [];
for (const class_instance in response.items) {
  if (response.items[class_instance].popularity_7d === null) continue;

  const obj = {
    class_instance,
    market_hash_name: response.items[class_instance].market_hash_name,
    popularity_7d: Number(response.items[class_instance].popularity_7d),
    avg_price: Math.floor(Number(response.items[class_instance].avg_price) * 100),
    buy_order: Math.floor(Number(response.items[class_instance].buy_order) * 100),
    price: Math.floor(Number(response.items[class_instance].price) * 100),
  };

  arr.push(obj);
}

arr.sort((first, second) => second.popularity_7d - first.popularity_7d);

await Price.collection.drop();
const saveArray = [];
for (const item of arr) {
  if (typeof steam[item.market_hash_name] === 'undefined') continue;
  console.log(steam[item.market_hash_name]);
  const price = new Price({
    name: item.market_hash_name,
    steamPrice: steam[item.market_hash_name] / 100,
    csgotmAveragePrice: item.avg_price / 100,
    rate: (0.95 * item.avg_price) / steam[item.market_hash_name],
    popularity: item.popularity_7d,
    classInstance: item.class_instance,
    steamLink: `https://steamcommunity.com/market/listings/730/${item.market_hash_name}`,
    csgotmLink: `https://market.csgo.com/item/${item.class_instance.split('_').join('-')}`
  });
  const save = price.save();
  saveArray.push(save);
}

await Promise.allSettled(saveArray);
console.log('done');
