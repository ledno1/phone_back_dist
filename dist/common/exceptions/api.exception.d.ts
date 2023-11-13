import { HttpException } from '@nestjs/common';
import { ErrorCodeMapType } from '../contants/error-code.contants';
export declare class ApiException extends HttpException {
    private errorCode;
    constructor(errorCode: ErrorCodeMapType);
    getErrorCode(): ErrorCodeMapType;
}
