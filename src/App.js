import "./App.css";
import { useState, useEffect } from "react";
import Dropzone from "./components/Dropzone.js";
import Arweave from "arweave";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

function App() {
  const [state, setState] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [loadingState, setLoadingState] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  async function createTransaction() {
    if (!state) return;
    try {
      const formData = state;
      setState("");
      setLoadingState("sendingTransaction");
      let transaction = await arweave.createTransaction({ data: formData });
      await arweave.transactions.sign(transaction);
      let uploader = await arweave.transactions.getUploader(transaction);

      while (!uploader.isComplete) {
        await uploader.uploadChunk();
        console.log(
          `${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`
        );
      }
      setTransactionId(transaction.id);
      setLoadingState("transactionSent");
      console.log(transaction);
    } catch (err) {
      console.log("error: ", err);
    }
  }
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

  async function readFromArweave() {
    arweave.transactions
      .getData(transactionId, {
        decode: true,
        string: true,
      })
      .then((data) => {
        console.log("data: ", data);
      });
  }

  if (loadingState === "sendingTransaction")
    return (
      <div className="container">
        <p>Sending Transaction...</p>
      </div>
    );

  return (
    <div className="container">
      {walletConnected ? (
        <div>Connected to {walletAddress.substring(0, 6)}...</div>
      ) : (
        <button className="button" onClick={connect}>
          Use Arconnect Wallet
        </button>
      )}
      <Dropzone />

      <button className="button" onClick={createTransaction}>
        Create Transaction
      </button>

      {loadingState === "transactionSent" && (
        <button className="button" onClick={readFromArweave}>
          Log Transaction Data
        </button>
      )}

      <input
        className="input"
        onChange={(e) => {
          setState(e.target.value);
          setLoadingState("");
        }}
        placeholder="text"
        value={state}
      />
    </div>
  );
}

export default App;
