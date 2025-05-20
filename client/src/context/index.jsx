import React, { useContext, createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import CrowdFunding from "../contracts/CrowdFunding.json";

const StateContext = createContext();

// Get contract address from environment variable or use default
const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0xe9f706a11d95B891e4Be94Da84749edCF35161Be";

export const StateContextProvider = ({ children }) => {
  const [address, setAddress] = useState("");
  const [contract, setContract] = useState(null);

  const contractAddress = CONTRACT_ADDRESS;

  const connect = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        setAddress(account);

        // Initialize contract connection
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          CrowdFunding.abi,
          signer
        );
        setContract(contract);
      } else {
        console.log("Ethereum wallet is not available");
      }
    } catch (error) {
      console.log("Error connecting to wallet:", error);
    }
  };

  const disconnect = async () => {
    try {
      // Clear the address and contract from state
      setAddress("");
      setContract(null);

      // Some wallets support disconnecting
      if (window.ethereum && window.ethereum.removeAllListeners) {
        window.ethereum.removeAllListeners();
      }

      return true;
    } catch (error) {
      console.log("Error disconnecting from wallet:", error);
      return false;
    }
  };

  const createCampaign = async (form) => {
    try {
      if (!contract) await connect();

      const data = await contract.createCampaign(
        address, // owner
        form.title,
        form.description,
        form.target,
        Math.floor(new Date(form.deadline).getTime() / 1000), // Fixed: convert ms to seconds
        form.image
      );

      console.log("Contract call success", data);
      return data;
    } catch (error) {
      console.log("Contract call failure", error);
    }
  };

  const getCampaigns = async () => {
    try {
      if (!contract) {
        await connect();
        if (!contract) {
          return [];
        }
      }

      // The contract now returns 8 arrays
      const [
        ids,
        owners,
        titles,
        descriptions,
        targets,
        amountcollecteds,
        deadlines,
        images,
      ] = await contract.getCampaigns();

      // Reconstruct campaign objects
      const parsedCampaigns = ids.map((id, i) => ({
        id: Number(id),
        owner: owners[i],
        title: titles[i],
        description: descriptions[i],
        target: ethers.formatEther(targets[i].toString()),
        amountCollected: ethers.formatEther(amountcollecteds[i].toString()),
        deadline: Number(deadlines[i]),
        image: images[i],
        pId: i,
      }));

      return parsedCampaigns;
    } catch (error) {
      console.log("Error fetching campaigns", error);
      // Check if MetaMask is on the right network
      if (window.ethereum) {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        console.log("Connected to chain ID:", parseInt(chainId, 16));
      }
      return [];
    }
  };

  const getUserCampaigns = async () => {
    try {
      if (!contract) await connect();

      const allCampaigns = await getCampaigns();
      const filteredCampaigns = allCampaigns.filter(
        (campaign) => campaign.owner.toLowerCase() === address.toLowerCase()
      );

      return filteredCampaigns;
    } catch (error) {
      console.log("Error fetching user campaigns", error);
      return [];
    }
  };

  const donate = async (pId, amount) => {
    try {
      if (!contract) await connect();

      // Change this line:
      const data = await contract.donateToCampaign(pId, {
        value: ethers.parseEther(amount), // Changed from ethers.utils.parseEther
      });

      return data;
    } catch (error) {
      console.log("Error donating to campaign", error);
    }
  };

  const getDonations = async (pId) => {
    try {
      if (!contract) await connect();

      const donations = await contract.getDonators(pId);
      const numberOfDonations = donations[0].length;

      const parsedDonations = [];

      for (let i = 0; i < numberOfDonations; i++) {
        parsedDonations.push({
          donator: donations[0][i],
          donation: ethers.formatEther(donations[1][i].toString()), // Changed from ethers.utils.formatEther
        });
      }

      return parsedDonations;
    } catch (error) {
      console.log("Error fetching donations", error);
      return [];
    }
  };

  const checkNetwork = async () => {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain ID:", parseInt(chainId, 16));
  };
  checkNetwork();

  useEffect(() => {
    // Check if wallet is already connected
    const checkIfWalletIsConnected = async () => {
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });

          if (accounts.length) {
            setAddress(accounts[0]);

            // Initialize contract connection - fix this to use v6 API
            const provider = new ethers.BrowserProvider(window.ethereum); // Changed from ethers.providers.Web3Provider
            const signer = await provider.getSigner(); // Note the async/await here
            const contract = new ethers.Contract(
              contractAddress,
              CrowdFunding.abi,
              signer
            );
            setContract(contract);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    checkIfWalletIsConnected();
  }, [contractAddress]);

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connect,
        disconnect,
        createCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
