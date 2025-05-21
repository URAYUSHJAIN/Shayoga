import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { ethers } from "ethers";

import { useStateContext } from "../context";
import { CountBox, CustomButton, Loader } from "../components";
import { calculateBarPercentage, daysLeft } from "../utils";
import { thirdweb } from "../assets";

ChartJS.register(ArcElement, Tooltip, Legend);

const CampaignDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { donate, getDonations, contract, getDonatorCount } = useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [donators, setDonators] = useState([]);
  const [totalDonations, setTotalDonations] = useState("0.0000");
  const [supporterCount, setSupporterCount] = useState(0);

  // Modify the fetchDonators function to use the correct campaign ID
  const fetchDonators = useCallback(async () => {
    if (!state) return;

    // Get the correct campaign ID - very important!
    const campaignId = state.id !== undefined ? state.id : state.pId;
    console.log("Fetching donators for campaign ID:", campaignId);

    if (campaignId === undefined) {
      console.error("No valid campaign ID found in state:", state);
      return;
    }

    try {
      // Make sure to use the correct ID when calling getDonations
      const donationsData = await getDonations(campaignId);
      console.log("Donations data received:", donationsData);

      if (Array.isArray(donationsData)) {
        setDonators(donationsData);

        // Calculate total donations
        const total = donationsData.reduce(
          (sum, item) => sum + parseFloat(item.donation || 0),
          0
        );
        console.log("Total donations calculated:", total);
        setTotalDonations(total.toFixed(4));
      } else {
        console.log("No donations found or invalid format");
        setDonators([]);
        setTotalDonations("0.0000");
      }
    } catch (error) {
      console.error("Error fetching donators:", error);
      setDonators([]);
      setTotalDonations("0.0000");
    }
  }, [getDonations, state]);

  // Also update the event listener to use the correct ID
  useEffect(() => {
    if (contract && state) {
      const campaignId = state.id !== undefined ? state.id : state.pId;
      console.log("Setting up event listener for campaign ID:", campaignId);

      fetchDonators();

      try {
        // Make sure we're using toString for comparison since blockchain IDs are often BigNumber
        const filter = contract.filters.DonationMade(campaignId);
        console.log("Created event filter:", filter);

        const handleNewDonation = (eventCampaignId, donor, amount) => {
          console.log("DonationMade event received:", {
            eventCampaignId: eventCampaignId.toString(),
            campaignId: campaignId.toString(),
            donor,
            amount: ethers.formatEther(amount), // Make sure ethers is imported
          });

          // Compare as strings to avoid BigNumber issues
          if (eventCampaignId.toString() === campaignId.toString()) {
            console.log("Donation is for this campaign, refreshing data");
            fetchDonators();
          }
        };

        console.log("Adding event listener for DonationMade");
        contract.on(filter, handleNewDonation);

        // Clean up
        return () => {
          console.log("Removing event listener");
          contract.off(filter, handleNewDonation);
        };
      } catch (error) {
        console.error("Error setting up event listener:", error);
        console.error("Error details:", error.message);
      }
    } else {
      console.log("No contract or state available for event listener setup", {
        hasContract: !!contract,
        hasState: !!state,
      });
    }
  }, [contract, state, fetchDonators]);

  // Handle donation submission
  const handleDonate = async () => {
    setIsLoading(true);

    try {
      if (!amount || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount");
        setIsLoading(false);
        return;
      }

      console.log(`Donating ${amount} ETH to campaign ${state.pId}`);
      console.log("State data:", state);

      // Get the correct campaign ID
      const campaignId = state.id !== undefined ? state.id : state.pId;
      console.log("Using campaign ID:", campaignId);

      // Execute the donation
      const tx = await donate(campaignId, amount);
      console.log("Donation transaction submitted:", tx);

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log("Donation transaction confirmed with receipt:", receipt);

      // Clear input field
      setAmount("");

      // Immediately fetch updated donation data
      await fetchDonators();

      alert("Thank you for your donation!");
    } catch (error) {
      console.error("Error during donation:", error);
      alert("Something went wrong while donating. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Add protection against missing state
  useEffect(() => {
    if (contract && state) fetchDonators();
  }, [contract, fetchDonators, state]);

  useEffect(() => {
    if (!contract || !state) return;

    // Initial fetch
    fetchDonators();

    // Set up a refresh interval (every 15 seconds)
    const interval = setInterval(() => {
      console.log("Refreshing donations data...");
      fetchDonators();
    }, 15000);

    // Clean up on unmount
    return () => clearInterval(interval);
  }, [contract, state, fetchDonators]);

  useEffect(() => {
    const fetchSupporterCount = async () => {
      if (!contract || !state || !state.id) return;

      try {
        // Try to get the count directly from the contract
        const count = await getDonatorCount(state.id);
        console.log("Supporter count fetched:", count);
        setSupporterCount(count);
      } catch (error) {
        console.error("Error fetching supporter count:", error);
      }
    };

    fetchSupporterCount();

    // Set up an interval to refresh the count every 15 seconds
    const interval = setInterval(fetchSupporterCount, 15000);

    return () => clearInterval(interval);
  }, [contract, state, getDonatorCount]);

  if (!state) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="font-epilogue font-bold text-[18px] text-white">
          Campaign details not found. Please go back to the homepage.
        </h1>
        <CustomButton
          btnType="button"
          title="Go Home"
          styles="w-fit bg-[#8c6dfd] ml-4"
          handleClick={() => navigate("/")}
        />
      </div>
    );
  }

  const remainingDays = daysLeft(state.deadline);

  // Calculate if campaign is expired or fully funded
  const isExpired = state.deadline * 1000 < Date.now();
  const isFullyFunded = state.amountCollected >= state.target;

  // Updated pie chart data - showing only funds raised vs remaining amount
  const pieData = {
    labels: ["Raised", "Remaining"],
    datasets: [
      {
        label: "Campaign Funding",
        data: [
          parseFloat(state.amountCollected || 0),
          Math.max(
            parseFloat(state.target || 0) -
              parseFloat(state.amountCollected || 0),
            0
          ),
        ],
        backgroundColor: ["#4acd8d", "#3a3a43"], // Light color for raised, dark color for remaining
        borderWidth: 0,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#fff",
          padding: 15,
          font: {
            family: "Epilogue, sans-serif",
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = parseFloat(state.target || 0);
            const value = context.raw;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} ETH (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%", // Creates a donut chart for better visualization
  };

  console.log("Current campaign state:", {
    id: state?.id,
    pId: state?.pId,
    donators: donators,
    totalDonations: totalDonations,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading && <Loader />}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column: Image - More Flexible */}
        <div className="lg:w-1/2 flex justify-center lg:justify-start">
          <div
            className="w-full rounded-xl overflow-hidden shadow-lg hover:shadow-[#4acd8d]/30 transition-shadow duration-300"
            style={{ maxHeight: "70vh" }}
          >
            <img
              src={state.image || "https://via.placeholder.com/500"}
              alt="campaign"
              className="w-full h-full object-contain bg-[#1c1c24]"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/500";
              }}
            />
          </div>
        </div>

        {/* Right Column: Stats Cards & Pie Chart */}
        <div className="lg:w-1/2 flex flex-col space-y-6">
          <h2 className="font-epilogue font-bold text-2xl text-white mb-2">
            {state.title}
          </h2>

          {/* Stats Cards in Grid Layout */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1c1c24] rounded-xl p-5 text-center shadow-lg transform transition-all duration-300 hover:shadow-[#4acd8d]/30 hover:shadow-xl hover:-translate-y-1">
              <h2 className="text-3xl font-bold text-white mb-1">
                {isExpired ? "Expired" : remainingDays}
              </h2>
              <p className="text-[#808191] text-sm">
                {isExpired ? "Campaign ended" : "Days Left"}
              </p>
            </div>

            <div className="bg-[#1c1c24] rounded-xl p-5 text-center shadow-lg transform transition-all duration-300 hover:shadow-[#8c6dfd]/30 hover:shadow-xl hover:-translate-y-1">
              <h2 className="text-3xl font-bold text-white mb-1">
                {state.amountCollected || "0"}
              </h2>
              <p className="text-[#808191] text-sm">Raised of {state.target}</p>
            </div>

            <div className="bg-[#1c1c24] rounded-xl p-5 text-center shadow-lg col-span-2 transform transition-all duration-300 hover:shadow-[#3a3a43]/30 hover:shadow-xl hover:-translate-y-1">
              <h2 className="text-3xl font-bold text-white mb-1">
                {/* Use the dedicated supporter count instead of donators.length */}
                {supporterCount || (donators && donators.length) || 0}
              </h2>
              <p className="text-[#808191] text-sm">Campaign Supporters</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-3 bg-[#3a3a43] rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-[#4acd8d] to-[#8c6dfd] rounded-full transition-all duration-1000 ease-in-out"
              style={{
                width: `${calculateBarPercentage(
                  state.target,
                  state.amountCollected
                )}%`,
                maxWidth: "100%",
              }}
            />
          </div>

          {/* Updated Pie Chart - SMALLER SIZE */}
          <div className="bg-[#1c1c24] rounded-xl p-5 transform transition-all duration-300 hover:shadow-[#4acd8d]/20 hover:shadow-lg">
            <h4 className="font-epilogue font-semibold text-md text-white text-center mb-4">
              Funding Progress
            </h4>
            <div className="w-full max-w-[200px] mx-auto">
              <Pie
                data={pieData}
                options={{
                  ...pieOptions,
                  maintainAspectRatio: true,
                  responsive: true,
                  plugins: {
                    ...pieOptions.plugins,
                    legend: {
                      ...pieOptions.plugins.legend,
                      position: "bottom",
                      labels: {
                        ...pieOptions.plugins.legend.labels,
                        boxWidth: 12,
                        padding: 10,
                        font: {
                          family: "Epilogue, sans-serif",
                          size: 10, // Smaller font size
                        },
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Story, Creator, Donators, and Fund sections */}
      <div className="mt-12 flex flex-col lg:flex-row gap-8">
        {/* Left Column: Creator, Story, Supporters */}
        <div className="lg:w-2/3">
          {/* Creator Section */}
          <div className="bg-[#1c1c24] rounded-xl p-6 mb-6 transform transition-all duration-300 hover:shadow-[#3a3a43]/30 hover:shadow-lg">
            <h4 className="font-epilogue font-semibold text-lg text-white">
              CREATOR
            </h4>
            <div className="mt-4 flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#2c2f32]">
                <img
                  src={thirdweb}
                  alt="user"
                  className="w-1/2 h-1/2 object-contain"
                />
              </div>
              <div>
                <h4 className="font-epilogue font-semibold text-sm text-white break-all">
                  {state.owner}
                </h4>
                <p className="font-epilogue text-xs text-[#808191]">
                  10 Campaigns
                </p>
              </div>
            </div>
          </div>

          {/* Story Section */}
          <div className="bg-[#1c1c24] rounded-xl p-6 mb-6 transform transition-all duration-300 hover:shadow-[#3a3a43]/30 hover:shadow-lg">
            <h4 className="font-epilogue font-semibold text-lg text-white">
              STORY
            </h4>
            <p className="mt-4 font-epilogue text-[#808191] leading-relaxed">
              {state.description}
            </p>
          </div>

          {/* Supporters Section
          <div className="bg-[#1c1c24] rounded-xl p-6 transform transition-all duration-300 hover:shadow-[#3a3a43]/30 hover:shadow-lg">
            <h4 className="font-epilogue font-semibold text-lg text-white">
              SUPPORTERS
            </h4>
            <div className="mt-4">
              {donators.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto">
                  {donators.map((item, index) => (
                    <div
                      key={`${item.donator}-${index}`}
                      className="flex justify-between items-center gap-4 py-2 border-b border-[#3a3a43] last:border-none hover:bg-[#2c2f32] px-2 rounded transition-colors"
                    >
                      <p className="font-epilogue text-sm text-[#b2b3bd] break-all">
                        {index + 1}. {item.donator}
                      </p>
                      <p className="font-epilogue text-sm text-[#4acd8d] font-medium">
                        {item.donation} ETH
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-epilogue text-[#808191]">
                  No supporters yet. Be the first one!
                </p>
              )}
            </div>
          </div> */}

          {/* Donation Details Section */}
          <div className="mt-4 bg-[#1c1c24] rounded-xl p-6 transform transition-all duration-300">
            <h4 className="font-epilogue font-semibold text-lg text-white mb-4">
              DONATION DETAILS
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-[#13131a] p-4 rounded-lg">
                <p className="font-epilogue text-[#808191]">Total Donations</p>
                <h3 className="font-epilogue font-semibold text-xl text-white">
                  {totalDonations} ETH
                </h3>
              </div>

              <div className="bg-[#13131a] p-4 rounded-lg">
                <p className="font-epilogue text-[#808191]">Funds Recipient</p>
                <h3 className="font-epilogue font-semibold text-sm text-white break-all">
                  {state?.owner}
                </h3>
              </div>
            </div>

            <div className="bg-[#13131a] p-4 rounded-lg">
              <p className="font-epilogue text-[#808191] mb-2">
                Where the money goes
              </p>
              <div className="font-epilogue text-white text-sm">
                <p className="mb-2">
                  • 100% of donations go directly to the campaign owner's
                  wallet.
                </p>
                <p className="mb-2">
                  • Funds are transferred immediately when a donation is made.
                </p>
                <p className="mb-2">
                  • The blockchain confirms all transactions permanently.
                </p>
                <p>• No platform fees are taken from your donation.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Fund Form */}
        <div className="lg:w-1/3">
          <div className="bg-[#1c1c24] rounded-xl p-6 sticky top-5 transform transition-all duration-300 hover:shadow-[#8c6dfd]/30 hover:shadow-lg">
            <h4 className="font-epilogue font-semibold text-lg text-white text-center">
              SUPPORT THIS CAMPAIGN
            </h4>

            <div className="mt-6">
              {!isExpired && !isFullyFunded ? (
                <>
                  <input
                    type="number"
                    placeholder="ETH 0.1"
                    step="0.01"
                    className="w-full py-3 px-4 outline-none border border-[#3a3a43] bg-transparent font-epilogue text-white text-base rounded-lg focus:border-[#4acd8d] transition-colors"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />

                  <div className="my-5 p-4 bg-[#13131a] rounded-lg">
                    <h4 className="font-epilogue font-semibold text-sm text-white">
                      Back it because you believe in it.
                    </h4>
                    <p className="mt-3 font-epilogue text-sm text-[#808191]">
                      Support the project for no reward, just because it speaks
                      to you.
                    </p>
                  </div>

                  <CustomButton
                    btnType="button"
                    title="Support Campaign"
                    styles="w-full bg-gradient-to-r from-[#8c6dfd] to-[#4acd8d] hover:opacity-90 transition-all duration-300 py-3"
                    handleClick={handleDonate}
                  />
                </>
              ) : isExpired ? (
                <div className="p-4 bg-[#FF8A71] bg-opacity-20 rounded-lg text-center">
                  <p className="font-epilogue font-semibold text-[20px] leading-[30px] text-[#FF8A71]">
                    Campaign has ended. Thank you for your interest!
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-[#1dc071] bg-opacity-20 rounded-lg text-center">
                  <p className="font-epilogue font-semibold text-[20px] leading-[30px] text-[#1dc071]">
                    Campaign is fully funded! Please consider supporting other
                    campaigns.
                  </p>
                </div>
              )}

              {/* Back button */}
              <div className="mt-5">
                <CustomButton
                  btnType="button"
                  title="Back to Campaigns"
                  styles="w-full bg-[#2c2f32] hover:bg-[#3a3a43] transition-all duration-300 py-3"
                  handleClick={() => navigate("/")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
