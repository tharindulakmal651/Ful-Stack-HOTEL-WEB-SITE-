// Prices are already stored as LKR in the database
export const toRs = (lkrPrice) => {
  const price = parseFloat(lkrPrice || 0);
  return `LKR ${price.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const toRsNum = (lkrPrice) => parseFloat(lkrPrice || 0);

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
