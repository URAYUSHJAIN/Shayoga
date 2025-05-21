import React from "react";
import { tagType, thirdweb } from "../assets";
import { daysLeft } from "../utils";

const FundCard = ({
  owner,
  title,
  description,
  target,
  deadline,
  amountcollected,
  image,
  handleClick,
  donators,
  isExpired,
  isFunded,
}) => {
  const remainingDays = daysLeft(deadline);
  const progress = Math.min((amountcollected / target) * 100, 100);
  const supportersCount = donators ? donators.length : 0;

  // Format the amount display
  const formattedAmount = parseFloat(amountcollected).toFixed(2);
  const formattedTarget = parseFloat(target).toFixed(1);

  return (
    <div
      className={`sm:w-[288px] w-full rounded-[15px] bg-[#1c1c24] cursor-pointer transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg hover:shadow-[#3a3a43]/50 ${
        isExpired || isFunded ? "grayscale-[0.3]" : ""
      }`}
      onClick={handleClick}
    >
      {/* Campaign Image */}
      <img
        src={image}
        alt="fund"
        className="w-full h-[158px] object-cover rounded-t-[15px]"
      />

      <div className="flex flex-col p-4">
        {/* Category Tag */}
        <div className="flex flex-row items-center mb-[18px]">
          <div className="bg-[#13131a] p-1 rounded-md">
            <img
              src={tagType}
              alt="tag"
              className="w-[17px] h-[17px] object-contain"
            />
          </div>
          <p className="ml-[12px] mt-[2px] font-epilogue font-medium text-[12px] text-[#808191]">
            Education
          </p>
        </div>

        {/* Campaign Title & Description */}
        <div className="block">
          <h3 className="font-epilogue font-semibold text-[16px] text-white text-left leading-[26px] truncate">
            {title}
          </h3>
          <p className="mt-[5px] font-epilogue font-normal text-[#808191] text-left leading-[18px] truncate">
            {description}
          </p>
        </div>

        {/* Campaign Stats */}
        <div className="flex justify-between flex-wrap mt-[15px] gap-2">
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">
              {formattedAmount}
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">
              Raised of {formattedTarget}
            </p>
          </div>
          <div className="flex flex-col">
            <h4 className="font-epilogue font-semibold text-[14px] text-[#b2b3bd] leading-[22px]">
              {isExpired ? "Expired" : remainingDays}
            </h4>
            <p className="mt-[3px] font-epilogue font-normal text-[12px] leading-[18px] text-[#808191] sm:max-w-[120px] truncate">
              {isExpired ? "Campaign ended" : "Days Left"}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-[15px]">
          <div className="w-full bg-[#3a3a43] h-[5px] rounded-[10px]">
            <div
              className={`h-full rounded-[10px] ${
                isFunded ? "bg-[#1dc071]" : "bg-[#4acd8d]"
              }`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Creator & Supporters Info */}
        <div className="flex items-center mt-[15px]">
          <div className="w-[30px] h-[30px] rounded-full flex justify-center items-center bg-[#13131a]">
            <img
              src={thirdweb}
              alt="user"
              className="w-1/2 h-1/2 object-contain"
            />
          </div>
          <div className="ml-2">
            <p className="font-epilogue font-normal text-[12px] text-[#808191] truncate">
              by{" "}
              <span className="text-[#b2b3bd]">
                {owner.slice(0, 6)}...{owner.slice(-4)}
              </span>
            </p>
          </div>
        </div>

        {/* Supporters count as separate element for better alignment */}
        <div className="mt-2">
          <p className="font-epilogue font-normal text-[12px] text-[#808191]">
            {supportersCount === 0
              ? "No supporters yet. Be the first one!"
              : `${supportersCount} Supporter${supportersCount > 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Status indicators */}
        {isFunded && (
          <div className="mt-2 py-1 bg-[#1dc071] bg-opacity-20 rounded-lg text-center">
            <p className="font-epilogue font-semibold text-[14px] text-[#1dc071]">
              Fully Funded
            </p>
          </div>
        )}

        {isExpired && !isFunded && (
          <div className="mt-2 py-1 bg-[#FF8A71] bg-opacity-20 rounded-lg text-center">
            <p className="font-epilogue font-semibold text-[14px] text-[#FF8A71]">
              Campaign Ended
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundCard;
