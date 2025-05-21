import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { DisplayCampaigns } from "../components";
import { useStateContext } from "../context";

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const location = useLocation();

  const { contract, getCampaigns } = useStateContext();

  const fetchCampaigns = React.useCallback(async () => {
    setIsLoading(true);
    const data = await getCampaigns();
    setCampaigns(data);
    setIsLoading(false);
  }, [getCampaigns]);

  const getSearchQuery = React.useCallback(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("search") || "";
  }, [location.search]);

  useEffect(() => {
    if (contract) fetchCampaigns();
  }, [contract, fetchCampaigns]); // Add fetchCampaigns to the dependency array

  useEffect(() => {
    const query = getSearchQuery();
    if (query) {
      const filtered = campaigns.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(query.toLowerCase()) ||
          campaign.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCampaigns(filtered);
    } else {
      setFilteredCampaigns(campaigns);
    }
  }, [location.search, campaigns, getSearchQuery]); // Add getSearchQuery to the dependency array

  return (
    <DisplayCampaigns
      title="All Campaigns"
      isLoading={isLoading}
      campaigns={filteredCampaigns}
    />
  );
};

export default Home;
