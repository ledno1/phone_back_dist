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
exports.PayCodeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../shared/services/redis.service");
const util_service_1 = require("../../shared/services/util.service");
const link_entity_1 = require("../../entities/resource/link.entity");
let PayCodeService = class PayCodeService {
    redisService;
    entityManager;
    util;
    constructor(redisService, entityManager, util) {
        this.redisService = redisService;
        this.entityManager = entityManager;
        this.util = util;
    }
    async onModuleInit() {
    }
    async createPayCodeByChannel(params, orderRedis) {
        let have = await this.entityManager.findOne(link_entity_1.Link, { where: { target: orderRedis.resource.target } });
        if (have) {
        }
        else {
        }
        console.log("createPayCodeByChannel 根据支付通道 产码");
    }
    createPayCodeByProduct() {
    }
};
PayCodeService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        typeorm_2.EntityManager,
        util_service_1.UtilService])
], PayCodeService);
exports.PayCodeService = PayCodeService;
//# sourceMappingURL=paycode.service.js.map