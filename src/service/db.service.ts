import * as AWS from "aws-sdk";
import { ExceptionType, OperationEnum, RequestStatusEnum } from "../model/constants";
import { KeyItem, ErrorResponse, LambdaResponse } from "../model/sharedkey.model";
import * as utils from "../util.functions";
import { CryptoService } from "./crypto.service";

AWS.config.update({ region: 'us-east-1' });

export class DBConnect {

  private _dynamodb: AWS.DynamoDB.DocumentClient; //
  //= new AWS.DynamoDB.DocumentClient();
  private _dynamodbTableName: string;

  constructor() {
    this._dynamodb = new AWS.DynamoDB.DocumentClient();
    this._dynamodbTableName = 'shs-bp-lamda-sharedkey';
  }

  /**
   * This will generate a time bound shared secret key that is used to encrypt/decrypt secure data between SPA and server.
   * It will then store the key for 15 minutes in DynamoDB. A cron job will clean up expired keys.
   * @param requestBody 
   * @returns 
   */
  async generateSharedKey(requestId: string): Promise<LambdaResponse | ErrorResponse> {
    let item: KeyItem = {
      requestId: requestId,
      sharedKey: CryptoService.generateSecret(requestId),
      createdTs: utils.getUnixTimeStamp()
    }
    const params = {
      TableName: this._dynamodbTableName,
      Item: item
    }
    try {
      return await this._dynamodb.put(params).promise().then(() => {
        const body: LambdaResponse = {
          operation: OperationEnum.save,
          status: RequestStatusEnum.success,
          item: item
        }
        return body;
      }, (error) => {
        console.error(`Error occured: ${ExceptionType.sharedkeyGenerationException}: `, error);
        return {
          errorCode: ExceptionType.sharedkeyGenerationException,
          errorMessage: error.message
        };
      })
    } catch (ex) {
      console.error('Error occured: ', ex.meesage);
      return {
        errorCode: ExceptionType.sharedkeyGenerationException,
        errorMessage: 'Error occured - Please try again later.'
      };
    }

  }

  //get item by requestId
  async getSharedKey(requestId: string) {
    let params = {
      TableName: this._dynamodbTableName,
      Key: {
        "requestId": requestId
      }
    };
    const data = await this._dynamodb.get(params).promise();
    // const resp: LambdaResponse = {
    //   operation: OperationEnum.save,
    //   status: RequestStatusEnum.success,
    //   item: data
    // }
    return data; 
  }

}

