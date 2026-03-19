// Exchange rate: 1 USD = 320 LKR (update as needed)
export const USD_TO_LKR = 320;

export const toRs = (usd) => {
  const lkr = parseFloat(usd || 0) * USD_TO_LKR;
  return `Rs. ${lkr.toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
};

export const toRsNum = (usd) => parseFloat(usd || 0) * USD_TO_LKR;

// Image URL helper — serves from backend port 5000
const BACKEND = 'http://localhost:5000';
export const imgUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BACKEND}${url}`;
};

// Parse image_urls JSON safely
export const getImages = (item) => {
  try {
    const urls = JSON.parse(item?.image_urls || '[]');
    if (urls.length > 0) return urls;
  } catch {}
  if (item?.image_url) return [item.image_url];
  return [];
};

// Parse includes/amenities JSON safely
export const parseJSON = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
};
