import beeper from 'beeper';
import readline from 'readline-sync';
import { getItems } from './api.js';
import { sleep } from './helpers.js';

async function getIsAnyItemSold(notificationType) {
  const items = (await getItems()).items;
  if (!items) return false;

  const sell = notificationType === 1;
  const buy = notificationType === 2;
  let sold = false;
  let bought = false;

  for (const item of items) {
    if (+item.status === 2) sold = true;
    if (+item.status === 4) bought = true;
  }

  return (sold || bought) && ((sold && sell) || (bought && buy) || (!sell && !buy));
}

const notificationType = +readline.question(
  'Notification type (1 - sell; 2 - buy; 3 - both) . . . '
);

if (![1, 2, 3].includes(notificationType)) {
  console.error('Notification type must be 1, 2 or 3');
} else {
  while (true) {
    try {
      const isAnyItemSold = await getIsAnyItemSold(notificationType);
      if (isAnyItemSold) {
        beeper();
        console.log('sold');
      } else console.log('clear');
    } catch (error) {
      console.log('error');
    }

    await sleep(10000);
  }
}
