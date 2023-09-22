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
exports.ChannelService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const channel_entity_1 = require("../../../entities/resource/channel.entity");
const user_service_1 = require("../../admin/system/user/user.service");
const param_config_service_1 = require("../../admin/system/param-config/param-config.service");
const api_exception_1 = require("../../../common/exceptions/api.exception");
const takeLink_service_1 = require("../takeLink/takeLink.service");
let ChannelService = class ChannelService {
    userService;
    channelRepository;
    redisService;
    paramsConfig;
    takeLinkService;
    util;
    constructor(userService, channelRepository, redisService, paramsConfig, takeLinkService, util) {
        this.userService = userService;
        this.channelRepository = channelRepository;
        this.redisService = redisService;
        this.paramsConfig = paramsConfig;
        this.takeLinkService = takeLinkService;
        this.util = util;
    }
    async page(params, user) {
        let { page, limit, action } = params;
        if (action == "use") {
            return await this.channelRoot();
        }
        else if (action == "proxyCharging") {
            return await this.proxyChargingChannel();
        }
        else if (action == "list") {
            return await this.channelList(user);
        }
        else {
            let qb = null;
            if (user.roleLabel == "admin") {
                qb = await this.channelRepository.createQueryBuilder("channel")
                    .leftJoinAndSelect("channel.children", "children")
                    .where("channel.parent is null")
                    .andWhere("children.isPublic = 1")
                    .offset((page - 1) * limit)
                    .limit(limit);
            }
            else if (user.roleLabel == "proxy") {
                let isWhite = await this.paramsConfig.findValueByKey("whiteList");
                let isWhiteUser = false;
                if (isWhite) {
                    let whiteList = isWhite.split(",");
                    isWhiteUser = whiteList.includes(user.id.toString());
                }
                qb = await this.channelRepository.createQueryBuilder("channel")
                    .leftJoinAndSelect("channel.children", "children")
                    .where("channel.parent is null")
                    .andWhere(isWhiteUser ? "1=1" : "children.isPublic = 1")
                    .offset((page - 1) * limit)
                    .limit(limit);
            }
            else if (user.roleLabel == "top") {
                qb = await this.channelRepository.createQueryBuilder("channel")
                    .leftJoinAndSelect("channel.children", "children")
                    .where("channel.parent is null")
                    .andWhere("children.isPublic = 1")
                    .offset((page - 1) * limit)
                    .limit(limit);
            }
            let rateTotal = await this.userService.getParentsRate(user.id);
            const [_, total] = await qb.getManyAndCount();
            let list = await qb.getMany();
            list.forEach((item) => {
                if (item.children.length > 0) {
                    item.children.forEach((child) => {
                        child.rate = Number(child.rate) + Number(rateTotal);
                    });
                }
            });
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
        let { name, rate, parent_id } = params;
        let p = null;
        if (parent_id) {
            p = await this.channelRepository.findOne({ where: { id: parent_id } });
        }
        let channel = new channel_entity_1.Channel();
        channel.name = name;
        channel.rate = rate;
        channel.parent = p;
        await this.channelRepository.save(channel);
        return "ok";
    }
    async edit(params, user) {
        let { action, name, rate, id, data, amountType, productType } = params;
        let isPublic = null;
        if (data)
            isPublic = data.isPublic;
        if (action == "edit") {
            let channel = await this.channelRepository.createQueryBuilder("channel")
                .where("channel.id = :id", { id })
                .getOne();
            channel.rate = rate;
            channel.name = name;
            channel.amountType = amountType;
            channel.productType = productType && productType != '' ? productType.join(",") : null;
            try {
                await this.channelRepository.save(channel);
            }
            catch (e) {
                throw new api_exception_1.ApiException(80002);
            }
            await this.redisService.getRedis().del(`channel:${id}`);
        }
        else if (action == "del") {
            await this.channelRepository.delete(params.id);
            await this.redisService.getRedis().del(`channel:${id}`);
        }
        else if (action == "public") {
            return;
            await this.channelRepository.update(data.id, { isPublic });
        }
        else if (action == "isUse") {
            await this.channelRepository.update(data.id, { isUse: data.isUse });
            await this.redisService.getRedis().del(`channel:${id}`);
        }
        else if (action == "weight") {
            await this.channelRepository.update(data.id, { weight: data.weight });
        }
        else if (action == "strategy") {
            await this.channelRepository.update(data.id, { strategy: data.strategy });
        }
    }
    async proxyChargingChannel() {
        let id = await this.channelRepository.createQueryBuilder("channel")
            .andWhere("channel.name = '支付宝支付'")
            .getOne();
        console.log(id);
        let qb = await this.channelRepository.createQueryBuilder("channel")
            .select(["channel.id", "channel.name"])
            .where("channel.parentId = :id", { id: id.id })
            .andWhere("channel.isPublic = 1")
            .getMany();
        return qb;
    }
    async channelRoot() {
        let qb = await this.channelRepository.createQueryBuilder("channel")
            .where("channel.parent is null")
            .getMany();
        return qb;
    }
    async channelList(user) {
        let isWhite = await this.paramsConfig.findValueByKey("whiteList");
        let isWhiteUser = false;
        if (isWhite) {
            let whiteList = isWhite.split(",");
            isWhiteUser = whiteList.includes(user.id.toString());
        }
        let qb = await this.channelRepository.createQueryBuilder("channel")
            .select(["channel.id", "channel.name"])
            .where("channel.parent is not null")
            .andWhere(isWhiteUser ? "1=1" : "channel.isPublic = 1")
            .getMany();
        return qb;
    }
    async getSubChannel(rootChannelId, isUse = 1) {
        try {
            if (isUse !== 1) {
                let qb = await this.channelRepository.createQueryBuilder("channel")
                    .where("channel.parentId = :id", { id: rootChannelId })
                    .getMany();
                return qb;
            }
            let subChannelList = await this.redisService.getRedis().get(`channel:subChannelList:${rootChannelId}`);
            if (subChannelList) {
                return JSON.parse(subChannelList);
            }
            else {
                let qb = await this.channelRepository.createQueryBuilder("channel")
                    .where("channel.parentId = :id", { id: rootChannelId })
                    .andWhere("channel.isUse = 1")
                    .getMany();
                return qb;
            }
        }
        catch (e) {
            common_1.Logger.error("获取子通道失败", e);
        }
    }
    async getRateByChannelId(userId, id, uuid) {
        let rateTotal = await this.redisService.getRedis().get(`usersys:prxoy:${uuid}:ratetotal`);
        if (!rateTotal) {
            rateTotal = await this.userService.getParentsRate(userId);
            await this.redisService.getRedis().set(`usersys:proxy:${uuid}:ratetotal`, rateTotal, "EX", 60 * 60 * 24);
        }
        let channel = await this.getChannelInfo(id);
        if (channel) {
            return Number(channel.rate) + Number(rateTotal);
        }
    }
    async getChannelInfo(id) {
        let cache = await this.redisService.getRedis().get(`channel:${id}`);
        if (cache) {
            return JSON.parse(cache);
        }
        let qb = await this.channelRepository.createQueryBuilder("channel")
            .select(["channel.id AS id", "channel.strategy AS strategy", "channel.name AS name", "channel.rate AS rate", "channel.parentId AS parentId", "channel.isUse AS isUse", "channel.productType AS productType", "channel.amountType AS amountType"])
            .where("channel.id = :id", { id })
            .getRawOne();
        if (qb) {
            await this.redisService.getRedis().set(`channel:${id}`, JSON.stringify(qb), "EX", 60);
            return qb;
        }
        return null;
    }
    async getChannelIdByName(name) {
        let qb = await this.channelRepository.createQueryBuilder("channel")
            .select(["channel.id"])
            .where("channel.name LIKE :name", { name: `%${name}%` })
            .printSql()
            .getOne();
        if (qb) {
            return qb.id;
        }
        return null;
    }
    async getStrategyByChannelId(id) {
        try {
            let qb = await this.channelRepository.createQueryBuilder("channel")
                .where("channel.id = :id", { id })
                .getOne();
            return qb.strategy;
        }
        catch (e) {
            common_1.Logger.error("getStrategyByChannelId", e);
        }
    }
};
ChannelService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(channel_entity_1.Channel)),
    __metadata("design:paramtypes", [user_service_1.SysUserService,
        typeorm_2.Repository,
        redis_service_1.RedisService,
        param_config_service_1.SysParamConfigService,
        takeLink_service_1.TakeLinkService,
        util_service_1.UtilService])
], ChannelService);
exports.ChannelService = ChannelService;
//# sourceMappingURL=channel.service.js.map