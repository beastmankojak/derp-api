const getAsset = require('./getAsset');
const getStakeAddressAssets = require('./getStakeAddressAssets');

const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const state = {
  lastUpdate: new Date('1/1/1970'),
  result: [],
};

const getSwag = async ({ blockfrost, stakeAddress, assets }) => {
  const now = new Date();
  if (now - state.lastUpdate > CACHE_TIMEOUT) {
    // console.log('Cache miss');
    const remaining = (await getStakeAddressAssets({ blockfrost, stakeAddress }))
      .reduce((acc, { unit, quantity }) => {
        acc[unit] = quantity;
        return acc;
      }, {});

    const result = [];
    for (const assetId of assets) {
      const { asset, quantity: total, onchain_metadata } = await getAsset({ blockfrost, assetId });
      result.push({ 
        asset,
        total, 
        remaining: remaining[asset] || 0,
        ...onchain_metadata
      });

      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    state.lastUpdate = now;
    state.result = result;
  } else {
    // console.log('cache hit');
  }

  return state;
};

module.exports = getSwag;