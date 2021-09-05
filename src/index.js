import mongoose from 'mongoose';
import express from 'express';
import fs from 'fs';
import { ping } from './api.js';
import { Item } from './models.js';
import { getItemNameid } from './lib.js';

const app = express();
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.listen(process.env.PORT || 3000);
mongoose.connect('mongodb+srv://admin:admin@cluster0.voepl.mongodb.net/items');

// const resp = await getItemsBitskins('123456');
// const prices = resp.data.prices;
// const names = prices.map(({ market_hash_name }) => market_hash_name);
const names = JSON.parse(fs.readFileSync('names.json').toString());

setInterval(ping, +process.env.PING_TIMEOUT || 60000);

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
    await item.save();
  } else if (saved[0].item_nameid === '') {
    const id = await getItemNameid(name);
    console.log(name, id);
    await Item.findOneAndUpdate(
      { market_hash_name: saved[0].market_hash_name },
      { item_nameid: id }
    );
  }
}
