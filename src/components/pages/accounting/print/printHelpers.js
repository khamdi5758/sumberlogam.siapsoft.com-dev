export const getNumFieldVal = (item, keys) => {
  for (const key of keys) {
    if (item[key] !== undefined) {
      return Number(item[key] || 0);
    }
    const lowerKey = key.toLowerCase();
    const foundKey = Object.keys(item).find(k => k.toLowerCase() === lowerKey);
    if (foundKey !== undefined) {
      return Number(item[foundKey] || 0);
    }
  }
  return 0;
};

export const getStrFieldVal = (item, keys) => {
  for (const key of keys) {
    if (item[key] !== undefined) {
      return String(item[key] || "");
    }
    const lowerKey = key.toLowerCase();
    const foundKey = Object.keys(item).find(k => k.toLowerCase() === lowerKey);
    if (foundKey !== undefined) {
      return String(item[foundKey] || "");
    }
  }
  return "";
};

export const formatCurrencyID = (value) => {
  const num = Number(value || 0);
  return num.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const formatShortDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

export const formatIndoDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agt", "Sep", "Okt", "Nov", "Des"
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

export const formatLabaRugiCurrency = (value) => {
  const num = Number(value || 0);
  if (num < 0) {
    return `(${Number(Math.abs(num)).toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })})`;
  }
  return num.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const formatCurrency = (value) => {
  if (value === null || value === undefined) return "";
  if (value === 0) return "-";
  const formatted = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
  }).format(Math.abs(value));
  return value < 0 ? `(${formatted})` : formatted;
};
