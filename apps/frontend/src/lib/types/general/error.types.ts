export interface IFetchError {
  message: string;
  details?: IFetchErrorDetails;
}

export interface IFetchErrorDetails {
  errorMessage: string;
  errorStack: string;
}

export type ApiError = {
  message: string;
};
