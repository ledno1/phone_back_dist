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
exports.PayCodeProxyController = void 0;
const common_1 = require("@nestjs/common");
const proxy_service_1 = require("./proxy.service");
const keep_decorator_1 = require("../../../common/decorators/keep.decorator");
const authorize_decorator_1 = require("../../admin/core/decorators/authorize.decorator");
let PayCodeProxyController = class PayCodeProxyController {
    proxyService;
    constructor(proxyService) {
        this.proxyService = proxyService;
    }
    onModuleInit() {
    }
    async payCheck(body) {
        return this.proxyService.test();
    }
};
__decorate([
    (0, keep_decorator_1.Keep)(),
    (0, authorize_decorator_1.Authorize)(),
    (0, common_1.Post)("/test"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayCodeProxyController.prototype, "payCheck", null);
PayCodeProxyController = __decorate([
    (0, common_1.Controller)('/code/proxy'),
    __metadata("design:paramtypes", [proxy_service_1.PayCodeProxyService])
], PayCodeProxyController);
exports.PayCodeProxyController = PayCodeProxyController;
//# sourceMappingURL=proxy.controller.js.map