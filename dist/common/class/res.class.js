"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiOkResponsePaginated = exports.ApiOkResponseData = exports.ApiResponse = exports.PaginatedResponseDto = exports.Pagination = exports.ResponseDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
class ResponseDto {
    data;
    code;
    message;
    constructor(code, data, message = "success") {
        this.code = code;
        this.data = data;
        this.message = message;
    }
    static success(data) {
        return new ResponseDto(200, data);
    }
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ResponseDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ResponseDto.prototype, "message", void 0);
exports.ResponseDto = ResponseDto;
class Pagination {
    total;
    page;
    size;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], Pagination.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], Pagination.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], Pagination.prototype, "size", void 0);
exports.Pagination = Pagination;
class PaginatedResponseDto {
    list;
    pagination;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Pagination)
], PaginatedResponseDto.prototype, "pagination", void 0);
exports.PaginatedResponseDto = PaginatedResponseDto;
const ApiResponse = (dataDto, wrapperDataDto) => (0, common_1.applyDecorators)((0, swagger_1.ApiExtraModels)(wrapperDataDto, dataDto), (0, swagger_1.ApiOkResponse)({
    schema: {
        allOf: [
            { $ref: (0, swagger_1.getSchemaPath)(wrapperDataDto) },
            {
                properties: {
                    list: {
                        type: "array",
                        items: { $ref: (0, swagger_1.getSchemaPath)(dataDto) }
                    }
                }
            }
        ]
    }
}));
exports.ApiResponse = ApiResponse;
const ApiOkResponseData = (dataDto) => (0, exports.ApiResponse)(dataDto, ResponseDto);
exports.ApiOkResponseData = ApiOkResponseData;
const ApiOkResponsePaginated = (dataDto) => (0, exports.ApiResponse)(dataDto, PaginatedResponseDto);
exports.ApiOkResponsePaginated = ApiOkResponsePaginated;
//# sourceMappingURL=res.class.js.map