import "./App.css";
import { useState, useEffect } from "react";
import Dropzone from "./components/Dropzone.js";
import Gallery from "./components/Gallery";

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  const permissions = [
    "ACCESS_ADDRESS",
    "SIGN_TRANSACTION",
    "SIGNATURE",
    "ACCESS_PUBLIC_KEY",
    "ACCESS_ALL_ADDRESSES",
  ];

  async function connect() {
    setWalletConnected(true);
    return await window.arweaveWallet.connect(permissions);
  }

  async function getWalletAddress() {
    return await window.arweaveWallet.getActiveAddress();
  }

  useEffect(() => {
    if (walletConnected) {
      getWalletAddress().then((address) => {
        setWalletAddress(address);
      });
    }
  }, [walletConnected]);

  return (
    <div className="container">
      {walletConnected ? (
        <div className="connectedButton">
          Connected to {walletAddress.substring(0, 6)}...
        </div>
      ) : (
        <button className="button" onClick={connect}>
          Use Arconnect Wallet
        </button>
      )}
      <Dropzone />
      <Gallery walletAddress={walletAddress} />
    </div>
  );
}

export default App;
