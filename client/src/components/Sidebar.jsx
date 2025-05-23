import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { logo, sun } from "../assets";
import { navlinks } from "../constants";

const Icon = ({ styles, name, imgUrl, isActive, disabled, handleClick }) => (
  <div
    className={`w-[48px] h-[48px] rounded-[10px] ${
      isActive && isActive === name && "bg-[#2c2f32]"
    } flex justify-center items-center ${
      !disabled && "cursor-pointer"
    } ${styles}`}
    onClick={handleClick}
  >
    {!isActive ? (
      <img src={imgUrl} alt="fund_logo" className="w-1/2 h-1/2" />
    ) : (
      <img
        src={imgUrl}
        alt="fund_logo"
        className={`w-1/2 h-1/2 ${isActive !== name && "grayscale"}`}
      />
    )}
  </div>
);

const Sidebar = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState("dashboard");
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Apply theme class to the document when mode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="flex justify-between items-center flex-col sticky top-5 h-[93vh]">
      <Link to="/">
        <Icon styles="w-[52px] h-[52px] bg-[#2c2f32]" imgUrl={logo} />
      </Link>{" "}
      <div className="flex-1 flex flex-col justify-between items-center bg-[#1c1c24] rounded-[20px] w-[76px] py-4 mt-12">
        <div className="flex flex-col justify-center items-center gap-3">
          {navlinks.map((link) => (
            <Icon
              key={link.name}
              {...link}
              isActive={isActive}
              handleClick={() => {
                if (!link.disabled) {
                  if (link.name === "logout") {
                    // Direct to logout page for animation effect
                    navigate("/logout");
                  } else {
                    setIsActive(link.name);
                    navigate(link.link);
                  }
                }
              }}
            />
          ))}
        </div>

        <div 
          className={`w-[48px] h-[48px] rounded-[10px] bg-[#1c1c24] shadow-secondary flex justify-center items-center cursor-pointer transition-transform hover:scale-110 ${isDarkMode ? 'rotate-0' : 'rotate-180'}`} 
          onClick={toggleTheme}
        >
          <img src={sun} alt="theme_toggle" className="w-1/2 h-1/2" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
