import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const getEthereumContract = async () => {

  if(!window.ethereum) {
   
      return alert("Please install MetaMask.");
    
  }


  const provider = new ethers.providers.Web3Provider(window.ethereum);

  console.log("provider" , provider); 
  const signer = await provider.getSigner();
  const transactions = new ethers.Contract(contractAddress, contractABI, signer);
  console.log(transactions); 
  return transactions;
};

export const TransactionsProvider = ({ children }) => {
  const [formData, setformData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
  const [transactions, setTransactions] = useState([]);

  const handleChange = (e, name) => {
    setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (!window.ethereum) return alert("please install metamask");
      const  transactions = await getEthereumContract();
        const availableTransactions = await transactions.getAllTransactions();

         const structuredTransactions = availableTransactions.map((transaction) => ({
           addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
           message: transaction.message,
          keyword: transaction.keyword,
           amount: parseInt(transaction.amount._hex) / (10 ** 18)
         }));
        // console.log(structuredTransactions);
         setTransactions(structuredTransactions);
      // } else {
        // console.log("Ethereum is not present");
      // }
      
    } catch (error) {
      console.log("Error fetching transactions:", error);
    }
  };

  const checkIfWalletIsConnect = async () => {
    try {
     // const { ethereum } = window;
      if (!window.ethereum) {
        return alert("Please install MetaMask.");
      }
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length>0) {
        setCurrentAccount(accounts[0]);
        getAllTransactions();
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log("Error checking wallet connection:", error);
    }
  };

  const checkIfTransactionsExists = async () => {
    try {
      //const { ethereum } = window;
      if (window.ethereum) {
        const transactions = await getEthereumContract();
        console.log(transactions); 
        const TransactionCount = await transactions.getTransactionCount();
        window.localStorage.setItem("transactionCount", TransactionCount);
      }
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };

  const connectWallet = async () => {
    try {
     // const { ethereum } = window;
      if (!window.ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      window.location.reload();
    } catch (error) {
      console.log("Error connecting wallet:", error);
      throw new Error("No ethereum object");
    }
  };

  const sendTransaction = async () => {
    try {
      //const { ethereum } = window;
      if (window.ethereum) {
        const { addressTo, amount, keyword, message } = formData;
        const transactions =  await getEthereumContract();
        const parsedAmount = ethers.utils.parseEther(amount);
        console.log("sending...");
        await ethereum.request({
          method: "eth_sendTransaction",
          params: [{
            from: currentAccount,
            to: addressTo,
            gas: "0x5208", // 21000 GWEI
            value: parsedAmount._hex,
          }],
        });

        const transactionHash = await transactions.addToBlockchain(addressTo, parsedAmount, message, keyword);

        setIsLoading(true);
        console.log(`Loading - ${transactionHash.hash}`);
        await transactionHash.wait();
        console.log(`Success - ${transactionHash.hash}`);
        setIsLoading(false);

        const transactionsCount = await transactions.getTransactionCount();
        setTransactionCount(transactionsCount.toNumber());
        window.location.reload();
      } else {
        console.log("No ethereum object");
      }
    } catch (error) {
      console.log("Error sending transaction:", error);
      throw new Error("No ethereum object");
    }
  };

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      console.log("MetaMask detected");
    } else {
      console.log("MetaMask not detected");
    }

    checkIfWalletIsConnect();
    checkIfTransactionsExists();
  }, [transactionCount]);

  return (
    <TransactionContext.Provider
      value={{
        transactionCount,
        connectWallet,
        transactions,
        currentAccount,
        isLoading,
        sendTransaction,
        handleChange,
        formData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};