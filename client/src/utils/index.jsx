export const daysLeft = (deadline) => {
  if (!deadline) return 0;

  // Convert seconds to milliseconds if needed (Unix timestamp is in seconds)
  const deadlineMs = deadline * 1000 > Date.now() ? deadline * 1000 : deadline;

  const difference = deadlineMs - Date.now();
  const remainingDays = difference / (1000 * 3600 * 24);

  return remainingDays > 0 ? remainingDays.toFixed(0) : 0;
};

export const calculateBarPercentage = (goal, raisedAmount) => {
  const percentage = Math.round((raisedAmount * 100) / goal);

  return percentage;
};

export const checkIfImage = (url, callback) => {
  const img = new Image();
  img.src = url;

  if (img.complete) callback(true);

  img.onload = () => callback(true);
  img.onerror = () => callback(false);
};

// Dummy implementation for checkIfMatchingActive
// Replace with real logic as needed (e.g., fetch from API or contract)
export const checkIfMatchingActive = async (campaignId) => {
  // Example: always return inactive, multiplier 1
  // You can replace this with actual logic (API call, contract read, etc.)
  return {
    isActive: false,
    multiplier: 1,
  };
};

// Simple notifyUser implementation
// You can replace this with a toast library or custom UI
export function notifyUser(message) {
  window.alert(message);
}
