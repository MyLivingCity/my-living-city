export interface IFetchMeta {
	message?: string;
	loading: boolean;
	errors: null | IFetchError[];
}

export interface IFetchError {
	message: string;
	details?: IFetchErrorDetails;
}

export interface IFetchErrorDetails {
	errorMessage: string;
	errorStack: string;
}
