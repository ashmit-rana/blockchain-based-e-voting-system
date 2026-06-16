import React, { createContext, useContext, useState } from "react";
import { ethers } from "ethers";

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not found. Please install MetaMask.");
      return;
    }
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      await web3Provider.send("eth_requestAccounts", []);
      const web3Signer = await web3Provider.getSigner();
      const address = await web3Signer.getAddress();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setWalletAddress(address);
      setIsConnected(true);

      return address;
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setWalletAddress(null);
    setIsConnected(false);
  };

  return (
    <Web3Context.Provider
      value={{
        provider, signer, walletAddress,
        isConnected, connectWallet, disconnectWallet
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);