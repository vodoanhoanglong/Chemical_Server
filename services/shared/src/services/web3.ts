import Web3 from "web3";

const defaultUrl = "http://localhost:8545";

export const web3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_URL || defaultUrl));
