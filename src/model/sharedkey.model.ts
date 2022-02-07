import { OperationEnum, RequestStatusEnum } from "./constants";

export interface KeyItem {
  requestId: string,
  sharedKey: string,
  createdTs: number
}

export interface LambdaResponse {
  operation: OperationEnum,
  status: RequestStatusEnum,
  item: any
}

export interface ErrorResponse {
  errorCode: string,
  errorMessage: string
}