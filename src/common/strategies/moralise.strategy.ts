import Moralis from 'moralis';
import * as dotenv from 'dotenv'

dotenv.config()

// Initialize Moralis with API key
const apiKey = process.env.MORALIS_API_KEY;
Moralis.start({
  apiKey: apiKey,
});

async function getTokenPrice(chain: string,include: string, address: string): Promise<any> {
  const options: any = {
    chain,
    include,
    address
  };

  try {
    // const priceResponse = await Moralis.EvmApi.token.getTokenPrice(options);
    // return priceResponse;
    const response = await Moralis.EvmApi.token.getTokenPrice(options);
    return response
  } catch (error) {
    console.error('Error fetching token price:', error);
    throw error;
  }
}

export { getTokenPrice }