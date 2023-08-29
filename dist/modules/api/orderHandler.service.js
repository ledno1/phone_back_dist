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
exports.orderConsumer = void 0;
const bull_1 = require("@nestjs/bull");
const orderTop_service_1 = require("./top/orderTop.service");
const proxyChargingAPI_service_1 = require("./proxyChargingAPI.service");
const aLiPayHandler_service_1 = require("./subHandler/aLiPayHandler.service");
let orderConsumer = class orderConsumer {
    orderTopService;
    proxyChargingAPIService;
    aLiPayHandlerService;
    constructor(orderTopService, proxyChargingAPIService, aLiPayHandlerService) {
        this.orderTopService = orderTopService;
        this.proxyChargingAPIService = proxyChargingAPIService;
        this.aLiPayHandlerService = aLiPayHandlerService;
    }
    async transcode(job) {
        await this.orderTopService.orderOuTtime(job);
    }
    async phoneOrderOutTime(job) {
        await this.orderTopService.phoneOrderOuTTime(job);
    }
    async WXOrderOutTime(job) {
        await this.orderTopService.WXOrderOuTTime(job);
    }
    async proxyChargingReset(job) {
        await this.proxyChargingAPIService.proxyChargingReset(job);
    }
};
__decorate([
    (0, bull_1.Process)('orderOutTime'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], orderConsumer.prototype, "transcode", null);
__decorate([
    (0, bull_1.Process)('phoneOrderOutTime'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], orderConsumer.prototype, "phoneOrderOutTime", null);
__decorate([
    (0, bull_1.Process)('WXOrderOutTime'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], orderConsumer.prototype, "WXOrderOutTime", null);
__decorate([
    (0, bull_1.Process)('proxyChargingReset'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], orderConsumer.prototype, "proxyChargingReset", null);
orderConsumer = __decorate([
    (0, bull_1.Processor)('order'),
    __metadata("design:paramtypes", [orderTop_service_1.OrderTopService,
        proxyChargingAPI_service_1.ProxyChargingAPIService,
        aLiPayHandler_service_1.ALiPayHandlerService])
], orderConsumer);
exports.orderConsumer = orderConsumer;
//# sourceMappingURL=orderHandler.service.js.map