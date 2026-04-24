export const capitalize = (str: string) =>
  str.replace(/\b\w/g, (c) => c.toUpperCase());

export const removeDuplicates = <T>(arr: T[]): T[] =>
  arr.filter((item, index) => arr.indexOf(item) === index);

export const formatDateString = (dateString: string, isLongFormat = true): string => {
    const options: Intl.DateTimeFormatOptions = isLongFormat
        ? {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }
        : {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        };

    return new Date(dateString).toLocaleDateString('en-US', options);
};
