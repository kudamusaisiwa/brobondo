import { startOfWeek, endOfWeek, format, addDays, eachDayOfInterval } from 'date-fns';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export function getDateRange(timeRange: string): DateRange {
  const now = new Date();
  const startDate = new Date();
  const endDate = new Date();

  switch (timeRange) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case 'yesterday':
      startDate.setDate(startDate.getDate() - 1);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() - 1);
      endDate.setHours(23, 59, 59, 999);
      break;

    case '7d': {
      // Get last 7 days including today
      startDate.setDate(startDate.getDate() - 6); // Go back 6 days to include today
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    }

    case '30d':
      startDate.setDate(startDate.getDate() - 29); // Go back 29 days to include today
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case '3m':
      startDate.setMonth(startDate.getMonth() - 3);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case '6m':
      startDate.setMonth(startDate.getMonth() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    case '12m':
      startDate.setMonth(startDate.getMonth() - 12);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;

    default:
      // Default to today
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
  }

  return { startDate, endDate };
}

export function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  return eachDayOfInterval({ start: startDate, end: endDate });
}

export function formatDateForDisplay(date: Date, timeRange: string): string {
  switch (timeRange) {
    case 'today':
    case 'yesterday':
      return format(date, 'HH:mm');
    case '7d':
      return format(date, 'EEE'); // Short weekday name
    case '30d':
      return format(date, 'MMM dd'); // Month + day
    case '3m':
    case '6m':
      return format(date, 'MMM dd'); // Month + day
    case '12m':
      return format(date, 'MMM yyyy'); // Month + year
    default:
      return format(date, 'yyyy-MM-dd');
  }
}

export function isValidDate(date: any): boolean {
  if (!date) return false;
  if (date instanceof Date) return !isNaN(date.getTime());
  if (typeof date === 'string' || typeof date === 'number') {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }
  return false;
}

export function parseDisplayDate(displayDate: string, timeRange: string): Date {
  // Handle different date formats based on timeRange
  switch (timeRange) {
    case 'today':
    case 'yesterday':
    case '7d':
      // Format: "DD MMM" - e.g., "15 Jan"
      const [day, month] = displayDate.split(' ');
      const year = new Date().getFullYear();
      return new Date(`${month} ${day}, ${year}`);
    
    case '30d':
    case '3m':
    case '6m':
      // Format: "DD MMM YY" - e.g., "15 Jan 23"
      return new Date(displayDate);
    
    default:
      return new Date(displayDate);
  }
}