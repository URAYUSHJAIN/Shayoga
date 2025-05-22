import React, { useState } from "react";
import { useStateContext } from "../context";
import { CustomButton, Loader } from "../components";
import { motion } from "framer-motion";

const avatarOptions = [
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/77.jpg",
  "https://randomuser.me/api/portraits/women/12.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/65.jpg",
  "https://randomuser.me/api/portraits/lego/1.jpg",
  "https://randomuser.me/api/portraits/lego/2.jpg",
  "https://randomuser.me/api/portraits/lego/3.jpg",
];

const Payment = () => {
  const { address } = useStateContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [testimonials, setTestimonials] = useState([
    {
      name: "Saanvi P.",
      text: "I donated to a campaign and received instant confirmation on the blockchain. The transparency is amazing!",
      date: "2025-05-12",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      address: "0xA1...1234",
      // badge removed
    },
    {
      name: "Vikram R.",
      text: "Seeing the impact of my donation and reading updates from the host made me trust this platform.",
      date: "2025-05-18",
      avatar: "https://randomuser.me/api/portraits/men/77.jpg",
      address: "0xB2...5678",
      // badge removed
    },
    {
      name: "Meera D.",
      text: "The matching donation feature doubled my impact! Love the clarity and proof provided.",
      date: "2025-05-20",
      avatar: "https://randomuser.me/api/portraits/women/12.jpg",
      address: "0xC3...9abc",
      // badge removed
    },
  ]);
  const [form, setForm] = useState({
    name: "",
    text: "",
    avatar: avatarOptions[0],
    date: new Date().toISOString().split("T")[0],
  });

  // Matching logic removed

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTestimonial = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.text.trim()) return;
    setIsSubmitting(true);

    // Simulate loading for better UX
    setTimeout(() => {
      setTestimonials([
        {
          name: form.name,
          text: form.text,
          avatar: form.avatar,
          date: new Date().toISOString().split("T")[0],
          address: address
            ? `${address.slice(0, 6)}...${address.slice(-4)}`
            : "0x...",
        },
        ...testimonials,
      ]);
      setForm({
        name: "",
        text: "",
        avatar: avatarOptions[0],
        date: new Date().toISOString().split("T")[0],
      });
      setIsSubmitting(false);
      setShowThankYou(true);
      setTimeout(() => setShowThankYou(false), 3000);
    }, 700);
  };

  return (
    <div className="flex flex-col p-4 bg-[#181818] min-h-[400px] rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-2 text-[#4acd8d] drop-shadow">
        Share Your Experience
      </h2>
      <p className="text-gray-300 mb-4 text-md italic">
        Your support is making real change happen — thank you for being a part
        of something bigger
      </p>

      {showThankYou && (
        <div className="bg-[#1dc071] text-white p-3 rounded-lg mb-4 text-center animate-pulse">
          Thank you for sharing your experience! Your testimonial helps build
          trust in our community.
        </div>
      )}

      <form
        onSubmit={handleAddTestimonial}
        className="mb-6 bg-[#23232b] p-6 rounded-lg shadow flex flex-col gap-6"
      >
        <div className="flex flex-col md:flex-row gap-6 w-full items-center justify-between">
          <div className="flex flex-col gap-2 w-full md:w-1/5">
            <label className="text-[#4acd8d] font-semibold mb-1">
              Choose Avatar
            </label>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {avatarOptions.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`avatar-${idx}`}
                  className={`w-12 h-12 rounded-full border-2 cursor-pointer object-cover transition-all hover:scale-110 ${
                    form.avatar === url
                      ? "border-[#4acd8d] scale-110 shadow-lg"
                      : "border-[#23232b] opacity-70"
                  }`}
                  onClick={() => setForm((prev) => ({ ...prev, avatar: url }))}
                />
              ))}
            </div>
          </div>
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            className="border-2 border-[#4acd8d] bg-[#181818] text-white placeholder:text-[#4acd8d] p-3 rounded-lg focus:outline-none focus:border-[#1dc071] transition-all duration-200 shadow w-full md:w-1/5 hover:border-[#1dc071] hover:shadow-md"
            autoComplete="off"
          />
          <input
            type="text"
            name="wallet"
            placeholder="Your wallet address (0x...)"
            value={form.wallet}
            onChange={handleChange}
            className="border-2 border-[#4acd8d] bg-[#181818] text-white placeholder:text-[#4acd8d] p-3 rounded-lg focus:outline-none focus:border-[#1dc071] transition-all duration-200 shadow w-full md:w-1/5 hover:border-[#1dc071] hover:shadow-md"
            autoComplete="off"
          />
          <textarea
            name="text"
            placeholder="Share your experience or feedback as a donor..."
            value={form.text}
            onChange={handleChange}
            className="border-2 border-[#4acd8d] bg-[#181818] text-white placeholder:text-[#4acd8d] p-3 rounded-lg focus:outline-none focus:border-[#1dc071] transition-all duration-200 shadow resize-none min-h-[60px] w-full md:w-1/3 hover:border-[#1dc071] hover:shadow-md"
          />
          {isSubmitting ? (
            <div className="min-w-[180px] flex justify-center">
              <Loader />
            </div>
          ) : (
            <button
              type="submit"
              className="bg-gradient-to-r from-[#4acd8d] to-[#1dc071] text-white font-bold py-3 px-6 rounded-lg hover:scale-105 hover:shadow-lg transition-all duration-300 shadow min-w-[180px]"
            >
              Add Testimonial
            </button>
          )}
        </div>
      </form>

      {testimonials.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[#4acd8d]">
              What Our Donors Say
            </h3>
            <span className="bg-[#23232b] text-[#4acd8d] px-3 py-1 rounded-full text-sm">
              {testimonials.length} Testimonials
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-[#23232b] rounded-lg p-4 shadow-md flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#4acd8d] border-2 border-transparent"
              >
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-16 h-16 rounded-full mb-2 border-2 border-[#4acd8d] object-cover hover:scale-110 transition-all cursor-pointer"
                />
                <span className="text-[#4acd8d] font-semibold">{t.name}</span>
                {t.address && (
                  <span className="text-[#8c6dfd] text-xs mt-1 bg-[#181818] px-2 py-1 rounded-full">
                    {t.address}
                  </span>
                )}
                <p className="text-white italic mb-2 mt-3 bg-[#181818] p-2 rounded-lg">
                  "{t.text}"
                </p>
                <span className="text-[#b2b3bd] text-xs mt-1">{t.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {testimonials.length === 0 && (
        <div className="mt-8 text-center p-8 border-2 border-dashed border-[#4acd8d] rounded-lg">
          <p className="text-gray-300 text-lg">
            Be the first to share your experience!
          </p>
        </div>
      )}
    </div>
  );
};

export default Payment;
