import { sleep } from '../utils.js';
import { buyWhileAvailable } from './buyWhileAvailable.js';
import { extMassInfo } from './extMassInfo.js';
import { getList } from './getList.js';

const AUTOBUY_LIST_LENGTH = 500;
const AUTOBUY_MAX_PRICE = 200000;
const RATE = process.argv[2] ? parseFloat(process.argv[2]) : 1.8;

const list = await getList(AUTOBUY_LIST_LENGTH, AUTOBUY_MAX_PRICE);

while (true) {
  try {
    console.log('start iteration.');

    const promiseArr = [];
    const buyOffers = await extMassInfo(list, 1, 0, 0, 1);

    for (let i = 0; i < AUTOBUY_LIST_LENGTH; i++) {
      promiseArr.push(buyWhileAvailable(buyOffers[i], RATE, AUTOBUY_MAX_PRICE));
    }
    await Promise.all(promiseArr);
    await sleep(500);
  } catch (e) {
    console.log('error iteration.')
    console.log(e)
    await sleep(5000);
  }
}
