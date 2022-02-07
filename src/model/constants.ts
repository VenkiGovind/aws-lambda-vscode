
export enum OperationEnum {
  save = 'SAVE',
  update = 'UPDATE',
  delete = 'DELETE',
  view = 'VIEW'
}

export enum RequestStatusEnum {
  success = 'SUCCESS',
  fail = 'FAIL'
}

/**
 * These are the possible errors that can occur
 */
export const ExceptionType = {
  sharedkeyGenerationException: 'ERR1001',
  tempusValidationException: 'ERR1002'
}