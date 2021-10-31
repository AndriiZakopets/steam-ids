import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  market_hash_name: String,
  item_nameid: String,
});

const priceSchema = new mongoose.Schema({
  name: String,
  steamPrice: Number,
  csgotmAveragePrice: Number,
  rate: Number,
  popularity: Number,
  classInstance: String,
  steamLink: String,
  csgotmLink: String,
});

export const Item = mongoose.model('item', itemSchema);
export const Price = mongoose.model('price', priceSchema);
