import { getMassInfo } from '../api.js';

export const extMassInfo = async (list, SELL, BUY, HISTORY, INFO) => {
  const splittedList = [];
  const subArrSize = 100;

  for (let i = 0; i < list.length / subArrSize; i++) {
    splittedList[i] = list.slice(i * subArrSize, (i + 1) * subArrSize);
  }
  let result = [];

  for (const subArr of splittedList) {
    const massInfo = await getMassInfo(subArr, SELL, BUY, HISTORY, INFO);
    result = result.concat(massInfo.results);
  }

  return result;
};
