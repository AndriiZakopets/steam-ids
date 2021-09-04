import mongoose from 'mongoose';
import { getItemsBitskins } from './api.js';
import { Item } from './models.js';
import { getItemNameid } from './lib.js';

mongoose.connect('mongodb+srv://admin:admin@cluster0.voepl.mongodb.net/items');

const resp = await getItemsBitskins('739152');
const prices = resp.data.prices;
const names = prices.map(({ market_hash_name }) => market_hash_name);

for (const name of names) {
    const saved = await Item.find({ market_hash_name: name });
    const isSaved = saved.length > 0;
    if (!isSaved) {
        const id = await getItemNameid(name);
        console.log(name, id);

        const item = new Item({
            market_hash_name: name,
            item_nameid: id,
        });
        item.save();
    }
}