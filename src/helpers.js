export const sleep = async (ms = 1000) => {
  return await new Promise((res) => setTimeout(res, ms));
};
