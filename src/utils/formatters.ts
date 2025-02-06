export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZW', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-ZW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-ZW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format for Zimbabwe phone numbers
  if (cleaned.startsWith('263')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8)}`;
  }
  
  // If number starts with 0, assume it's a local number
  if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  
  return phoneNumber;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatAddress = (
  address: string,
  city: string,
  state: string,
  country: string,
  postalCode: string
): string => {
  const parts = [address];
  
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (country) parts.push(country);
  if (postalCode) parts.push(postalCode);
  
  return parts.join(', ');
};

export const formatPropertyType = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export const formatPropertyStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};
