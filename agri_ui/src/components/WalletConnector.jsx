import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const WalletConnector = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState("");

  const shortenAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const connectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed. Install it from https://metamask.io/");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];
      setAccount(account);
      setError("");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const bal = await provider.getBalance(account);
      setBalance(ethers.formatEther(bal));
    } catch (err) {
      setError("User rejected the request.");
      console.error(err);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
          setBalance(null);
        }
      };

      const handleChainChanged = () => window.location.reload();

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  return (
    <div>
      {account ? (
        <div>
          <span>{shortenAddress(account)}</span>
          <span> | {balance ? parseFloat(balance).toFixed(4) + " ETH" : "Loading..."}</span>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
      {error && (
        <div style={{ color: "red", fontSize: "0.8rem" }}>
          {error} <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">Install MetaMask</a>
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
