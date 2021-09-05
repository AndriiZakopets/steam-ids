import mongoose from 'mongoose';
import fs from 'fs';
import { getPrices } from './api.js';
import { Item } from './models.js';
import { getItemNameid } from './lib.js';

mongoose.connect('mongodb+srv://admin:admin@cluster0.voepl.mongodb.net/items');


// const items = (await Item.find({})).filter(({ item_nameid }) => item_nameid !== '');
// items.forEach(async ({ market_hash_name, item_nameid }, i) => {
//   const resp = await getPrices(item_nameid);
//   const prices = resp.data;
//   console.log(`${i}. ${market_hash_name} - ${prices.buy_order_price}`);
// });

const name = 'AUG | Flame Jörmungandr (Battle-Scarred)';
const id = await getItemNameid(name);
console.log(id);
