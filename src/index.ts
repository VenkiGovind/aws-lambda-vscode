import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { uniqueId } from "lodash";
import { LambdaResponse, ErrorResponse, ExceptionType } from "./model";
import { DBConnect } from "service/db.service";
import { CryptoService } from "service/crypto.service";
import { ApiService } from "service/api.service";

const validatePath = '/validate';
const reptknPath = '/reptkn';
const paybillPath = '/paybill';
const getKey = '/getkey';

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
  let response: APIGatewayProxyResult;
  const db = new DBConnect();
  let resp: LambdaResponse | ErrorResponse;
  switch (true) {
    case event.httpMethod === 'POST' && event.path === validatePath:
      // Validate the account details and if validated successfully then Call RepAddTkn and return a valid reptoken.
      // For this, an encryption shared key should be generated and passed to SPA.
      //Check if the sahred key is valid (it expires in 15 mins).
      if (!event.queryStringParameters && !event.queryStringParameters.requestId) {
        response = buildResponse(400, 'Bad Request');
        break;
      }
      //check if requestId (for sharedkey) exists and not expired:
      try {
        const data = await db.getSharedKey(event.queryStringParameters.requestId);
        if (data.Item && data.Item.sharedKey) {
          //now decrypt the bank info using the sharedKey:
          const bankInfo = JSON.parse(event.body);
          let _invoiceData = CryptoService.decrypt(bankInfo);

          //Call TAVS and validate Bank Info: mock using a async funtion:
          const tavsResp = await ApiService.validateTAVS(_invoiceData);
          if (tavsResp.APPROVALCODE == 5555) {
            //Assuming 5555 is validated successfully:
            //Call TCAUTH api
            const tcAuthData = Object.assign({}, _invoiceData, { amount: 6500 });  
            const tcauthResp = await ApiService.submitPaymentTCAUTH(tcAuthData);
            if (tcauthResp.APPROVALCODE == 7777) {
              //Now call IHub api an
              const iHubApiResp = await ApiService.sendConfirmationIhub(_invoiceData);

              if (!iHubApiResp) {
                response = buildResponse(200, 'IHub confirmation failed.');
              }
              response = buildResponse(201, tcauthResp );
              
            } else {
              response = buildResponse(200, 'Bank authorization failed.');
            }
          } else {
            response = buildResponse(200, 'Payment submission failed.');
          }          
        } 
        
      } catch (ex) {
        response = buildResponse(500, {
          errorCode: ExceptionType.sharedkeyGenerationException,
          errorMessage: 'Error occured - Please try again later.'
        });
      }
      break;
    case event.httpMethod === 'POST' && event.path === reptknPath:
      response = buildResponse(201, 'This will add account details and creates a REPTOKEN using REPO TCAUTH api.');
      break;
    case event.httpMethod === 'POST' && event.path === paybillPath:
      response = buildResponse(201, 'Payment successful.');
      break;
    case event.httpMethod === 'GET' && event.path === getKey:
      //Either pass requestId as part of queryStringParameters or uses the aws lambda requestid
      const requestId = context.awsRequestId;
      resp = await db.generateSharedKey(requestId);
      response = buildResponse(201, resp);
      break;
    default:
      response = buildResponse(404, '404 Not Found');
  }

  return response;

};

const buildResponse = (statusCode: number, payload: any): APIGatewayProxyResult => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(payload)
  }
}