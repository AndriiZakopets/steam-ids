import mongoose from 'mongoose';
import express from 'express';
import axios from 'axios'
import fs from 'fs';
// import { getItemsBitskins } from './api.js';
import { Item } from './models.js';
import { getItemNameid } from './lib.js';

const app = express();
app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.listen(process.env.PORT || 3000);
mongoose.connect('mongodb+srv://admin:admin@cluster0.voepl.mongodb.net/items');

// const resp = await getItemsBitskins('123456');
// const prices = resp.data.prices;
// const names = prices.map(({ market_hash_name }) => market_hash_name);
const names = JSON.parse(fs.readFileSync('names.json').toString());

for (const name of names) {
  const saved = await Item.find({ market_hash_name: name });
  const isSaved = saved.length > 0;
  if (!isSaved) {
    const id = await getItemNameid(name);
    console.log(name, id);
    axios.get(`http://localhost:${process.env.PORT}`);

    const item = new Item({
      market_hash_name: name,
      item_nameid: id,
    });
    item.save();
  }
}
