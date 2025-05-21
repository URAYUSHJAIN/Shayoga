import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import FundCard from "./FundCard";
import { loader } from "../assets";
import { useStateContext } from "../context";

const DisplayCampaigns = ({ title, isLoading, campaigns }) => {
  const navigate = useNavigate();
  const { contract, getDonations } = useStateContext();
  const [campaignsWithDonors, setCampaignsWithDonors] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(true);

  // Fetch donors for all campaigns
  useEffect(() => {
    const fetchAllDonors = async () => {
      if (!campaigns.length || !contract) {
        setLoadingDonors(false);
        return;
      }

      setLoadingDonors(true);
      try {
        const campaignsWithDonorsData = await Promise.all(
          campaigns.map(async (campaign) => {
            // Use either id or pId depending on what's available
            const pId = campaign.pId !== undefined ? campaign.pId : campaign.id;
            let donorsData = [];

            try {
              donorsData = await getDonations(pId);
              console.log(`Fetched donors for campaign ${pId}:`, donorsData);
            } catch (error) {
              console.error(
                `Error fetching donors for campaign ${pId}:`,
                error
              );
            }

            return {
              ...campaign,
              donators: donorsData || [],
              supporterCount: donorsData ? donorsData.length : 0,
            };
          })
        );

        setCampaignsWithDonors(campaignsWithDonorsData);
      } catch (err) {
        console.error("Error fetching donors data:", err);
      }
      setLoadingDonors(false);
    };

    fetchAllDonors();
  }, [campaigns, contract, getDonations]);

  const handleNavigate = (campaign) => {
    // Find the campaign with donor data
    const campaignWithDonors =
      campaignsWithDonors.find(
        (c) => c.id === campaign.id || c.pId === campaign.pId
      ) || campaign;

    console.log("Navigating to campaign with data:", campaignWithDonors);

    navigate(`/campaign-details/${encodeURIComponent(campaign.title)}`, {
      state: {
        ...campaignWithDonors,
        pId: campaign.id !== undefined ? campaign.id : campaign.pId,
        amountCollected:
          campaign.amountCollected || campaign.amountcollected || 0,
      },
    });
  };

  // Use the campaignsWithDonors instead of original campaigns
  const campaignsToUse = loadingDonors ? campaigns : campaignsWithDonors;

  // Filter active campaigns (not expired and not fully funded)
  const activeCampaigns = campaignsToUse.filter((campaign) => {
    const isExpired = campaign.deadline * 1000 < Date.now();
    const target = parseFloat(campaign.target);
    const collected = parseFloat(
      campaign.amountCollected || campaign.amountcollected || 0
    );
    const isFullyFunded = collected >= target;
    return !isExpired && !isFullyFunded;
  });

  // Filter expired campaigns
  const expiredCampaigns = campaignsToUse.filter(
    (campaign) => campaign.deadline * 1000 < Date.now()
  );

  // Filter fully funded campaigns
  const fullyFundedCampaigns = campaignsToUse.filter((campaign) => {
    const target = parseFloat(campaign.target);
    const collected = parseFloat(
      campaign.amountCollected || campaign.amountcollected || 0
    );
    return collected >= target && campaign.deadline * 1000 >= Date.now();
  });

  return (
    <div>
      <h1 className="font-epilogue font-semibold text-[18px] text-white text-left">
        {title} ({activeCampaigns.length})
      </h1>

      <div className="flex flex-wrap mt-[20px] gap-[26px]">
        {(isLoading || loadingDonors) && (
          <img
            src={loader}
            alt="loader"
            className="w-[100px] h-[100px] object-contain"
          />
        )}

        {!isLoading &&
          !loadingDonors &&
          activeCampaigns.length === 0 &&
          expiredCampaigns.length === 0 &&
          fullyFundedCampaigns.length === 0 && (
            <p className="font-epilogue font-semibold text-[14px] leading-[30px] text-[#818183]">
              No campaigns found
            </p>
          )}

        {/* Active campaigns */}
        {!isLoading &&
          !loadingDonors &&
          activeCampaigns.length > 0 &&
          activeCampaigns.map((campaign) => (
            <div
              key={uuidv4()}
              className="cursor-pointer"
              onClick={() => handleNavigate(campaign)}
            >
              <FundCard
                {...campaign}
                amountcollected={
                  campaign.amountCollected || campaign.amountcollected || 0
                }
                donators={campaign.donators || []}
                handleClick={() => handleNavigate(campaign)}
              />
            </div>
          ))}

        {/* Fully funded campaigns section */}
        {!isLoading && !loadingDonors && fullyFundedCampaigns.length > 0 && (
          <div className="w-full mt-4">
            <h2 className="font-epilogue font-semibold text-[16px] text-[#B2B3BD] text-left mb-3">
              Fully Funded Campaigns ({fullyFundedCampaigns.length})
            </h2>
            <div className="flex flex-wrap gap-[26px]">
              {fullyFundedCampaigns.map((campaign) => (
                <div
                  key={uuidv4()}
                  className="opacity-70 cursor-pointer"
                  onClick={() => handleNavigate(campaign)}
                >
                  <FundCard
                    {...campaign}
                    amountcollected={
                      campaign.amountCollected || campaign.amountcollected || 0
                    }
                    donators={campaign.donators || []}
                    handleClick={() => handleNavigate(campaign)}
                    isFunded={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expired campaigns section */}
        {!isLoading && !loadingDonors && expiredCampaigns.length > 0 && (
          <div className="w-full mt-4">
            <h2 className="font-epilogue font-semibold text-[16px] text-[#B2B3BD] text-left mb-3">
              Expired Campaigns ({expiredCampaigns.length})
            </h2>
            <div className="flex flex-wrap gap-[26px]">
              {expiredCampaigns.map((campaign) => (
                <div
                  key={uuidv4()}
                  className="opacity-60 cursor-pointer"
                  onClick={() => handleNavigate(campaign)}
                >
                  <FundCard
                    {...campaign}
                    amountcollected={
                      campaign.amountCollected || campaign.amountcollected || 0
                    }
                    donators={campaign.donators || []}
                    handleClick={() => handleNavigate(campaign)}
                    isExpired={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplayCampaigns;
