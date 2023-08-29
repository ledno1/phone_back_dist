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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDetailInfo = exports.PageSearchUserInfo = exports.AccountInfo = void 0;
const swagger_1 = require("@nestjs/swagger");
const sys_user_entity_1 = __importDefault(require("../../../../entities/admin/sys-user.entity"));
class AccountInfo {
    name;
    nickName;
    email;
    phone;
    remark;
    headImg;
    loginIp;
    roleLabel;
    lv;
    uuid;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AccountInfo.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AccountInfo.prototype, "nickName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AccountInfo.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AccountInfo.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AccountInfo.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AccountInfo.prototype, "headImg", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AccountInfo.prototype, "loginIp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AccountInfo.prototype, "roleLabel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], AccountInfo.prototype, "lv", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], AccountInfo.prototype, "uuid", void 0);
exports.AccountInfo = AccountInfo;
class PageSearchUserInfo {
    createdAt;
    departmentId;
    email;
    headImg;
    id;
    name;
    nickName;
    phone;
    remark;
    status;
    updatedAt;
    username;
    departmentName;
    roleNames;
}
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PageSearchUserInfo.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PageSearchUserInfo.prototype, "departmentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PageSearchUserInfo.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PageSearchUserInfo.prototype, "headImg", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PageSearchUserInfo.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PageSearchUserInfo.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PageSearchUserInfo.prototype, "nickName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PageSearchUserInfo.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PageSearchUserInfo.prototype, "remark", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PageSearchUserInfo.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PageSearchUserInfo.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PageSearchUserInfo.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PageSearchUserInfo.prototype, "departmentName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Array)
], PageSearchUserInfo.prototype, "roleNames", void 0);
exports.PageSearchUserInfo = PageSearchUserInfo;
class UserDetailInfo extends sys_user_entity_1.default {
    roles;
    departmentName;
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '关联角色',
    }),
    __metadata("design:type", Array)
], UserDetailInfo.prototype, "roles", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: '关联部门名称',
    }),
    __metadata("design:type", String)
], UserDetailInfo.prototype, "departmentName", void 0);
exports.UserDetailInfo = UserDetailInfo;
//# sourceMappingURL=user.class.js.map