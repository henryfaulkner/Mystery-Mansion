export default interface IApiResponse<T = any> {
  statusCode: number; 
  message: string;
  isSuccessful: boolean;
  data: T;
  exception: object;
  uiErrorsMsgs: string[]; // UI-friendly error messages
}