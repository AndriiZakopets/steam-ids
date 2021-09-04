import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  market_hash_name: String,
  item_nameid: String,
});

export const Item = mongoose.model('item', itemSchema);
