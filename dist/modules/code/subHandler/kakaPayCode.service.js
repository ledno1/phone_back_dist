"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KaKaPayCodeHandlerService = void 0;
const common_1 = require("@nestjs/common");
let KaKaPayCodeHandlerService = class KaKaPayCodeHandlerService {
    checkBalanceByPhoneAndOperator(phone, operator) {
        throw new Error("Method not implemented.");
    }
    isBlackPhone(orderRedis) {
        throw new Error("Method not implemented.");
    }
    onModuleInit() {
    }
    result(params, orderRedis) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }
    nameKey = '支付码';
    checkOrder(params, orderRedis) {
        return new Promise((resolve, reject) => {
            console.log('查单实现');
            resolve(true);
        });
    }
    checkBalance(orderRedis) {
        return Promise.resolve("");
    }
};
KaKaPayCodeHandlerService = __decorate([
    (0, common_1.Injectable)()
], KaKaPayCodeHandlerService);
exports.KaKaPayCodeHandlerService = KaKaPayCodeHandlerService;
//# sourceMappingURL=kakaPayCode.service.js.map