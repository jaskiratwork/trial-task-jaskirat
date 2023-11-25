import { ethers } from "ethers";
import { ContractDeployedAt, ApplicationBinaryInterface } from "../contract/MyContract";

const nftApprover = async (nftProvider, address, nftTokenId, nftContractAddress) => {
  const valueSigner = nftProvider.getSigner();
  const mainapproveABI = [
    {
      "constant": false,
      "inputs": [
        {
          "name": "to",
          "type": "address"
        },
        {
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  const contractNft = new ethers.Contract(address, mainapproveABI, valueSigner);
  console.log("created contract Instance ---->")
  await contractNft.approve(nftContractAddress, nftTokenId);
  console.log("ContractDeployedAt is Approved ---->")
};

const getSecondAccountToken = async (nftProvider, currentSessionURL, address, nftTokenId) => {

  console.log("Deposit2 function sessionId --->", currentSessionURL);
  // First approve the contract to transfer NFT
  await nftApprover(nftProvider, address, nftTokenId, ContractDeployedAt);
  console.log("currentSessionURL -------->", currentSessionURL);
  const valueSigner = nftProvider.getSigner();
  const nftBytes32SessionId = ethers.utils.solidityKeccak256(["string"], [currentSessionURL]);
  console.log("Bytes32 SessionId --->", nftBytes32SessionId);
  console.log("nftBytes32SessionId -------->", nftBytes32SessionId);
  const nftContract = new ethers.Contract(ContractDeployedAt, ApplicationBinaryInterface, valueSigner);

  const nftTransaction = await nftContract.depositUser2NFT(nftBytes32SessionId, address, nftTokenId, { gasLimit: 200000 });
  await nftTransaction.wait();
  console.log("User 2 deposited NFT");
  alert("User 2 deposited NFT")
};

const getFirstAccountToken = async (nftSessionId, nftProvider, address, nftTokenId) => {
  try {
    console.log("deposit 1 nftSessionId", nftSessionId);
    // Priorly accept the contract to sent NFT
    await nftApprover(nftProvider, address, nftTokenId, ContractDeployedAt);

    const valueSigner = nftProvider.getSigner();
    const nftBytes32SessionId = ethers.utils.solidityKeccak256(["string"], [nftSessionId]);
    console.log("deposit 1 Bytes32 SessionId --------->", nftBytes32SessionId);
    const nftcontract = new ethers.Contract(ContractDeployedAt, ApplicationBinaryInterface, valueSigner);

    const nftTransaction = await nftcontract.depositUser1NFT(nftBytes32SessionId, address, nftTokenId, { gasLimit: 200000 });
    await nftTransaction.wait();
    console.log("User first deposited NFT --------->");
    alert("User 2 deposited NFT")
  } catch (error) {
    console.error("Error depositing NFT:", error.message);
  }
};

const swapTokens = async (nftProvider, sessionURL) => {

  const valueSigner = nftProvider.getSigner();
  const nftcontract = new ethers.Contract(ContractDeployedAt, ApplicationBinaryInterface, valueSigner);

  const nftTransaction = await nftcontract.completeSwap(sessionURL);

  alert("NFT Swapped successfully 🙌");

};

module.exports = {
  getFirstAccountToken,
  getSecondAccountToken,
  swapTokens,
};