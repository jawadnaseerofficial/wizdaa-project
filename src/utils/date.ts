export const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
};

export const isValidDateRange = (startDate: Date, endDate: Date): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end && start >= new Date();
};

export const formatDate = (date: Date): string => {
  return new Date(date).toISOString().split('T')[0];
};

export const isWeekend = (date: Date): boolean => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

export const getBusinessDays = (startDate: Date, endDate: Date): number => {
  let count = 0;
  let current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    if (!isWeekend(current)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
};