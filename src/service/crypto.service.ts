import sha256 from 'crypto-js/sha256';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import Base64 from 'crypto-js/enc-base64';
import { v4 as uuidv4 }  from 'uuid';

// const hashDigest = sha256(nonce + message);
// const hmacDigest = Base64.stringify(hmacSHA512(path + hashDigest, privateKey));

export class CryptoService {
  private _privateKey: string;

  constructor() {
    this._privateKey = 'crypto-service';
  }

  static generateSecret(requestId?: string) {
    // Generate a GUID and encode using base64
    const guid = Buffer.from(uuidv4()).toString('base64');
    return guid;
  }

  static decrypt(inputData: any, sharedSecretKey?: string) {

    return inputData;
  }
}