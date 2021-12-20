import readline from 'readline-sync';
import { getMyInventory, getSellOffers, getItems, addToSale, setPrice } from './api.js';
import { sleep } from './helpers.js';

async function getInventory() {
  try {
    const inventory = await getMyInventory();
    if (inventory.items.length === 0) throw new Error('No items, update inventory.');
    return inventory.items;
  } catch (error) {
    throw error;
  }
}

function getItemId(inventory) {
  for (let i = 0; i < inventory.length; i++) {
    console.log(`${i} - ${inventory[i].market_hash_name}`);
  }

  const id = readline.question('Select item id . . . ');
  return inventory[id];
}

async function getNewPrice(item, minPrice) {
  try {
    const sellOffers = (await getSellOffers(item)).offers;
    for (let i = 0; i < sellOffers.length; i++) {
      const currentOrderPrice = sellOffers[i].price - 1;

      if (currentOrderPrice < minPrice) continue;

      if (sellOffers[i].my_count > 0) {
        return sellOffers[i + 1].price - 1;
      }

      return currentOrderPrice;
    }
    return 0;
  } catch (error) {
    throw error;
  }
}

async function getItemStatus(item_id) {
  const items = (await getItems()).items;

  for (const item of items) {
    if (item.item_id == item_id) return +item.status;
  }

  return -1;
}

async function addToSale1(item, price, currency) {
  const response = await addToSale(item, price, currency);
  if (response.success !== true) throw new Error('failed to put up for sale');
  return response.item_id;
}

async function updatePrice(item, minPrice, maxPrice, itemId) {
  try {
    const status = await getItemStatus(itemId);

    let response = await getNewPrice(item, minPrice);
    if (newPrice > maxPrice) newPrice = maxPrice;

    console.log(item.market_hash_name, newPrice);

    await setPrice(itemId, newPrice, 'RUB');

    return status;
  } catch (error) {
    console.log('error');
  }
}

const myInventory = await getInventory();
const itemForSale = getItemId(myInventory);

console.log(itemForSale);

const minPrice = +readline.question('Min price in cents . . . ');
const maxPrice = +readline.question('Max price in cents (Infinity) . . . ') || Infinity;

if (maxPrice < minPrice) throw new Error(`maxPrice can't be less than minPrice`);

const firstPrice = await getNewPrice(itemForSale, minPrice);
const itemId = await addToSale1(itemForSale.id, firstPrice, 'RUB');

while (true) {
  await updatePrice(itemForSale, minPrice, maxPrice, itemId);
  await sleep(5000);
}
