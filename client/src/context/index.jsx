import React, {
  useContext,
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ethers } from "ethers";
import CrowdFunding from "../contracts/CrowdFunding.json";

const StateContext = createContext();

// Get contract address from environment variable or use default
const CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0xEF6a1c1F8C4F760856ec5c2B6951dA5a506c3A27";

export const StateContextProvider = ({ children }) => {
  const [address, setAddress] = useState("");
  const [contract, setContract] = useState(null);

  const contractAddress = CONTRACT_ADDRESS;

  // Add a debug log in your connect function
  const connect = async () => {
    try {
      if (!window.ethereum) {
        console.error("MetaMask not installed or not accessible");
        return false;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length) {
        setAddress(accounts[0]);
        console.log("Connected to account:", accounts[0]);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        // Log contract address being used
        console.log("Using contract address:", contractAddress);

        // Create contract instance
        const contract = new ethers.Contract(
          contractAddress,
          CrowdFunding.abi,
          signer
        );

        // Verify contract connection
        console.log("Contract connection established:", !!contract);
        console.log("Contract address:", contract.address);

        setContract(contract);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Connection error:", error);
      return false;
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

      // Ensure pId is treated as a number
      const campaignId = parseInt(pId);
      console.log(`Donating ${amount} ETH to campaign ${campaignId}`);

      // Convert amount to wei
      const parsedAmount = ethers.parseEther(amount);
      console.log("Parsed amount in wei:", parsedAmount.toString());

      // Send the transaction with the correct value
      const transaction = await contract.donateToCampaign(campaignId, {
        value: parsedAmount,
      });

      console.log("Donation transaction sent:", transaction);
      return transaction;
    } catch (error) {
      console.error("Error in donate function:", error);
      console.error("Error details:", error.message);
      throw error; // Re-throw to handle in the component
    }
  };

  // Update the getDonations function with proper error handling

  const getDonations = async (pId) => {
    try {
      if (!contract) {
        console.log("Contract not connected yet");
        return [];
      }

      // Log the campaign ID being used
      console.log("Getting donations for campaign ID:", pId);

      try {
        // Call the contract's getDonators function
        const result = await contract.getDonators(pId);
        console.log("Raw result from getDonators:", result);

        // Extract addresses and donations from the result
        // Result is an array with [addresses[], donations[]]
        if (!result || !Array.isArray(result) || result.length < 2) {
          console.log("Invalid response format from contract");
          return [];
        }

        const [addresses, amounts] = result;

        if (!addresses || !amounts || addresses.length === 0) {
          console.log("No donators found for this campaign");
          return [];
        }

        // Map the results to the expected format
        const formattedDonations = [];

        for (let i = 0; i < addresses.length; i++) {
          // Convert BigNumber to string and format as ETH
          // This works with both ethers v5 and v6
          let formattedAmount;
          try {
            // Try ethers v6 approach
            formattedAmount = ethers.formatUnits(amounts[i], 18);
          } catch (e) {
            try {
              // Fallback to ethers v5 approach
              formattedAmount = ethers.utils.formatEther(amounts[i]);
            } catch (e2) {
              // Last resort: manual conversion
              formattedAmount = (
                parseFloat(amounts[i].toString()) / 1e18
              ).toFixed(18);
            }
          }

          formattedDonations.push({
            donator: addresses[i],
            donation: formattedAmount,
          });
        }

        console.log("Formatted donations:", formattedDonations);
        return formattedDonations;
      } catch (error) {
        console.error("Error calling contract:", error);

        // Additional debug information
        console.log("Campaign ID type:", typeof pId);
        console.log(
          "Contract methods:",
          Object.keys(contract.functions || {}).join(", ")
        );

        return [];
      }
    } catch (error) {
      console.error("Error in getDonations:", error);
      return [];
    }
  };

  // Add this new function

  const getDonatorCount = async (pId) => {
    try {
      if (!contract) return 0;

      console.log("Getting donator count for campaign ID:", pId);

      // Call the smart contract's dedicated count function
      const count = await contract.getDonatorCount(pId);
      console.log("Donator count from contract:", count.toString());

      // Convert BigNumber to number
      return parseInt(count.toString());
    } catch (error) {
      console.error("Error getting donator count:", error);
      return 0;
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

  // Make sure your connect function is called on component mount
  useEffect(() => {
    const initConnection = async () => {
      if (window.ethereum) {
        await connect();
      }
    };

    initConnection();
  }, [connect]); // Add connect to the dependency array

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
        getDonatorCount,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
