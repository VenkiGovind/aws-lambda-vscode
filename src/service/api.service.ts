
export class ApiService {

  //Validate Bank Info
  static async validateTAVS(bankInfo: any) {
    await this.delay(1000);
    return Object.assign({}, bankInfo, {
      TRANTYPE: "TAVS",
      APPROVALCODE: 5555,
      TRANS: {
        BANKNAME: "Band of America NC.",
        BANKLOC: "New York City, NY"
      },
      VAIDTTYPE: {
        VALIDATIONRESULT: "SUCCESS",
      }
    }); 
  }

  static async submitPaymentTCAUTH(bankInfo: any) {
    await this.delay(1000);
    return {
      TRANTYPE: "TCAUTH",
      APPROVALCODE: 7777,
      TRANS: {
        STATUS: "SUCCESS",
        CODE: "TRN7676534536"
      }
    }; 
  }

  static async sendConfirmationIhub(ihubData: any) {
    await this.delay(1000);
    return ihubData;
  }
  private static delay(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}

