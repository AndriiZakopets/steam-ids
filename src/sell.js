import readline from 'readline-sync';
import { getMyInventory, getSellOffers, addToSale, setPrice } from './api.js';
import { sleep } from './helpers.js';

async function getItemId() {
  const { items } = await getMyInventory();
  if (items.length === 0) throw new Error('No items, update inventory.');

  for (let i = 0; i < items.length; i++) {
    console.log(`${i} - ${items[i].market_hash_name}`);
  }

  const id = readline.question('Select item id . . . ');
  return items[id];
}

async function getHighestPrice(item, minPrice) {
  const sellOffers = (await getSellOffers(item)).offers;
  for (let i = 0; i < sellOffers.length; i++) {
    const currentOrderPrice = sellOffers[i].price - 1;

    if (currentOrderPrice < minPrice) continue;

    if (sellOffers[i].my_count > 0) {
      return sellOffers[i + 1].price - 1;
    }

    return currentOrderPrice;
  }
  return minPrice;
}

async function getNewPrice(item, minPrice, maxPrice) {
  let newPrice = await getHighestPrice(item, minPrice);
  newPrice = Math.min(newPrice, maxPrice);
  console.log(item.market_hash_name, newPrice);
  return newPrice;
}

const itemForSale = await getItemId();
console.log(itemForSale);

const minPrice = +readline.question('Min price in cents . . . ');
const maxPrice = +readline.question('Max price in cents (Infinity) . . . ') || Infinity;
if (maxPrice < minPrice) throw new Error(`maxPrice can't be less than minPrice`);

const firstPrice = await getNewPrice(itemForSale, minPrice, maxPrice);
const { item_id } = await addToSale(itemForSale.id, firstPrice, 'RUB');

while (true) {
  const nextPrice = await getNewPrice(itemForSale, minPrice, maxPrice);
  await setPrice(item_id, nextPrice, 'RUB');
  await sleep(5000);
}
