import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  market_hash_name: String,
  item_nameid: String,
});

const priceSchema = new mongoose.Schema({
  name: String,
  steamPrice: Number,
  cstmAvgPrice: Number,
  rate: Number,
  popularity: Number,
  class_instance: String,
});

export const Item = mongoose.model('item', itemSchema);
export const Price = mongoose.model('price', priceSchema);
