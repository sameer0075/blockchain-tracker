import Moralis from 'moralis';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// Initialize Moralis with API key
const apiKey = process.env.MORALIS_API_KEY;
Moralis.start({
  apiKey: apiKey,
});

async function getTokenPrice(
  chain: string,
  include: string,
  address: string,
): Promise<any> {
  const options: any = {
    chain,
    include,
    address,
  };

  try {
    // const priceResponse = await Moralis.EvmApi.token.getTokenPrice(options);
    // return priceResponse;
    const response = await Moralis.EvmApi.token.getTokenPrice(options);
    return response;
  } catch (error) {
    console.error('Error fetching token price:', error);
    throw error;
  }
}

const getHistoricalBlock = async (chain: string, address: string) => {
  try {
    // Get timestamp for one hour ago
    const oneHourAgo = Math.floor((Date.now() - 60 * 60 * 1000) / 1000);
    // const oneDayAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
    const blockResponse = await Moralis.EvmApi.block.getDateToBlock({
      chain, // 'eth' for Ethereum, 'polygon' for Polygon
      date: new Date(oneHourAgo * 1000).toISOString(),
    });

    const blockNumber = blockResponse.result.block;

    // Now, fetch the token price at that block
    const options: any = {
      chain,
      address,
      toBlock: blockNumber, // Use the block number from one hour ago
    };

    const response = await Moralis.EvmApi.token.getTokenPrice(options);
    return response;
  } catch (error) {
    console.error('Error fetching historical token price:', error);
    throw error;
  }
};

const getHistoricalPrice = async (
  chain: string,
  address: string,
  block: number,
) => {
  const options: any = {
    chain,
    address,
    toBlock: block, // Block number from the response (e.g., 20942039)
  };

  try {
    const response = await Moralis.EvmApi.token.getTokenPrice(options);
    return response;
  } catch (error) {
    console.error('Error fetching token price at specific block:', error);
    throw error;
  }
};

const getBtcPriceInUsd = async () => {
  const response = await axios.get(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
  );
  return response.data?.bitcoin.usd;
};

export {
  getTokenPrice,
  getHistoricalPrice,
  getHistoricalBlock,
  getBtcPriceInUsd,
};
