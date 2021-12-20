import { getPage } from './api.js';
import { Item } from './models.js';

export async function getItemNameid(marketHashName) {
  try {
    const page = await getPage(marketHashName);
    const re = /Market_LoadOrderSpread\(\s*(\d+)\s*\)/;
    const id = page.match(re)[0].match(/\d+/)[0];
    return id;
  } catch (e) {
    return '';
  }
}

export function createItemModel(item) {
  const { asset_description } = item;

  const itemModel = new Item({
    name: item.name,
    hash_name: item.hash_name,
    appid: asset_description.appid,
    classid: asset_description.classid,
    instanceid: asset_description.instanceid,
    type: asset_description.type,
    commodity: asset_description.commodity,
  });

  return itemModel;
}
