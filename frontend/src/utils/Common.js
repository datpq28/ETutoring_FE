const convertSizeToBytes = (size) => {
  const units = { KB: 1024, MB: 1024 * 1024, GB: 1024 * 1024 * 1024 };
  const match = size.match(/([\d.]+)\s?(KB|MB|GB)/);

  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2];
    return value * (units[unit] || 1);
  }
  return 0;
};

const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export { convertSizeToBytes, truncateText };
