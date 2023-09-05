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
exports.ZhService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const zh_entity_1 = require("../../../entities/resource/zh.entity");
const sys_user_entity_1 = __importDefault(require("../../../entities/admin/sys-user.entity"));
const api_exception_1 = require("../../../common/exceptions/api.exception");
const top_entity_1 = require("../../../entities/order/top.entity");
const link_entity_1 = require("../../../entities/resource/link.entity");
const REQ = require("request-promise-native");
const fs = require("fs");
let ZhService = class ZhService {
    zhRepository;
    linkRepository;
    userRepository;
    entityManager;
    redisService;
    util;
    constructor(zhRepository, linkRepository, userRepository, entityManager, redisService, util) {
        this.zhRepository = zhRepository;
        this.linkRepository = linkRepository;
        this.userRepository = userRepository;
        this.entityManager = entityManager;
        this.redisService = redisService;
        this.util = util;
    }
    async page(params, user) {
        let { page, limit, zuid, accountNumber, open, username, action } = params;
        let qb = null;
        if (user.roleLabel != "admin") {
            switch (action) {
                case "cookie":
                    return await this.getCookieByZuid(zuid, user.id);
                    break;
                case "static":
                    return await this.getByPage(params, user.id);
                    break;
                case "createGroup":
                    return await this.getPageByGroup(params, user.id);
                    break;
                default:
                    return await this.getByPage(params, user.id);
            }
        }
        else {
            if (action == "createGroup")
                return await this.getPageByGroup(params, user.id);
            return await this.getByPage(params, user.id);
        }
    }
    async getPageByGroup(params, userid) {
        let qb = await this.zhRepository.createQueryBuilder("zh")
            .leftJoin("zh.SysUser", "user")
            .select(["zh.zuid", "zh.accountNumber"])
            .where("user.id = :id", { id: userid })
            .getMany();
        return qb;
    }
    async getPageByStatic(params, userid) {
        let { page, limit, zuid, accountNumber } = params;
        let qb = await this.zhRepository.createQueryBuilder("zh")
            .leftJoin("zh.link", "link")
            .leftJoin("zh.SysUser", "user")
            .select(["zh.id", "zh.accountNumber", "zh.balance", "zh.balanceLock", "zh.rechargeLimit", "zh.lockLimit", "zh.totalRecharge", "zh.open", "zh.zuid",
            "link.id", "link.amount"])
            .where("user.id = :id", { id: userid })
            .andWhere(zuid ? "zh.zuid = :zuid" : "1=1", { zuid })
            .andWhere(accountNumber ? "zh.accountNumber LIKE :accountNumber" : "1=1", { accountNumber: `%${accountNumber}%` })
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
    async getCookieByZuid(zuid, userid) {
        let qb = await this.zhRepository.createQueryBuilder("zh")
            .leftJoin("zh.SysUser", "user")
            .select("zh.cookie")
            .where("zh.zuid = :zuid", { zuid })
            .andWhere("user.id = :id", { id: userid })
            .getOne();
        return qb;
    }
    async getInstantiationByZuid(zuid, userid) {
        let qb = await this.zhRepository.createQueryBuilder("zh")
            .leftJoin("zh.SysUser", "user")
            .where(typeof zuid == "string" ? "zh.zuid = :zuid" : "1=1", { zuid })
            .andWhere(typeof zuid == "object" ? "zh.zuid IN (:...zuid)" : "1=1", { zuid })
            .andWhere("user.id = :id", { id: userid });
        console.log(await qb.getRawMany());
        if (typeof zuid == "string") {
            return await qb.getOne();
        }
        else {
            return await qb.getMany();
        }
    }
    async getByPage(params, userid) {
        let { page, limit, zuid, accountNumber, open, username, action, groupId } = params;
        let qb = await this.zhRepository.createQueryBuilder("zh")
            .leftJoin("zh.SysUser", "user")
            .leftJoin("zh.group", "group")
            .leftJoin((qb) => qb.select(["link.id as linkId", "link.amount as linkAmount", "link.zhId", "COUNT (link.id) as linkCount", "SUM(link.amount) as linkSum"])
            .from(link_entity_1.Link, "link")
            .leftJoin("channel", "channel", "channel.id = link.channel")
            .where("(link.paymentStatus = 0 OR link.paymentStatus = 2) ")
            .groupBy("link.zhId"), "link", "link.zhId = zh.id")
            .leftJoinAndSelect((qb) => qb
            .select(["top_order.id AS top_orderId", "top_order.amount as top_orderAmount", "top_order.zhId", "top_order.createdAt AS top_orderCreatedAt", "sum(amount) AS totalquota", "top_order.status AS top_orderStatus"])
            .from(top_entity_1.TopOrder, "top_order")
            .where("(top_order.status = 1 OR top_order.status = 4) AND top_order.createdAt >= DATE_FORMAT(DATE_SUB(NOW(),INTERVAL 48 HOUR),'%Y-%m-%d %H:%i:%s')")
            .groupBy("top_order.zhId"), "top_order", "top_order.zhId = zh.id")
            .select(["zh.id AS id ", "zh.weight as weight", "zh.accountNumber AS accountNumber", "zh.balance AS balance", "zh.balanceLock AS balanceLock", "zh.rechargeLimit AS rechargeLimit", "zh.lockLimit AS lockLimit", "zh.totalRecharge AS totalRecharge", "zh.open AS open", "zh.zuid AS zuid", "zh.reuse AS reuse"])
            .addSelect(["user.username as username"])
            .addSelect(["link.linkCount AS stockLink", "link.linkSum AS stockLinkAmount"])
            .addSelect([`SUM(DISTINCT CASE WHEN top_order.top_orderCreatedAt >= CURDATE() AND top_order.top_orderCreatedAt < NOW() AND top_order.top_orderStatus = 1 THEN top_order.totalquota ELSE 0 END) AS todaySale`])
            .addSelect([`SUM(DISTINCT CASE WHEN top_order.top_orderCreatedAt >= DATE_FORMAT(DATE_SUB(NOW(),INTERVAL 1 DAY),'%Y-%m-%d %H:%i:%s') AND top_order.top_orderCreatedAt < CURDATE() AND top_order.top_orderStatus = 1 THEN top_order.totalquota ELSE 0 END) AS yesterdaySale`])
            .where(userid != 1 ? "user.id = :id" : "1=1", { id: userid })
            .andWhere(zuid ? "zh.zuid = :zuid" : "1=1", { zuid })
            .andWhere(open ? "zh.open = :open" : "2=2", { open: open == "true" ? true : false })
            .andWhere(accountNumber ? "zh.accountNumber LIKE :accountNumber" : "3=3", { accountNumber: `%${accountNumber}%` })
            .groupBy("zh.id")
            .andWhere(groupId ? "group.id = :groupId" : "4=4", { groupId })
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
    async del(params, user) {
        let { ids, action } = params;
        if (action == "some") {
            await this.zhRepository.createQueryBuilder("zh")
                .leftJoinAndSelect("zh.SysUser", "user")
                .delete()
                .where("zh.id in (:...ids)", { ids })
                .andWhere(user.roleLabel == "admin" ? "1=1" : "user.id = :id", { id: user.id })
                .execute();
        }
        else if (action == "all") {
            await this.zhRepository.createQueryBuilder("zh")
                .leftJoinAndSelect("zh.SysUser", "user")
                .delete()
                .where("zh.id in (:...ids)", { ids })
                .andWhere("zh.sysUserId = :id", { id: user.id })
                .execute();
        }
    }
    async add(params, user) {
        console.log(params);
        let u = await this.userRepository.findOne({ where: { id: user.id } });
        let { qq, cookies, openid, openkey } = params;
        let zh = await this.zhRepository.findOne({ where: { accountNumber: qq } });
        if (zh) {
            zh.cookie = JSON.stringify(cookies);
            await this.zhRepository.save(zh);
        }
        else {
            let a = new zh_entity_1.ZH();
            a.accountNumber = qq;
            a.cookie = JSON.stringify(cookies);
            let uuid = this.util.generateUUID();
            a.zuid = "QQ-" + uuid;
            a.SysUser = u;
            a.openid = openid;
            a.openkey = openkey;
            await this.zhRepository.save(a);
        }
    }
    async addByFile(filePath, userinfo) {
        let u = await this.userRepository.findOne({ where: { id: userinfo.id } });
        let data = fs.readFileSync(filePath, "utf-8");
        let arr = null;
        arr = data.split("\r\n");
        console.log(arr[1]);
        console.log(arr[1].split("----"));
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == "" || arr[i].indexOf("----") == -1) {
                continue;
            }
            let accountInfo = arr[i].split("----");
            let uuid = this.util.generateUUID();
            if (accountInfo[1].indexOf("midas_txcz_openid") == -1 || accountInfo[1].indexOf("midas_txcz_openkey") == -1) {
                continue;
            }
            let openidArray = accountInfo[1].match(/midas_txcz_openid=([a-z,A-Z,0-9]+)/);
            let openid = null;
            if (openidArray.length > 1) {
                openid = openidArray[1];
            }
            else {
                continue;
            }
            let openkeyArray = accountInfo[1].match(/midas_txcz_openkey=([a-z,A-Z,0-9]+)/);
            let openkey = null;
            if (openkeyArray.length > 1) {
                openkey = openkeyArray[1];
            }
            else {
                continue;
            }
            await this.zhRepository.createQueryBuilder("zh")
                .insert()
                .values({
                accountNumber: accountInfo[0],
                cookie: accountInfo[1],
                zuid: "QQ-" + uuid,
                SysUser: u,
                openid,
                openkey
            })
                .orIgnore()
                .execute().catch(e => {
                console.error(e);
            });
        }
    }
    async getZhQueueById(id, amount) {
        let qb = await this.zhRepository.createQueryBuilder("zh")
            .leftJoin("zh.SysUser", "user")
            .select(["zh.zuid", "zh.accountNumber", "zh.id", "zh.weight"])
            .where("user.id = :id", { id })
            .andWhere("zh.open = :open", { open: true })
            .andWhere(`zh.lockLimit+${amount} <= zh.rechargeLimit`)
            .orderBy("zh.weight", "DESC")
            .getMany();
        return qb;
    }
    async updateLockLimitByZuid(zuid, amount) {
        try {
            let qb = await this.zhRepository.createQueryBuilder("zh")
                .update()
                .set({ lockLimit: () => `lockLimit-${amount}` })
                .where("zh.zuid = :zuid", { zuid })
                .execute();
        }
        catch (e) {
            common_1.Logger.error("更新账号锁定金额失败" + zuid);
        }
    }
    async edit(params, user) {
        let { action, ids, zuid, open, rechargeLimit, reuse } = params;
        console.log(params);
        try {
            if (action == "all") {
                let u = await this.userRepository.createQueryBuilder("user")
                    .leftJoinAndSelect("user.zh", "zh")
                    .where("user.id = :id", { id: user.id })
                    .getOne();
                await this.zhRepository.remove(u.zh);
                return;
            }
            if (ids) {
                let qb = await this.zhRepository.createQueryBuilder("zh")
                    .leftJoin("zh.SysUser", "user")
                    .andWhere(ids ? "zh.zuid in (:...ids)" : "1=1", { ids })
                    .andWhere(user.roleLabel == "admin" ? "1=1" : "user.id = :id", { id: user.id })
                    .getMany();
                if (action == "open") {
                    for (let i = 0; i < qb.length; i++) {
                        qb[i].open = true;
                        await this.zhRepository.save(qb[i]);
                    }
                }
                else if (action == "del") {
                    for (let i = 0; i < qb.length; i++) {
                        await this.linkRepository.createQueryBuilder("link")
                            .delete()
                            .where("link.zhId = :zhId", { zhId: qb[i].id })
                            .execute();
                        await this.zhRepository.remove(qb[i]);
                    }
                }
                else if (action == "upRechargeLimit") {
                    for (let i = 0; i < qb.length; i++) {
                        qb[i].rechargeLimit = Number(rechargeLimit) * 100;
                        await this.zhRepository.save(qb[i]);
                    }
                }
                else if (action == "close") {
                    for (let i = 0; i < qb.length; i++) {
                        qb[i].open = false;
                        await this.zhRepository.save(qb[i]);
                    }
                }
            }
            else {
                let z = await this.zhRepository.createQueryBuilder("zh")
                    .leftJoin("zh.SysUser", "user")
                    .where("zh.zuid = :zuid", { zuid })
                    .andWhere(user.roleLabel == "admin" ? "1=1" : "user.id = :id", { id: user.id })
                    .getOne();
                if (!z)
                    throw new api_exception_1.ApiException(10017);
                if (action == "open") {
                    z.open = open;
                    await this.zhRepository.save(z);
                }
                else if (action == "upRechargeLimit") {
                    z.rechargeLimit = Number(rechargeLimit) * 100;
                    await this.zhRepository.save(z);
                }
                else if (action == "del") {
                    await this.linkRepository.createQueryBuilder("link")
                        .delete()
                        .where("link.zhId = :zhId", { zhId: z.id })
                        .execute();
                    await this.zhRepository.remove(z);
                }
                else if (action == "reuse") {
                    z.reuse = reuse;
                    await this.zhRepository.save(z);
                }
                else if (action == "resetRechargeLimit") {
                    z.lockLimit = 0;
                    await this.zhRepository.save(z);
                }
                else if (action == "weight") {
                    z.weight = Number(params.weight) <= 0 ? 0 : Number(params.weight) > 100 ? 100 : Number(params.weight);
                    await this.zhRepository.save(z);
                }
            }
        }
        catch (e) {
            throw new api_exception_1.ApiException(40002);
        }
    }
    async updateZhClose(accountNumber) {
        try {
            await this.zhRepository.createQueryBuilder("zh")
                .update()
                .set({ open: false })
                .where("zh.accountNumber = :accountNumber", { accountNumber })
                .execute();
        }
        catch (e) {
            console.error("更新账号关闭接单失败" + accountNumber);
            common_1.Logger.error("更新账号关闭接单失败" + accountNumber);
        }
    }
    async checkHaveLOid(zh, loid) {
        let l = await this.redisService.getRedis().get(`translist:${zh.accountNumber}`);
        if (l) {
            let list = JSON.parse(l);
            console.log(`从缓存中获取到${zh.accountNumber}的交易列表${list.length}条`);
            for (let i = 0; i < list.length; i++) {
                if (list[i].SerialNo == loid) {
                    return true;
                }
            }
            return false;
        }
        let url = "https://api.unipay.qq.com/v1/r/1450000186/trade_record_query";
        const h = {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
        };
        let form = {
            CmdCode: "query2",
            SubCmdCode: "default",
            PageNum: "1",
            BeginUnixTime: "1635417724",
            EndUnixTime: parseInt((new Date().getTime() / 1000).toString()).toString(),
            PageSize: "1000",
            SystemType: "portal",
            pf: "__mds_default",
            pfkey: "pfkey",
            from_h5: "1",
            webversion: "MidasTradeRecord1.0",
            openid: zh.openid,
            openkey: zh.openkey,
            session_id: "openid",
            session_type: "kp_accesstoken"
        };
        let res = await REQ.post({ url: url, headers: h, form: form });
        try {
            let body = JSON.parse(res);
            if (res && body.msg === "ok") {
                console.log(`获取到${zh.accountNumber}的交易列表${body.WaterList.length}条`);
                let list = body.WaterList;
                await this.redisService.getRedis().set(`translist:${zh.accountNumber}`, JSON.stringify(list), "EX", 10);
                for (let i = 0; i < list.length; i++) {
                    if (list[i].SerialNo == loid) {
                        return true;
                    }
                }
                return false;
            }
            else {
                console.error(`${zh.accountNumber}   ===   获取交易列表失败 `);
                common_1.Logger.error(`${zh.accountNumber}   ===   获取交易列表失败 `);
                this.updateZhClose(zh.accountNumber);
            }
            if (res && body.msg === "登录校验失败") {
                console.error(`${zh.accountNumber}   ===   获取交易列表失败 `);
                common_1.Logger.error(`${zh.accountNumber}   ===   cookie 失效 `);
                this.updateZhClose(zh.accountNumber);
                return false;
            }
        }
        catch (error) {
            console.error(`获取交易列表出错${error}`);
            common_1.Logger.error(`获取交易列表出错${error}`);
        }
        return "";
    }
};
ZhService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(zh_entity_1.ZH)),
    __param(1, (0, typeorm_1.InjectRepository)(link_entity_1.Link)),
    __param(2, (0, typeorm_1.InjectRepository)(sys_user_entity_1.default)),
    __param(3, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.EntityManager,
        redis_service_1.RedisService,
        util_service_1.UtilService])
], ZhService);
exports.ZhService = ZhService;
//# sourceMappingURL=zh.service.js.map