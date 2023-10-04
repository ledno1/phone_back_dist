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
exports.IpBackListService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const backip_entity_1 = require("../../../entities/resource/backip.entity");
const fingerprint_entity_1 = require("../../../entities/resource/fingerprint.entity");
let IpBackListService = class IpBackListService {
    backIPRepository;
    redisService;
    entityManager;
    util;
    constructor(backIPRepository, redisService, entityManager, util) {
        this.backIPRepository = backIPRepository;
        this.redisService = redisService;
        this.entityManager = entityManager;
        this.util = util;
    }
    async page(params, user) {
        let { page, limit, address } = params;
        let qb = await this.backIPRepository.createQueryBuilder("backIp")
            .where(address ? "address LIKE :address" : "1=1", { address: `%${address}%` })
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
    async edit(params, user) {
        let { action } = params;
        console.log(params);
        if (action == "del") {
            await this.backIPRepository.delete(params.data);
        }
        return 1;
    }
    async add(params, user) {
        let { data, action } = params;
        if (action == 'order') {
            let { ip, fingerprint } = data;
            let have = await this.backIPRepository.findOne({ where: { address: ip } });
            if (!have) {
                let t = new backip_entity_1.BackIP();
                t.address = ip;
                t.uid = user.uid;
                await this.backIPRepository.save(t);
            }
            let have2 = await this.entityManager.findOne(fingerprint_entity_1.Fingerprint, { where: { name: fingerprint } });
            if (!have2) {
                let t = new fingerprint_entity_1.Fingerprint();
                t.name = fingerprint;
                await this.entityManager.save(t);
            }
            return 1;
        }
        let dataList = data.split('\n');
        let inserData = [];
        const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        for (let i = 0; i < dataList.length; i++) {
            if (ipPattern.test(dataList[i])) {
                let have = await this.backIPRepository.findOne({ where: { address: dataList[i] } });
                if (!have) {
                    let t = new backip_entity_1.BackIP();
                    t.address = dataList[i];
                    t.uid = user.uid;
                    inserData.push(t);
                }
            }
        }
        await this.backIPRepository.save(inserData);
        return 1;
    }
};
IpBackListService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(backip_entity_1.BackIP)),
    __param(2, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService,
        typeorm_2.EntityManager,
        util_service_1.UtilService])
], IpBackListService);
exports.IpBackListService = IpBackListService;
//# sourceMappingURL=ipBackList.service.js.map