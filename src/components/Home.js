import { ConnectButton } from "@rainbow-me/rainbowkit";
import React, { useState, useEffect } from "react";
import { AiOutlineSwap } from "react-icons/ai";
import { useAccount } from "wagmi";
import SwapSession from "./Tranfer";
import { Alchemy, Network } from "alchemy-sdk";
import sha256 from "crypto-js/sha256";
import { ethers } from "ethers";
import { getFirstAccountToken, swapTokens } from "../utils/InteractERC721";
const config = {
  apiKey: "Jyuuy4MI_u6RLY8TlkGasdskg1CJeIhE",
  network: Network.MATIC_MUMBAI,
};
const alchemy = new Alchemy(config);

const Home = () => {
  const [NFTFreeze, NFTFreezeClicked] = useState(false); // Track Freeze button click
  const { address, isConnected } = useAccount();
  const [erc721Set, setErc721Set] = useState([]);
  const [currentNFT, setCurrentNFT] = useState(null);
  const [visableNFTButton, setVisableNFTButton] = useState(false);
  const [exchangeStore, setExchangeStore] = useState("");
  const baseURL = "https://atomic-swap-code.vercel.app/exchange";

  const fetchNFTs = async (walletAddress) => {
    console.log("Fetching NFTs for address-------->", walletAddress);
    try {
      const detailsERC721 = await alchemy.nft.getNftsForOwner(walletAddress);

      const gotERC721 = detailsERC721.ownedNfts.map((nft) => {
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

      console.log("Fetched NFTs---->", gotERC721);
      setErc721Set(gotERC721);
    } catch (error) {
      console.error("Error fetching NFTs-------->", error);
    }
  };
  const ethersSetup = async () => {
    try {
      // Connect to an Ethereum worker (e.g., MetaMask)
      const worker = new ethers.providers.Web3Provider(window.ethereum);

      // Access the user's account address
      const [account] = await worker.listAccounts();
      console.log("Connected account-------->", account);

      // Example: Retrieve the balance
      const balance = await worker.getBalance(account);
      console.log("Balance-------->", ethers.utils.formatEther(balance));
      return worker;
    } catch (error) {
      console.error("Error initializing ethers------->", error.message);
    }
  };
  useEffect(() => {
    const makeEthers = async () => {
      const worker = await ethersSetup();
      console.log(worker);
    };
    makeEthers();
  }, []);

  const manageERC721Selected = (nft) => {
    console.log("Selected NFT---->", nft);
    setCurrentNFT(nft);
    setVisableNFTButton(false);
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchNFTs(address);
    }
  }, [address, isConnected]);

  const generateSessionId = () => {
    if (!address || !currentNFT.address || !currentNFT.tokenId) {
      setError("Invalid token or user information----->");
      return;
    }

    // setIsLoading(true);
    console.log("Generating session ID---->");

    try {
      const ExchangeId = sha256(
        `${address}-${currentNFT.address}-${currentNFT.tokenId}-${Date.now()}`
      ).toString();
      // setSessionId(ExchangeId);
      console.log("Session ID set---->", ExchangeId);
      const exchangeStore = `${baseURL}?session_id=${ExchangeId}&userAddress=${encodeURIComponent(
        address
      )}&title=${encodeURIComponent(currentNFT.title)}`;
      setExchangeStore(exchangeStore);
      console.log(exchangeStore);
      return exchangeStore;
    } catch (e) {
      console.error("Error generating session ID:", e);
      // setError("Failed to generate session ID.");
    } finally {
      // setIsLoading(false);
    }
  };

  const freezedFunction = async () => {
    NFTFreezeClicked(true);
    const worker = await ethersSetup();
    console.log("this is the URL which we r sending from user1 for bytes 32 hash", exchangeStore);
    getFirstAccountToken(
      exchangeStore,
      worker,
      currentNFT.address,
      currentNFT.tokenId
    );
  };

  const signFunction = async () => {
    const worker = await ethersSetup();
    const bytes32SessionId = ethers.utils.solidityKeccak256(
      ["string"],
      [exchangeStore],
    );
    swapTokens(worker, bytes32SessionId);

  }

  return (
    <>

      <div className="flex flex-col h-screen bg-gradient-to-r from-yellow-500 to-orange-500 text-white items-center justify-center">
        {/* Left Side */}
        <div className="flex flex-row items-center justify-center p-6 gap-4">
          <div className="flex flex-col">
            <small className="font-semibold">Wallet Address</small>
            <ConnectButton className="" accountStatus="address" chainStatus="icon" />
          </div>

          {currentNFT && (
            <>
              <div className="flex flex-col">
                <small className="font-semibold">Selected NFT</small>
                {currentNFT && (
                  <div className="bg-white p-2 rounded-xl text-black">
                    {currentNFT.title} - ID: {currentNFT.tokenId}
                  </div>
                )}
              </div>

            </>
          )}
        </div>
        <div className="flex gap-4">
          {isConnected ?
            <button
              onClick={() => setVisableNFTButton(!NFTFreeze && true)} // Enable button if Freeze not clicked
              className={`${NFTFreeze
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-700 hover:bg-blue-600"
                } text-white px-6 py-2 mt-4 rounded transition-all duration-300`}
              disabled={NFTFreeze}
            >
              Select NFT
            </button>
            :
            <p className="mt-4">Please connect your wallet</p>
          }
          <button
            onClick={freezedFunction}
            className={`${
              NFTFreeze
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-400"
            } text-white px-6 py-2 mt-4 rounded transition-all duration-300`}
            disabled={NFTFreeze}
          >
            Freeze
          </button>

          <button
            onClick={signFunction}
            className={`${
              false
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-400"
            } text-white px-6 py-2 mt-4 rounded transition-all duration-300`}
          >
            Sign
          </button>
        </div>

        {visableNFTButton && (
          <div className="absolute w-72 max-h-96 overflow-y-auto bg-white border border-gray-300 p-4 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-2 text-black">
              Select an NFT for swap
            </h2>

            {erc721Set.map((nft) => (
              <div
                key={`${nft.address}-${nft.tokenId}`}
                onClick={() => manageERC721Selected(nft)}
                className="p-2 bg-transparent border-b border-gray-300 cursor-pointer hover:bg-gray-100 text-black flex items-center"
              >
                <img
                  src={nft.image}
                  alt={nft.title}
                  className="w-10 h-10 mr-2"
                />
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
          
        </div>
      </div> */}

      </div>
      {/* Right Side */}
      {currentNFT && (
      <div className="absolute w-72 h-screen overflow-y-auto overflow-x-hidden bg-white border border-gray-300 p-4 shadow-lg ml-auto top-0 right-0">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="flex flex-col items-center space-y-4">

              <SwapSession
                sessionID={exchangeStore}
                generateSessionId={generateSessionId}
                userAddress={address}
                tokenContractAddress={currentNFT.address}
                tokenId={currentNFT.tokenId}
                title={currentNFT.title}
              />

          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default Home;
