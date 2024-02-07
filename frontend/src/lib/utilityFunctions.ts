import { TOKEN_EXPIRY, UTIL_FUNCTIONS } from './constants';
import { IRating, IRatingAggregateSummary, IRatingValueBreakdown } from './types/data/rating.type';
import { IFeedbackRating, IFeedbackRatingScaleAggregateSummary, IFeedbackRatingYesNoAggregateSummary } from './types/data/feedbackRating.type';
import { IUser } from './types/data/user.type';
import { IFetchError } from './types/types';

/**
 * Stringifies given Object and stores it in local storage using the 
 * localStorageKey param.
 * 
 * @param localStorageKey The key that will be stored in Local storage to access data
 * @param obj A Javascript object that will be stringified
 */
export const storeObjectInLocalStorage = (localStorageKey: string, obj: Object): void => {
    const stringifiedObj = JSON.stringify(obj);
    localStorage.setItem(localStorageKey, stringifiedObj);
};

/**
 * A utility function that stores a given user object and token in local storage
 * @param token A valid token retrieved from register or login and stored in memory
 * @param user A user object that will be stored in memory
 */
export const storeUserAndTokenInLocalStorage = (token: string, user: IUser): void => {
    storeObjectInLocalStorage('logged-user', user);
    localStorage.setItem('token', token);
};


/**
 * Stores the token expiry time in localstorage to compare defaults to TOKEN_EXPIRY
 * @param minutesOffset The number of minutes it takes for the token to expire from the current time
 */
export const storeTokenExpiryInLocalStorage = (minutesOffset: number = TOKEN_EXPIRY) => {
    const tokenExpiry = new Date();
    tokenExpiry.setMinutes( tokenExpiry.getMinutes() + minutesOffset );
    localStorage.setItem('token-expiry', tokenExpiry.toISOString());
};

export const retrieveStoredTokenExpiryInLocalStorage = (): Date | null => {
    const retrievedDateString = localStorage.getItem('token-expiry');
    if (!retrievedDateString) {
        return null;
    }

    return new Date(retrievedDateString);
};

/**
 * Clears local storage of any set variables effectively logging user out. 
 */
export const wipeLocalStorage = () => {
    localStorage.clear();
};

/**
 * Capitalize the first letter of a string.
 * @param s A string to capitalize
 * @returns A new string with the first character capitalized
 */
export const capitalizeString = (s: string) => {
    if (s === null || s === undefined) {
        return s;
    }
    return s.charAt(0).toUpperCase() + s.slice(1);
};

// Capitalize the first letter of string on each word
export const capitalizeFirstLetterEachWord = (str: string) => {
    if (!str) {  
        return ''; 
    }
    let s = str.split(' ');
	
    for (var i = 0, x = s.length; i < x; i++) {
        s[i] = s[i][0].toUpperCase() + s[i].substr(1);
    }

    return s.join(' ');
};

/**
 * Error handling function that parses a potential Axios error that may be thrown when submitting 
 * new data.
 * 
 * @param genericMessage Fallback error message if no specific message is received from server
 * @param error An error object thrown that could be any
 * @returns {IFetchError} Error details
 */
export const handlePotentialAxiosError = (genericMessage: string, error: any): IFetchError => {
    let errorObj: IFetchError = {
        message: ''
    };
    if (error.response) {
        // Request made and server responded
        errorObj.message = error.response.data.message;
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
    } else if (error.request) {
        // The request was made but no response was received
        errorObj.message = 'Error no response received';
        console.log(error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        errorObj.message = error.message;
        console.log('Error', error.message);
    }

    if (!errorObj.message) {
        errorObj.message = genericMessage;
    }

    console.log(error);

    return errorObj;
};

// https://stackoverflow.com/questions/14980014/how-can-i-calculate-the-time-between-2-dates-in-typescript
/**
 * Calculates the difference between the dates and returns a string representation of the 
 * difference between them. 
 * 
 * @param current A Date object that will be the Minuend of the calculation.
 * @param previous A Date object that will be the subtrahend of the calculation.
 * @returns A simplified difference in time as a string.
 */
export const timeDifference = (current: Date, previous: Date): string => {
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current.getTime() - previous.getTime();

    if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + ' seconds ago';
    } else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    } else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    } else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago';
    } else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    } else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
};

/**
 * Truncates a string based on the amount of characters passed to it. Used to enforce 
 * sizing of tiles in application.
 * 
 * @param str A string that will be truncated
 * @param numberOfChars The number of characters that will be kept in the original string
 * @returns A new string that truncates the original
 */
