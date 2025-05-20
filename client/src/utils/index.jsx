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
