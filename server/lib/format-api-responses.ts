import IApiResponse from "../interfaces/api-response";
import { extractErrorDetails } from "./extract-error-details";

export function reqSuccess<T>(data: T): IApiResponse<T> {
    return {
        statusCode: 200,
        message: 'Request successful',
        isSuccessful: true,
        data,
        exception: {},  
        uiErrorsMsgs: [], 
      } as IApiResponse<T>;
}

export function reqServerError<T>(data: T, exception: any, uiErrorsMsgs: string[] = []): IApiResponse<T> {
    return {
        statusCode: 500,
        message: 'Request unsuccessful',
        isSuccessful: false,
        data,
        exception: extractErrorDetails(exception), 
        uiErrorsMsgs,
      } as IApiResponse<T>;
}

export function reqClientError<T>(data: T, uiErrorsMsgs: string[] = []): IApiResponse<T> {
    return {
        statusCode: 400,
        message: 'Request unsuccessful',
        isSuccessful: false,
        data,
        exception: {}, 
        uiErrorsMsgs, 
      } as IApiResponse<T>;
}