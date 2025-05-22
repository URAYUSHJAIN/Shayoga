// Dummy proof/testimonial data
const proofTestimonials = [
  {
    name: "Aarav S.",
    text: "After our campaign, we received the funds instantly and used them to buy solar lights for our school. The process was transparent and secure!",
    date: "2025-05-10",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Priya K.",
    text: "I was able to track every withdrawal and see exactly how the money was spent. This platform really builds trust!",
    date: "2025-05-15",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "Rahul T.",
    text: "The withdrawal history and proof features gave our backers confidence. Highly recommend!",
    date: "2025-05-20",
    avatar: "https://randomuser.me/api/portraits/men/65.jpg",
  },
];
import React, { useState } from "react";

const avatarOptions = [
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/65.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/77.jpg",
  "https://randomuser.me/api/portraits/women/12.jpg",
  "https://randomuser.me/api/portraits/lego/1.jpg",
  "https://randomuser.me/api/portraits/lego/2.jpg",
];

const Withdraw = () => {
  const [testimonials, setTestimonials] = useState([...proofTestimonials]);
  const [form, setForm] = useState({
    name: "",
    wallet: "",
    text: "",
    avatar: avatarOptions[0],
    date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTestimonial = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.wallet.trim() || !form.text.trim()) return;
    setTestimonials([
      {
        name: form.name,
        wallet: form.wallet,
        text: form.text,
        avatar: form.avatar,
        date: new Date().toISOString().split("T")[0],
      },
      ...testimonials,
    ]);
    setForm({
      name: "",
      wallet: "",
      text: "",
      avatar: avatarOptions[0],
      date: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <div className="flex flex-col p-4 bg-[#181818] min-h-[300px] rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-[#4acd8d] drop-shadow">
        Share Your Experience
      </h2>
      <p className="text-gray-300 mb-4 text-md italic">
        Your help means the world to me — you've given me hope and a chance to
        move forward
      </p>
      <form
        onSubmit={handleAddTestimonial}
        className="mb-6 bg-[#23232b] p-4 rounded-lg shadow flex flex-col md:flex-row items-center gap-4"
      >
        <div className="flex flex-col gap-2 w-full md:w-1/5">
          <label className="text-[#4acd8d] font-semibold mb-1">
            Choose Avatar
          </label>
          <div className="flex flex-wrap gap-2">
            {avatarOptions.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`avatar-${idx}`}
                className={`w-12 h-12 rounded-full border-2 cursor-pointer object-cover ${
                  form.avatar === url ? "border-[#4acd8d]" : "border-[#23232b]"
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
          className="border-2 border-[#4acd8d] bg-[#181818] text-white placeholder:text-[#4acd8d] p-3 rounded-lg focus:outline-none focus:border-[#1dc071] transition-colors duration-200 shadow w-full md:w-1/5"
          autoComplete="off"
        />
        <input
          type="text"
          name="wallet"
          placeholder="Your wallet address (0x...)"
          value={form.wallet}
          onChange={handleChange}
          className="border-2 border-[#4acd8d] bg-[#181818] text-white placeholder:text-[#4acd8d] p-3 rounded-lg focus:outline-none focus:border-[#1dc071] transition-colors duration-200 shadow w-full md:w-1/5"
          autoComplete="off"
        />
        <textarea
          name="text"
          placeholder="Share your experience or feedback as a donor..."
          value={form.text}
          onChange={handleChange}
          className="flex-1 border-2 border-[#4acd8d] bg-[#181818] text-white placeholder:text-[#4acd8d] p-3 rounded-lg focus:outline-none focus:border-[#1dc071] transition-colors duration-200 shadow resize-none min-h-[60px]"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-[#4acd8d] to-[#1dc071] text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-all duration-300 shadow min-w-[180px]"
        >
          Add Testimonial
        </button>
      </form>
      <div className="mt-8">
        <h3 className="text-xl font-bold text-[#4acd8d] mb-4">
          Proof & Testimonials
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-[#23232b] rounded-lg p-4 shadow flex flex-col items-center text-center transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:border-[#4acd8d] border-2 border-transparent"
            >
              <img
                src={t.avatar}
                alt={t.name}
                className="w-16 h-16 rounded-full mb-2 border-2 border-[#4acd8d] object-cover"
              />
              <span className="text-[#4acd8d] font-semibold">{t.name}</span>
              {t.wallet && (
                <span className="text-[#8c6dfd] text-xs mt-1">{t.wallet}</span>
              )}
              <p className="text-white italic mb-2 mt-2">"{t.text}"</p>
              <span className="text-[#b2b3bd] text-xs mt-1">{t.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
