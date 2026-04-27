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
});

export const timeDifference = (current: Date, previous: Date): string => {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = current.getTime() - previous.getTime();

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
};

export const truncateString = (
  str: string,
  numberOfChars: number,
  includeDots: boolean = true,
): string => {
  let parsedString = str;

  if (str.length <= numberOfChars) {
    return parsedString;
  }

  parsedString = str.slice(0, numberOfChars);

  if (includeDots) {
    parsedString += "...";
  }

  return parsedString;
};

export const storeObjectInLocalStorage = (
  localStorageKey: string,
  obj: object,
): void => {
  const stringifiedObj = JSON.stringify(obj);
  localStorage.setItem(localStorageKey, stringifiedObj);
};

export const retrieveStoredTokenExpiryInLocalStorage = (): Date | null => {
  const retrievedDateString = localStorage.getItem("token-expiry");
  if (!retrievedDateString) {
    return null;
  }

  return new Date(retrievedDateString);
};
