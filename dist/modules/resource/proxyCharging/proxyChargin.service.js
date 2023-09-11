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
exports.ProxyChargingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const channel_entity_1 = require("../../../entities/resource/channel.entity");
const user_service_1 = require("../../admin/system/user/user.service");
const param_config_service_1 = require("../../admin/system/param-config/param-config.service");
const proxyChargin_entity_1 = require("../../../entities/resource/proxyChargin.entity");
const lodash_1 = require("lodash");
const api_exception_1 = require("../../../common/exceptions/api.exception");
const channel_service_1 = require("../channel/channel.service");
let ProxyChargingService = class ProxyChargingService {
    userService;
    channelRepository;
    entityManager;
    proxyChargingRepository;
    redisService;
    paramsConfig;
    channelService;
    util;
    DIANXINCHANNEL;
    LIANTONGCHANNEL;
    YIDONGCHANNEL;
    constructor(userService, channelRepository, entityManager, proxyChargingRepository, redisService, paramsConfig, channelService, util) {
        this.userService = userService;
        this.channelRepository = channelRepository;
        this.entityManager = entityManager;
        this.proxyChargingRepository = proxyChargingRepository;
        this.redisService = redisService;
        this.paramsConfig = paramsConfig;
        this.channelService = channelService;
        this.util = util;
    }
    async onModuleInit() {
        this.LIANTONGCHANNEL = await this.channelService.getChannelIdByName("联通");
        this.YIDONGCHANNEL = await this.channelService.getChannelIdByName("移动");
        this.DIANXINCHANNEL = await this.channelService.getChannelIdByName("电信");
    }
    async page(params, user) {
        let { page, limit, oid, lOid, accountNumber, amount, createdAt, channelName, callback, status, action } = params;
        if (action == "use") {
            let ls = await this.paramsConfig.findValueByKey("proxyChargingType");
            console.log(ls);
            if (ls) {
                console.log(ls.split(",").map((n) => ({ label: n, value: n })));
                return ls.split(",").map((n) => ({ label: n, value: n }));
            }
            else {
                throw new api_exception_1.ApiException(70001);
            }
        }
        amount ? amount = Number(amount) * 100 : 0;
        let qb = await this.proxyChargingRepository.createQueryBuilder("proxyCharging")
            .leftJoin("proxyCharging.SysUser", "user")
            .leftJoin("channel", "channel", "channel.id = proxyCharging.channel")
            .select([
            "proxyCharging.id AS id", "proxyCharging.target AS target", "proxyCharging.pid AS pid", "proxyCharging.mOid AS mOid", "proxyCharging.oid AS oid", "proxyCharging.amount AS amount",
            "proxyCharging.status AS status", "proxyCharging.callback AS callback", "proxyCharging.created_at AS createdAt", "proxyCharging.outTime AS outTime", "proxyCharging.pUid AS pUid",
            "proxyCharging.operator AS operator", "proxyCharging.weight AS weight", "proxyCharging.locking AS locking", "proxyCharging.isClose AS isClose"
        ])
            .addSelect("user.username AS pidName")
            .addSelect([
            "channel.name AS channelName"
        ])
            .where(user.roleLabel == "admin" ? "1=1" : "proxyCharging.sysUserId = :id", { id: user.id })
            .andWhere(oid ? "proxyCharging.oid = :oid" : "1=1", { oid })
            .andWhere(amount ? "proxyCharging.amount = :amount" : "1=1", { amount: !(0, lodash_1.isNaN)(amount) ? amount : null })
            .andWhere(createdAt ? "proxyCharging.created_at BETWEEN :createdStart AND :createdEnd" : "1=1", {
            createdStart: createdAt ? createdAt[0] : this.util.dayjsFormat(new Date()),
            createdEnd: createdAt ? createdAt[1] : this.util.dayjsFormat(new Date())
        })
            .andWhere(channelName ? "channel.id = :channelName" : "1=1", { channelName })
            .andWhere(callback ? "proxyCharging.callback = :callback" : "1=1", { callback: callback })
            .andWhere(status ? "proxyCharging.status = :status" : "1=1", { status })
            .orderBy("proxyCharging.created_at", "DESC")
            .offset((page - 1) * limit)
            .limit(limit);
        const [_, total] = await qb.getManyAndCount();
        let list = await qb.getRawMany();
        return {
            list,
            pagination: {
                total,
                page: Number(page),
                size: Number(limit)
            }
        };
    }
    async add(params, user) {
        let { phone, amount, channel, operator } = params;
        if (params.link) {
        }
        else {
            let channelInfo = await this.channelService.getChannelInfo(channel);
            await this.isProhibit(channelInfo.name, operator);
            let c = new proxyChargin_entity_1.ProxyCharging();
            c.parentChannel = channelInfo.parentId;
            c.pid = user.id;
            c.amount = Math.floor(Number(amount) * 100);
            c.channel = channel;
            c.target = phone;
            c.lRate = channelInfo.rate;
            c.outTime = this.util.dayjsFormat(new Date().getTime() + channelInfo.expireTime * 1000);
            c.SysUser = user;
            c.operator = operator;
            await this.proxyChargingRepository.save(c);
        }
        return "ok";
    }
    async isProhibit(name, operator) {
        let ls, redisKey, dbKey;
        if (name.includes("电信")) {
            redisKey = "huadan:prohibit:dianxin";
            dbKey = "dianxin_prohibit";
        }
        else if (name.includes("联通")) {
            redisKey = "huadan:prohibit:liantong";
            dbKey = "liantong_prohibit";
        }
        else if (name.includes("移动")) {
            redisKey = "huadan:prohibit:yidong";
            dbKey = "yidong_prohibit";
        }
        ls = await this.redisService.getRedis().get(redisKey);
        if (ls) {
            if (ls.indexOf(operator) > -1) {
                throw new api_exception_1.ApiException(70002);
            }
        }
        else {
            let ls2 = await this.paramsConfig.findValueByKey(dbKey);
            if (ls2) {
                await this.redisService.getRedis().set(redisKey, ls2, "EX", 60);
                if (ls2.indexOf(operator) > -1) {
                    throw new api_exception_1.ApiException(70002);
                }
            }
            else {
                throw new api_exception_1.ApiException(70001);
            }
        }
    }
    async edit(params, user) {
        let { action, ids, pUid } = params;
        if (pUid) {
            let obj = { pUid, pid: user.id };
            user.roleLabel == "admin" ? delete obj.pid : null;
            let proxyChargingInfo = await this.proxyChargingRepository.findOne({ where: obj });
            if (!proxyChargingInfo)
                return;
            switch (action) {
                case "urgent":
                    proxyChargingInfo.weight = proxyChargingInfo.weight == 100 ? 0 : 100;
                    break;
                case "close":
                    proxyChargingInfo.isClose = true;
                    break;
                case "lock":
                    proxyChargingInfo.locking = !proxyChargingInfo.locking;
                    break;
                case "success":
                    proxyChargingInfo.status = 1;
                    break;
                case "delete":
                    if (user.roleLabel == "admin") {
                        await this.proxyChargingRepository.delete(obj);
                    }
                    return "ok";
            }
            await this.proxyChargingRepository.save(proxyChargingInfo);
        }
        if (ids) {
            let obj = { pUid: (0, typeorm_2.In)(ids), pid: user.id };
            user.roleLabel == "admin" ? delete obj.pid : null;
            let proxyChargingInfo = await this.proxyChargingRepository.find({ where: obj });
            switch (action) {
                case "urgent":
                    proxyChargingInfo.forEach((n) => {
                        n.weight = n.weight == 100 ? 0 : 100;
                    });
                    break;
                case "close":
                    proxyChargingInfo.forEach((n) => {
                        n.isClose = true;
                    });
                    break;
                case "lock":
                    proxyChargingInfo.forEach((n) => {
                        n.locking = !n.locking;
                    });
                    break;
                case "success":
                    proxyChargingInfo.forEach((n) => {
                        n.status = 1;
                    });
                    break;
                case "delete":
                    if (user.roleLabel == "admin") {
                        await this.proxyChargingRepository.delete({ id: (0, typeorm_2.In)(ids) });
                    }
                    return "ok";
            }
            await this.proxyChargingRepository.save(proxyChargingInfo);
        }
        return "ok";
    }
    async setStatus(id, state) {
        try {
            await this.proxyChargingRepository.createQueryBuilder("proxyCharging")
                .update()
                .set({ status: state })
                .where("id = :id", { id })
                .execute();
        }
        catch (e) {
        }
    }
    async directBack(params) {
    }
    async directPush(params) {
        let { merId, orderId, channel, orderAmt, rechargeNumber, notifyUrl, weight } = params;
        try {
            let proxyCharging = new proxyChargin_entity_1.ProxyCharging();
            proxyCharging.channel = Number(channel);
            proxyCharging.target = rechargeNumber;
            proxyCharging.amount = Number(orderAmt) * 100;
            proxyCharging.mOid = orderId;
            proxyCharging.status = 0;
            proxyCharging.notifyUrl = notifyUrl;
            proxyCharging.pUid = this.util.generateUUID();
            proxyCharging.weight = Number(weight);
            await this.proxyChargingRepository.save(proxyCharging);
        }
        catch (e) {
        }
    }
};
ProxyChargingService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(channel_entity_1.Channel)),
    __param(2, (0, typeorm_1.InjectEntityManager)()),
    __param(3, (0, typeorm_1.InjectRepository)(proxyChargin_entity_1.ProxyCharging)),
    __metadata("design:paramtypes", [user_service_1.SysUserService,
        typeorm_2.Repository,
        typeorm_2.EntityManager,
        typeorm_2.Repository,
        redis_service_1.RedisService,
        param_config_service_1.SysParamConfigService,
        channel_service_1.ChannelService,
        util_service_1.UtilService])
], ProxyChargingService);
exports.ProxyChargingService = ProxyChargingService;
//# sourceMappingURL=proxyChargin.service.js.map