export const truncateString = (
    str: string, 
    numberOfChars: number, 
    includeDots: boolean = true
): string => {
    let parsedString = str;

    if (str.length <= numberOfChars) {
        return parsedString;
    }

    parsedString = str.slice(0, numberOfChars);

    // Add '...' if true
    if (includeDots) {
        parsedString += '...';
    }

    return parsedString;
};

/**
 * Aggregates all Ratings
 * @param ratings 
 * @returns 
 */
export const getRatingAggregateSummary = (ratings: IRating[] | undefined): IRatingAggregateSummary => {
    const defaultRatingValueBreakdown = {
        strongDisagree: 0,
        slightDisagree: 0,
        neutral: 0,
        slightAgree: 0,
        strongAgree: 0,
    };

    if (!ratings) {
        return {
            negRatings: 0,
            posRatings: 0,
            ratingAvg: 0,
            ratingCount: 0,
            ratingValueBreakdown: defaultRatingValueBreakdown
        };
    }
    let ratingCount = 0;
    let negRatings = 0;
    let posRatings = 0;
    let ratingSum = 0;
    let ratingValueBreakdown: IRatingValueBreakdown = defaultRatingValueBreakdown;

    ratings.forEach(({ rating }) => {
        ratingCount++;
        ratingSum += rating;

        // Check ratings
        if (rating <= -2) { ratingValueBreakdown.strongDisagree++; } else;
        if (rating === -1) { ratingValueBreakdown.slightDisagree++; } else;
        if (rating === 0) { ratingValueBreakdown.neutral++; } else;
        if (rating === 1) { ratingValueBreakdown.slightAgree++; } else;
        if (rating >= 2) { ratingValueBreakdown.strongAgree++; } else;

        if (rating < 0) negRatings++;
        if (0 < rating) posRatings++;
    });

    return {
        negRatings,
        posRatings,
        ratingCount,
        ratingAvg: ratingCount ? ratingSum / ratingCount : 0,
        ratingValueBreakdown,
    };
};

export const checkIfUserHasRated = (ratings: IRating[] | IFeedbackRating[] | undefined, userId: string | undefined): boolean => {
    let flag = false;
    if (!ratings || !userId) return flag;

    ratings.forEach(({ authorId }) => {
        if (authorId === userId) {
            flag = true;
        }
    });

    return flag;
};

export const findUserRatingSubmission = (
    ratings?: IRating[], 
    userId?: string
): number | null => {
    if (!ratings || !userId) {
        return null;
    }

    let foundRating = ratings.find(rating => rating.authorId === userId);
    return foundRating ? foundRating.rating : null;
};

export const delay = (
    milliseconds: number = UTIL_FUNCTIONS.delayDefault
): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const refactorStateArray = (stateArray: any, index: number, newVal: any, stateSetter: any) => {
    let newArr = [...stateArray];
    newArr[index] = newVal;
    console.log(stateArray);
    stateSetter(newArr);
};

/**
 * Remove all duplicated values for a given array
 * @param arr array
 */
export const getDuplicatesRemoved = (arr: any[]) => {

    const unique = arr.filter((element, index, self) => {
        return index === self.indexOf(element);
    });
    return unique;
};

export const findUserFeedbackRatingSubmission = (
    feedbackRatings?: IFeedbackRating[],
    userId?: string
): number | null => {
    if (!feedbackRatings || !userId) {
        return null;
    }

    let foundRating = feedbackRatings.find(rating => rating.authorId === userId);
    return foundRating ? foundRating.rating : null;
};

export const getFeedbackRatingYesNoAggregateSummary = (feedbackRatings: IFeedbackRating[] | undefined): IFeedbackRatingYesNoAggregateSummary => {
    if (!feedbackRatings) {
        return {
            noRatings: 0,
            yesRatings: 0,
        };
    }
    let noRatings = 0;
    let yesRatings = 0;

    feedbackRatings.forEach(({ rating }) => {

        if (rating === 2) noRatings++;
        if (rating === 1) yesRatings++;
    });

    return {
        noRatings,
        yesRatings,
    };
};

export const getFeedbackRatingScaleAggregateSummary = (feedbackRatings: IFeedbackRating[] | undefined): IFeedbackRatingScaleAggregateSummary => {

    if (!feedbackRatings) {
        return {
            ratingAvg: 0,
        };
    }
    let ratingCount = 0;
    let ratingAvg = 0;

    feedbackRatings.forEach(({ rating }) => {
        ratingCount++;
        ratingAvg += rating;
    });

    return {
        ratingAvg: ratingCount ? ratingAvg / ratingCount : 0,
    };
};