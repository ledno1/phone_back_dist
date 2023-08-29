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
exports.AddTopUser = exports.PageQuery = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class PageQuery {
    page;
    limit;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: "页码", example: 1 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: "页码必须是整数" }),
    __metadata("design:type", Number)
], PageQuery.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "每页数量", example: 10 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)({ message: "每页数量必须是整数" }),
    __metadata("design:type", Number)
], PageQuery.prototype, "limit", void 0);
exports.PageQuery = PageQuery;
class AddTopUser {
    username;
    password;
    nickName;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: '用户名最少6位' }),
    (0, class_validator_1.MaxLength)(20, { message: '用户名最多20位' }),
    __metadata("design:type", String)
], AddTopUser.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: '密码最少6位' }),
    (0, class_validator_1.MaxLength)(20, { message: '密码最多20位' }),
    __metadata("design:type", String)
], AddTopUser.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2, { message: '昵称最少2位' }),
    (0, class_validator_1.MaxLength)(20, { message: '昵称最多20位' }),
    __metadata("design:type", String)
], AddTopUser.prototype, "nickName", void 0);
exports.AddTopUser = AddTopUser;
//# sourceMappingURL=interfaceClass.js.map