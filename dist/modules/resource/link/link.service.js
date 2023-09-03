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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const link_entity_1 = require("../../../entities/resource/link.entity");
const sys_user_entity_1 = __importDefault(require("../../../entities/admin/sys-user.entity"));
const api_exception_1 = require("../../../common/exceptions/api.exception");
const zh_service_1 = require("../zh/zh.service");
const zh_entity_1 = require("../../../entities/resource/zh.entity");
const channel_entity_1 = require("../../../entities/resource/channel.entity");
const channel_service_1 = require("../channel/channel.service");
const param_config_service_1 = require("../../admin/system/param-config/param-config.service");
let LinkService = class LinkService {
    linkRepository;
    userRepository;
    zhRepository;
    paramConfigService;
    redisService;
    zhService;
    channelService;
    util;
    constructor(linkRepository, userRepository, zhRepository, paramConfigService, redisService, zhService, channelService, util) {
        this.linkRepository = linkRepository;
        this.userRepository = userRepository;
        this.zhRepository = zhRepository;
        this.paramConfigService = paramConfigService;
        this.redisService = redisService;
        this.zhService = zhService;
        this.channelService = channelService;
        this.util = util;
    }
    async page(params, user) {
        let { page, limit, paymentStatus, reuse, channelName, amount, action, username, oid, outTime, gOid } = params;
        let qb = null;
        if (action == "amountType") {
            let amountList = await this.linkRepository.createQueryBuilder("link")
                .leftJoin("link.SysUser", "SysUser")
                .select("link.amount")
                .where(user.roleLabel == "admin" ? "1=1" : "SysUser.id = :id", { id: user.id })
                .groupBy("link.amount")
                .getMany();
            return amountList;
        }
        else {
            outTime = outTime == "true" ? true : false;
            qb = await this.linkRepository.createQueryBuilder("link")
                .innerJoin("channel", "channel", "channel.id = link.channel")
                .select([
                "link.lUid AS lUid", "link.amount AS amount", "link.gOid AS gOid", "link.target AS target", "link.createStatus  AS createStatus", "link.paymentStatus AS paymentStatus",
                "link.created_at AS createdAt",
                "channel.name AS channelName"
            ])
                .where(user.roleLabel == "admin" ? "1=1" : "SysUser.id = :id", { id: user.id })
                .andWhere(paymentStatus ? "link.paymentStatus = :paymentStatus" : "1=1", { paymentStatus: paymentStatus })
                .andWhere(reuse ? "link.reuse = :reuse" : "1=1", { reuse: reuse == "true" ? true : false })
                .andWhere(channelName ? "link.channel = :channel" : "1=1", { channel: channelName })
                .andWhere(amount ? "link.amount = :amount" : "1=1", { amount: amount })
                .andWhere(oid ? "link.gOid = :gOid" : "1=1", { gOid: gOid })
                .orderBy("link.created_at", "DESC")
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
    }
    async add(params, user) {
        let { pay_link, amount, oid, zuid, channel } = params;
        let u = await this.userRepository.createQueryBuilder("user")
            .where("user.id = :id", { id: user.id })
            .getOne();
        if (!u)
            throw new api_exception_1.ApiException(10017);
        let z = await this.zhService.getInstantiationByZuid(zuid, user.id);
        if (!z)
            throw new api_exception_1.ApiException(40003);
        let channelInfo = await this.channelService.getChannelInfo(Number(channel));
        if (!channelInfo)
            throw new api_exception_1.ApiException(40004);
        let link = new link_entity_1.Link();
        let buff = Buffer.from(pay_link, "base64");
        const url = buff.toString("utf-8");
        link.zh = z;
        link.SysUser = u;
        link.amount = amount;
        link.oid = oid;
        link.url = url;
        link.channel = channel;
        link.reuse = z.reuse;
        link.parentChannel = channelInfo.parentId;
        await this.linkRepository.save(link);
    }
    async edit(params, user) {
        let { action, oid, reuse, ids } = params;
        console.log(params);
        switch (action) {
            case "all":
                await this.linkRepository.createQueryBuilder("link")
                    .leftJoin("link.SysUser", "SysUser")
                    .delete()
                    .where("SysUser.id = :id", { id: user.id })
                    .execute();
                break;
            case "del":
                await this.linkRepository.createQueryBuilder("link")
                    .leftJoin("link.SysUser", "SysUser")
                    .delete()
                    .where(user.roleLabel == "admin" ? "1=1" : "SysUser.id = :id", { id: user.id })
                    .andWhere(oid ? "link.oid = :oid" : "1=1", { oid: oid })
                    .andWhere(ids ? "link.oid in (:...ids)" : "1=1", { ids: ids })
                    .execute();
                break;
            case "reuse":
                await this.linkRepository.createQueryBuilder("link")
                    .leftJoin("link.SysUser", "SysUser")
                    .update()
                    .set({ reuse: reuse })
                    .where(user.roleLabel == "admin" ? "1=1" : "SysUser.id = :id", { id: user.id })
                    .andWhere("link.oid = :oid", { oid: oid })
                    .execute();
                if (reuse) {
                    let link = await this.linkRepository.createQueryBuilder("link")
                        .leftJoin("link.SysUser", "SysUser")
                        .where(user.roleLabel == "admin" ? "1=1" : "SysUser.id = :id", { id: user.id })
                        .andWhere("link.oid = :oid", { oid: oid })
                        .getOne();
                    if (link.paymentStatus == 2)
                        throw new api_exception_1.ApiException(40005);
                    await this.linkRepository.createQueryBuilder("link")
                        .leftJoin("link.SysUser", "SysUser")
                        .update()
                        .set({
                        createStatus: 1,
                        paymentStatus: 0,
                        createdAt: new Date()
                    })
                        .where(user.roleLabel == "admin" ? "1=1" : "SysUser.id = :id", { id: user.id })
                        .andWhere("link.oid = :oid", { oid: oid })
                        .execute();
                }
                break;
            case "open":
            case "close":
                await this.linkRepository.createQueryBuilder("link")
                    .leftJoin("link.SysUser", "SysUser")
                    .update()
                    .set({ reuse: action == "open" ? true : false })
                    .where(user.roleLabel == "admin" ? "1=1" : "SysUser.id = :id", { id: user.id })
                    .andWhere("link.oid in (:...ids)", { ids: ids })
                    .execute();
                break;
            case "copy":
                let qb = await this.linkRepository.createQueryBuilder("link")
                    .where("link.oid = :oid", { oid: oid })
                    .andWhere(user.roleLabel == "admin" ? "1=1" : "SysUser.id = :id", { id: user.id })
                    .getOne();
                console.log(qb);
                return qb.url;
                break;
        }
    }
    async getLinkType() {
        let link_timeout = await this.paramConfigService.findValueByKey("link_timeout");
        let linkTypeList = await this.linkRepository.createQueryBuilder("link")
            .leftJoin(channel_entity_1.Channel, "channel", "link.channel = channel.id")
            .select("link.amount AS amount")
            .where("link.paymentStatus = 0")
            .andWhere("link.createStatus = 1")
            .andWhere(" UNIX_TIMESTAMP(now()) < round(UNIX_TIMESTAMP(link.created_at)+ channel.expireTime) ")
            .groupBy("link.amount");
        let t = await linkTypeList.getRawMany();
        let amountList = t.map((item) => {
            return item.amount.toString();
        });
        return amountList;
    }
    async getLinkByAmount(amount) {
        if (!amount)
            throw new api_exception_1.ApiException(60004);
        amount = Number(amount);
        if (isNaN(amount))
            throw new api_exception_1.ApiException(60004);
        let amountList = await this.redisService.getRedis().get("link:amountList");
        if (!amountList) {
            amountList = await this.getLinkType();
            console.log(amountList);
            if (amountList.length === 0)
                return false;
            await this.redisService.getRedis().set("link:amountList", JSON.stringify(amountList), "EX", 60);
        }
        else {
            amountList = JSON.parse(amountList);
        }
        if (amountList.includes((amount * 100).toString())) {
            return true;
        }
        return false;
    }
    async reSetLinkStatus(oid, status = 0) {
        await this.linkRepository.createQueryBuilder("link")
            .update()
            .set({
            paymentStatus: () => {
                return `case when reuse = 1  then  ${status}  else -1 end`;
            }
        })
            .where("link.oid = :oid", { oid: oid })
            .execute();
    }
    async setLinkStatus(oid, status = 0) {
        await this.linkRepository.createQueryBuilder("link")
            .update()
            .set({ paymentStatus: status })
            .where("link.oid = :oid", { oid: oid })
            .execute();
    }
    async setLinkCallback(oid) {
        await this.linkRepository.createQueryBuilder("link")
            .update()
            .set({
            paymentStatus: () => {
                return `case when paymentStatus = 1 or paymentStatus = 4 then 4 else 3 end`;
            }
        })
            .where("link.oid = :oid", { oid: oid })
            .execute();
    }
};
LinkService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(link_entity_1.Link)),
    __param(1, (0, typeorm_1.InjectRepository)(sys_user_entity_1.default)),
    __param(2, (0, typeorm_1.InjectRepository)(zh_entity_1.ZH)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        param_config_service_1.SysParamConfigService,
        redis_service_1.RedisService,
        zh_service_1.ZhService,
        channel_service_1.ChannelService,
        util_service_1.UtilService])
], LinkService);
exports.LinkService = LinkService;
//# sourceMappingURL=link.service.js.map