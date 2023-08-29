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
exports.TakeLinkService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const user_service_1 = require("../../admin/system/user/user.service");
const param_config_service_1 = require("../../admin/system/param-config/param-config.service");
const api_exception_1 = require("../../../common/exceptions/api.exception");
const takeLinkAPI_entity_1 = require("../../../entities/resource/takeLinkAPI.entity");
let TakeLinkService = class TakeLinkService {
    userService;
    takeLinkRepository;
    redisService;
    paramsConfig;
    util;
    constructor(userService, takeLinkRepository, redisService, paramsConfig, util) {
        this.userService = userService;
        this.takeLinkRepository = takeLinkRepository;
        this.redisService = redisService;
        this.paramsConfig = paramsConfig;
        this.util = util;
    }
    async page(params, user) {
        let { page, limit, action, name, isUse } = params;
        console.log(params);
        if (action == 'use') {
            let qb = await this.takeLinkRepository.createQueryBuilder("take_link")
                .select(['take_link.id', 'take_link.name'])
                .where("take_link.isUse = 1")
                .getMany();
            return qb;
        }
        else {
            let qb = await this.takeLinkRepository.createQueryBuilder("take_link")
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
    }
    async add(params, user) {
        console.log(params);
        let { name, url, isUse, weight, token } = params;
        let takeLink = new takeLinkAPI_entity_1.TakeLink();
        takeLink.name = name;
        takeLink.url = url;
        takeLink.isUse = isUse;
        takeLink.weight = weight;
        if (token && token.length > 0) {
            takeLink.token = token;
        }
        try {
            await this.takeLinkRepository.save(takeLink);
        }
        catch (e) {
            throw new api_exception_1.ApiException(80001);
        }
        return "ok";
    }
    async edit(params, user) {
        console.log(params);
        let { action, isUse, weight, id, url, name, token } = params;
        if (action == "isUse") {
            await this.takeLinkRepository.update(id, { isUse: isUse });
        }
        else if (action == "weight") {
            await this.takeLinkRepository.update(id, { weight: weight < 0 ? 0 : weight > 100 ? 100 : weight });
        }
        else if (action == 'edit') {
            await this.takeLinkRepository.update(id, { name: name, url: url, token: token ? token : null });
        }
        else if (action == "del") {
            await this.takeLinkRepository.delete(id);
        }
    }
    async getManyByIds(ids) {
        try {
            return await this.takeLinkRepository.createQueryBuilder("take_link")
                .where("take_link.id IN (:...ids)", { ids })
                .getMany();
        }
        catch (e) {
            common_1.Logger.error('getManyByIds', e.stack);
        }
    }
};
TakeLinkService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(takeLinkAPI_entity_1.TakeLink)),
    __metadata("design:paramtypes", [user_service_1.SysUserService,
        typeorm_2.Repository,
        redis_service_1.RedisService,
        param_config_service_1.SysParamConfigService,
        util_service_1.UtilService])
], TakeLinkService);
exports.TakeLinkService = TakeLinkService;
//# sourceMappingURL=takeLink.service.js.map