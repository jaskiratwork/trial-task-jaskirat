import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useState, useEffect } from "react";
import { AiOutlineSwap } from "react-icons/ai";
import { useAccount } from "wagmi";
import SwapSession from "./Tranfer";
import { getSecondAccountToken } from "../utils/InteractERC721"
import { Alchemy, Network } from "alchemy-sdk";
import NFTDisplayBox from "./ShowERC721";
import { useRouter } from 'next/router';
import { ethers } from "ethers";

const config = {
  apiKey: "Jyuuy4MI_u6RLY8TlkGasdskg1CJeIhE",
  network: Network.MATIC_MUMBAI,
};
const alchemy = new Alchemy(config);

const TranferInfoPage = () => {
  const [NFTFreeze, NFTFreezeClicked] = useState(false); // Track Freeze button click
  const { address, isConnected } = useAccount();
  const [erc721Set, setErc721Set] = useState([]);
  const [currnetNFT, setCurrnetNFT] = useState(null);
  const [visableNFTButton, setVisableNFTButton] = useState(false);
  const [exchangeStore, setExchangeStore] = useState("");
  const router = useRouter();
  const { session_id, userAddress, title } = router.query;
  console.log("sessionId", session_id)
  console.log("userAddress", userAddress)
  console.log("title", title)
  const fetchNFTs = async (walletAddress) => {
    console.log("Fetching NFTs for address-------->", walletAddress);
    try {
      const fetchedNFTs = await alchemy.nft.getNftsForOwner(walletAddress);

      const fetchedNfts = fetchedNFTs.ownedNfts.map((nft) => {
        const title =
          nft.name || `NFT ${nft.tokenId} from ${nft.contract.name}`;

        const image = nft.image?.gateway || "default_image_url_here";

        return {
          address: nft.contract.address,
          tokenId: nft.tokenId,
          title: title,
          image: image,
        };
      });

      console.log("Fetched NFTs-------->", fetchedNfts);
      setErc721Set(fetchedNfts);
    } catch (error) {
      console.error("Error fetching NFTs-------->", error);
    }
  };

  useEffect(() => {
    const completeURL = window.location.href;
    // This will give you the full URL
    setExchangeStore(completeURL);

    console.log("Full URL-------->", completeURL);
  }, [exchangeStore]);


  const ethersStart = async () => {
    try {
      const worker = new ethers.providers.Web3Provider(window.ethereum);

      const [account] = await worker.listAccounts();
      console.log("Connected account------>", account);

      const balance = await worker.getBalance(account);
      console.log("Balance-------->", ethers.utils.formatEther(balance));
      return worker;
    } catch (error) {
      console.error("Error initializing ethers----->", error.message);
    }
  };
  useEffect(() => {
    const getEthers = async () => {
      const worker = await ethersStart();
      console.log(worker);
    };
    getEthers();
  }, []);

  const handleNftSelect = (nft) => {
    console.log("Selected NFT-------->", nft);
    setCurrnetNFT(nft);
    setVisableNFTButton(false);
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchNFTs(address);
    }
  }, [address, isConnected]);

  const handleFreezeClick = async () => {
    NFTFreezeClicked(true);
    const worker = await ethersStart();
    console.log("session URL in the handle freeze function", exchangeStore)
    console.log(currnetNFT);
    getSecondAccountToken(
      worker,
      exchangeStore,
      currnetNFT.address,
      currnetNFT.tokenId

    )
  };

  return (
    <>

      <div className="flex flex-col h-screen bg-gradient-to-r from-yellow-500 to-orange-500 text-white items-center justify-center">
        <div className="flex flex-row items-center justify-center p-6 gap-4">
          <div className="flex flex-col">
            <small className="font-semibold">Wallet Address</small>
            <ConnectButton accountStatus="address" chainStatus="icon" />
          </div>
          {currnetNFT &&
            <div>
              <small className="font-semibold">Selected NFT</small>
              {currnetNFT && (
                <div className="bg-white p-2 rounded-xl text-black">
                  {currnetNFT.title} - ID: {currnetNFT.tokenId}
                </div>
              )}
            </div>
          }
        </div>
        <div className="flex gap-4">
          {isConnected ? (
            <button
              onClick={() => setVisableNFTButton(!NFTFreeze && true)} // Enable button if Freeze not clicked
              className={`${NFTFreeze
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-600"
                } text-white px-4 py-2 mt-2 rounded transition-all duration-300`}
              disabled={NFTFreeze}
            >
              Select NFT
            </button>
          ) : (
            <p>Please connect your wallet</p>
          )}
          <button
            onClick={handleFreezeClick}
            className={`${
              NFTFreeze
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-400"
            } text-white px-4 py-2 mt-2 rounded transition-all duration-300`}
            disabled={NFTFreeze}
          >
            Freeze
          </button>
        </div>
        {visableNFTButton && (
          <div className="absolute w-72 max-h-96 overflow-y-auto bg-white border border-gray-300 p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-2 text-black">Select an NFT for swap</h2>
            {erc721Set.map((nft) => (
              <div
                key={`${nft.address}-${nft.tokenId}`}
                onClick={() => handleNftSelect(nft)}
                className="p-2 border-b border-gray-300 cursor-pointer hover:bg-gray-100 text-black flex items-center"
              >
                <img src={nft.image} alt={nft.title} className="w-10 h-10 mr-2" />
                {nft.title}
              </div>
            ))}
          </div>
        )}


        {/* Center */}
        {/* <div className="w-12 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-2 rounded-full">
          <AiOutlineSwap size={30} color="#4A5568" />
        </div>

        <div className="flex flex-col space-y-4 mt-6">
        <button
            onClick={handleFreezeClick}
            className={`${
              NFTFreeze
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-400"
            } text-white py-2 px-4 rounded transition-all duration-300`}
            disabled={NFTFreeze}
          >
            Freeze
          </button>


        </div>
      </div> */}
      </div>

      {/* Right Side */}
      <div className="absolute w-72 h-screen overflow-y-auto overflow-x-hidden bg-white border border-gray-300 p-4 shadow-lg ml-auto top-0 right-0">
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-2xl font-semibold mb-4 text-stale-950">You will receive</h2>
          <NFTDisplayBox session_id={session_id} userAddress={userAddress} title={title} />

        </div>
      </div>
    </>
  );
};

export default TranferInfoPage;
