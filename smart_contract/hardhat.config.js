require("@nomicfoundation/hardhat-toolbox");

const endpointUrl = "https://eth-sepolia.g.alchemy.com/v2/tS9qye1O_k4nIa0VSbkwpTeWp8AFRxbB";
const privateKey = "931d38d69a12971835247e39df8ef75c3cc5f3d543bf5a666b90d9db03e2351c";


module.exports = {
  solidity: '0.8.0',
  networks: {
    sepolia: {
     url: endpointUrl,
     accounts: [privateKey],
    },
  },
};