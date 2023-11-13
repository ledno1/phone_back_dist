import { Type } from "@nestjs/common";
import { ErrorCodeEnum } from "@/common/contants/error-code.contants";
export declare class ResponseDto<T> {
    readonly data: T;
    readonly code: number;
    readonly message: string;
    constructor(code: number | ErrorCodeEnum, data?: any, message?: string);
    static success(data?: any): ResponseDto<unknown>;
}
export declare class Pagination {
    total: number;
    page: number;
    size: number;
}
export declare class PaginatedResponseDto<T> {
    list: Array<T>;
    pagination: Pagination;
}
export declare const ApiResponse: <DataDto extends Type<unknown>, WrapperDataDto extends Type<unknown>>(dataDto: DataDto, wrapperDataDto: WrapperDataDto) => <TFunction extends Function, Y>(target: object | TFunction, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare const ApiOkResponseData: <DataDto extends Type<unknown>>(dataDto: DataDto) => <TFunction extends Function, Y>(target: object | TFunction, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
export declare const ApiOkResponsePaginated: <DataDto extends Type<unknown>>(dataDto: DataDto) => <TFunction extends Function, Y>(target: object | TFunction, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<Y>) => void;
