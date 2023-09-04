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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayCodeController = void 0;
const common_1 = require("@nestjs/common");
const paycode_service_1 = require("@/modules/PayCode/paycode.service");
let PayCodeController = class PayCodeController {
    payCodeService;
    constructor(payCodeService) {
        this.payCodeService = payCodeService;
    }
    onModuleInit() {
    }
};
PayCodeController = __decorate([
    (0, common_1.Controller)('PayCode'),
    __metadata("design:paramtypes", [typeof (_a = typeof paycode_service_1.PayCodeService !== "undefined" && paycode_service_1.PayCodeService) === "function" ? _a : Object])
], PayCodeController);
exports.PayCodeController = PayCodeController;
//# sourceMappingURL=paycode.controller.js.map