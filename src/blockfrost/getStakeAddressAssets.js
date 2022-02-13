const getStakeAddressAssets = async ({
  blockfrost,
  stakeAddress,
}) => {
  if (!blockfrost) {
    throw new Error('blockfrost is a required property of getStakeAddressAssets');
  }

  if (!stakeAddress) {
    throw new Error('stakeAddress is a required property of getStakeAddressAssets');
  }

  const { body, statusCode, statusMessage } = 
    await blockfrost.get(`accounts/${stakeAddress}/addresses/assets`);
  if (statusCode !== 200) {
    console.log('Error', { body, statusCode, statusMessage });
    throw new Error('Error fetching stake address assets');
  }

  return body;
};

module.exports = getStakeAddressAssets;

