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
exports.PayCodeProductService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const product_entity_1 = require("../../../entities/paycode/product.entity");
let PayCodeProductService = class PayCodeProductService {
    redisService;
    entityManager;
    util;
    constructor(redisService, entityManager, util) {
        this.redisService = redisService;
        this.entityManager = entityManager;
        this.util = util;
    }
    onModuleInit() {
    }
    async page(params, user) {
        let { page, limit, action } = params;
        let qb = null;
        qb = await this.entityManager.createQueryBuilder(product_entity_1.PayCodeProduct, "product")
            .select()
            .offset((page - 1) * limit)
            .limit(limit);
        const [_, total] = await qb.getManyAndCount();
        let list = await qb.getMany();
        return {
            list,
            pagination: {
                total,
                page: Number(page),
                size: Number(limit)
            }
        };
    }
    add(body, user) {
        return null;
    }
    edit(body, user) {
        return null;
    }
    delete(body, user) {
        return null;
    }
};
PayCodeProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        typeorm_2.EntityManager,
        util_service_1.UtilService])
], PayCodeProductService);
exports.PayCodeProductService = PayCodeProductService;
//# sourceMappingURL=product.service.js.map