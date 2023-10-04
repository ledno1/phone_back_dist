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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpBackListController = void 0;
const common_1 = require("@nestjs/common");
const admin_user_decorator_1 = require("../../admin/core/decorators/admin-user.decorator");
const ipBackList_service_1 = require("./ipBackList.service");
let IpBackListController = class IpBackListController {
    backIpService;
    constructor(backIpService) {
        this.backIpService = backIpService;
    }
    onModuleInit() {
    }
    findOne(query, user) {
        return this.backIpService.page(query, user);
    }
    add(body, user) {
        return this.backIpService.add(body, user);
    }
    edit(body, user) {
        return this.backIpService.edit(body, user);
    }
};
__decorate([
    (0, common_1.Get)('page'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, admin_user_decorator_1.AdminUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], IpBackListController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, admin_user_decorator_1.AdminUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], IpBackListController.prototype, "add", null);
__decorate([
    (0, common_1.Post)('edit'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, admin_user_decorator_1.AdminUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], IpBackListController.prototype, "edit", null);
IpBackListController = __decorate([
    (0, common_1.Controller)('/resource/ipbacklist'),
    __metadata("design:paramtypes", [ipBackList_service_1.IpBackListService])
], IpBackListController);
exports.IpBackListController = IpBackListController;
//# sourceMappingURL=ipBackList.controller.js.map