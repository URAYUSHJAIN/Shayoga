// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFunding {
    // Add this event for better real-time tracking
    event DonationMade(uint256 indexed campaignId, address indexed donor, uint256 amount);
    
    struct Campaign {
        uint256 id;
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 amountcollected;
        uint256 deadline;
        string image;
        address[] donators;
        uint256[] donations;
    }
    mapping(uint256 => Campaign) public campaigns;

    uint256 public campaignCount = 0;

    function createCampaign(
        address _owner,
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline,
        string memory _image
    ) public returns (uint256) {
        require(_deadline > block.timestamp, "The deadline has passed");

        Campaign storage campaign = campaigns[campaignCount];
        campaign.id = campaignCount;
        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.amountcollected = 0;
        campaign.deadline = _deadline;
        campaign.image = _image;

        campaignCount++;
        return campaign.id;
    }

    function donateToCampaign(uint256 _id) public payable {
        uint256 amount = msg.value;
        Campaign storage campaign = campaigns[_id];
        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);
        
        (bool sent, ) = payable(campaign.owner).call{value: amount}("");
        if (sent) {
            campaign.amountcollected += amount;
            // Emit the donation event
            emit DonationMade(_id, msg.sender, amount);
        }
    }

    // UPDATED: Return both donator addresses and donation amounts
    function getDonators(uint256 _id) public view returns (address[] memory, uint256[] memory) {
        Campaign storage campaign = campaigns[_id];
        return (campaign.donators, campaign.donations);
    }

    // Also add a helper function to get donor count
    function getDonatorCount(uint256 _id) public view returns (uint256) {
        return campaigns[_id].donators.length;
    }

    function getCampaigns() public view returns (
        uint256[] memory, address[] memory, string[] memory, string[] memory,
        uint256[] memory, uint256[] memory, uint256[] memory, string[] memory
    ) {
        uint256[] memory ids = new uint256[](campaignCount);
        address[] memory owners = new address[](campaignCount);
        string[] memory titles = new string[](campaignCount);
        string[] memory descriptions = new string[](campaignCount);
        uint256[] memory targets = new uint256[](campaignCount);
        uint256[] memory amountcollecteds = new uint256[](campaignCount);
        uint256[] memory deadlines = new uint256[](campaignCount);
        string[] memory images = new string[](campaignCount);

        for (uint256 i = 0; i < campaignCount; i++) {
            Campaign storage c = campaigns[i];
            ids[i] = c.id;
            owners[i] = c.owner;
            titles[i] = c.title;
            descriptions[i] = c.description;
            targets[i] = c.target;
            amountcollecteds[i] = c.amountcollected;
            deadlines[i] = c.deadline;
            images[i] = c.image;
        }
        return (ids, owners, titles, descriptions, targets, amountcollecteds, deadlines, images);
    }

    function getCampaign(uint256 _id) public view returns (Campaign memory) {
        return campaigns[_id];
    }
}