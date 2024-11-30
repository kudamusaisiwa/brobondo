import { format } from 'date-fns';

export const generateOrderNumber = async (getLastOrderNumber: () => Promise<string | null>) => {
  const today = new Date();
  const datePrefix = format(today, 'yyMMdd');
  
  // Get the last order number for today
  const lastOrderNumber = await getLastOrderNumber();
  
  if (!lastOrderNumber || !lastOrderNumber.startsWith(datePrefix)) {
    // If no orders today or different date, start at 001
    return `${datePrefix}001`;
  }
  
  // Extract the sequence number and increment it
  const currentSequence = parseInt(lastOrderNumber.slice(-3));
  const nextSequence = (currentSequence + 1).toString().padStart(3, '0');
  
  if (parseInt(nextSequence) > 999) {
    throw new Error('Maximum orders for today reached');
  }
  
  return `${datePrefix}${nextSequence}`;
};
