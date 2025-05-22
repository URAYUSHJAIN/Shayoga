import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";

import { useStateContext } from "../context";
import { money } from "../assets";
import { CustomButton, FormField, Loader } from "../components";
import { checkIfImage } from "../utils/index";

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { createCampaign } = useStateContext();
  const [form, setForm] = useState({
    name: "",
    title: "",
    description: "",
    target: "",
    deadline: "",
    image: "",
    pdf: "", // <-- Add this line
  });

  const handleFormFieldChange = (fieldName, e) => {
    setForm({ ...form, [fieldName]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all required fields
    if (
      !form.name ||
      !form.title ||
      !form.description ||
      !form.target ||
      !form.deadline ||
      !form.image
    ) {
      alert("Please fill all the required fields");
      return;
    }

    // Validate target is a valid number
    if (isNaN(parseFloat(form.target)) || parseFloat(form.target) <= 0) {
      alert("Please enter a valid target amount");
      return;
    }

    checkIfImage(form.image, async (exists) => {
      if (exists) {
        setIsLoading(true);
        try {
          await createCampaign({
            ...form,
            target: ethers.parseUnits(form.target, 18),
          });
          setIsLoading(false);
          navigate("/");
        } catch (error) {
          console.error("Error creating campaign:", error);
          alert("Failed to create campaign. Please try again.");
          setIsLoading(false);
        }
      } else {
        alert("Provide valid image URL");
        setForm({ ...form, image: "" });
      }
    });
  };

  return (
    <div className="flex justify-center items-center flex-col sm:p-10 p-4">
      {isLoading && <Loader />}
      <div className="flex justify-center items-center p-[16px] sm:min-w-[380px] ">
        <h1 className="font-epilogue font-bold sm:text-[25px] text-[18px] leading-[38px] text-white">
          Start a Campaign
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-full mt-[40px] flex flex-col gap-[30px]"
      >
        <div className="flex flex-wrap gap-[40px]">
          <FormField
            labelName="Your Name *"
            placeholder="Ayush Jain"
            inputType="text"
            value={form.name}
            handleChange={(e) => handleFormFieldChange("name", e)}
          />
          <FormField
            labelName="Campaign Title *"
            placeholder="Write a title"
            inputType="text"
            value={form.title}
            handleChange={(e) => handleFormFieldChange("title", e)}
          />
        </div>

        <FormField
          labelName="Story *"
          placeholder="Write your story"
          isTextArea
          value={form.description}
          handleChange={(e) => handleFormFieldChange("description", e)}
        />

        <div className="w-full flex justify-start items-center p-4 bg-gradient-to-r from-[#8c6dfd] to-[#7c5dfd] h-[100px] rounded-[10px]">
          <img
            src={money}
            alt="money"
            className="w-[40px] h-[40px] object-contain"
          />
          <h4 className="font-epilogue font-bold text-[25px] text-white ml-[20px]">
            You will get 100% of the raised amount
          </h4>
        </div>

        <div className="flex flex-wrap gap-[40px]">
          <FormField
            labelName="Goal *"
            placeholder="ETH 0.50"
            inputType="text"
            value={form.target}
            handleChange={(e) => handleFormFieldChange("target", e)}
          />
          <FormField
            labelName="End Date *"
            placeholder="End Date"
            inputType="date"
            value={form.deadline}
            handleChange={(e) => handleFormFieldChange("deadline", e)}
          />
        </div>

        <FormField
          labelName="Campaign image *"
          placeholder="Place image URL of your campaign"
          inputType="url"
          value={form.image}
          handleChange={(e) => handleFormFieldChange("image", e)}
        />

        <FormField
          labelName="Proof PDF (URL)"
          placeholder="Paste a link to your PDF proof (optional)"
          inputType="url"
          value={form.pdf}
          handleChange={(e) => handleFormFieldChange("pdf", e)}
        />

        <div className="flex justify-center items-center mt-[30px]">
          <CustomButton
            btnType="submit"
            title="Submit new campaign"
            styles="bg-gradient-to-r from-[#8c6dfd] to-[#1dc071] hover:opacity-90 transition-all duration-300"
          />
        </div>
      </form>
    </div>
  );
};

export default CreateCampaign;
