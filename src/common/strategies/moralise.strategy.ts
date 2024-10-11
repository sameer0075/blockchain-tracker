import Moralis from 'moralis';

// Initialize Moralis with API key
const apiKey = process.env.MORALIS_API_KEY;
Moralis.start({
  apiKey: apiKey,
});

// Function to get NFT price data
async function getNFTPrice(chain, tokenAddress, tokenId) {
  try {
    const response = await Moralis.EvmApi.nft.getNFTMetadata({
      chain: chain, // 'eth' for Ethereum, 'polygon' for Polygon
      address: tokenAddress, // Contract address of the NFT
      tokenId: tokenId, // Specific token ID of the NFT
    });

    const metadata = response.raw;

    console.log(`NFT Data: ${JSON.stringify(metadata)}`);

    // Get price data (if available)
    const price = metadata.price || 'Price not available';
    console.log(`Price: ${price}`);
  } catch (error) {
    console.error(error);
  }
}
