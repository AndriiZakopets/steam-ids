import mongoose from 'mongoose';
import express from 'express';
import fs from 'fs';
import { getItemsBitskins } from './api.js';
import { Item } from './models.js';
import { getItemNameid } from './lib.js';

mongoose.connect('mongodb+srv://admin:admin@cluster0.voepl.mongodb.net/items');

const resp = await getItemsBitskins(process.argv[2]);
const prices = resp.data.prices;
const names = prices.map(({ market_hash_name }) => market_hash_name);

for (const name of names) {
  const saved = await Item.find({ market_hash_name: name });
  const isSaved = saved.length > 0;
  if (!isSaved) {
    await new Promise((res) => setTimeout(res, 2000));
    const id = await getItemNameid(name);
    console.log(name, id);
    const item = new Item({
      market_hash_name: name,
      item_nameid: id,
    });
    await item.save();
  } else if (saved[0].item_nameid === '') {
    await new Promise((res) => setTimeout(res, 2000));
    const id = await getItemNameid(name);
    console.log(name, id);
    await Item.findOneAndUpdate(
      { market_hash_name: saved[0].market_hash_name },
      { item_nameid: id }
    );
  }
}
