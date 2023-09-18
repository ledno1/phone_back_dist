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
exports.TGBotService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const param_config_service_1 = require("../../admin/system/param-config/param-config.service");
const param_config_dto_1 = require("../../admin/system/param-config/param-config.dto");
let TGBotService = class TGBotService {
    redisService;
    entityManager;
    util;
    paramConfigService;
    constructor(redisService, entityManager, util, paramConfigService) {
        this.redisService = redisService;
        this.entityManager = entityManager;
        this.util = util;
        this.paramConfigService = paramConfigService;
    }
    tgToken;
    bot;
    async onModuleInit() {
        this.tgToken = await this.paramConfigService.findValueByKey('TGToken');
        if (!this.tgToken || this.tgToken == '0') {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "TGToken";
            t.key = `TGToken`;
            t.value = '0';
            t.remark = "TGToken";
            await this.paramConfigService.add(t);
            throw new Error('tg机器人未设置token');
        }
    }
};
TGBotService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        typeorm_2.EntityManager,
        util_service_1.UtilService,
        param_config_service_1.SysParamConfigService])
], TGBotService);
exports.TGBotService = TGBotService;
//# sourceMappingURL=tg.service.js.map