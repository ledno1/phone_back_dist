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
exports.PayAccountService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const sys_user_entity_1 = __importDefault(require("../../../entities/admin/sys-user.entity"));
const api_exception_1 = require("../../../common/exceptions/api.exception");
const top_entity_1 = require("../../../entities/order/top.entity");
const REQ = require("request-promise-native");
const fs = require("fs");
const alipay_sdk_1 = __importDefault(require("alipay-sdk"));
const payaccount_entity_1 = require("../../../entities/resource/payaccount.entity");
let PayAccountService = class PayAccountService {
    payAccountRepository;
    userRepository;
    entityManager;
    redisService;
    util;
    revisionInfo = null;
    task_page_map = {};
    mainFrameUrl = `https://auth.alipay.com/login/homeB.htm?redirectType=https%3A%2F%2Fb.alipay.com%2Fpage%2Fhome`;
    constructor(payAccountRepository, userRepository, entityManager, redisService, util) {
        this.payAccountRepository = payAccountRepository;
        this.userRepository = userRepository;
        this.entityManager = entityManager;
        this.redisService = redisService;
        this.util = util;
    }
    async onModuleInit() {
    }
    async page(params, user) {
        let { page, limit, zuid, accountNumber, open, username, action } = params;
        let qb = null;
        if (user.roleLabel == "ma" || user.roleLabel == "admin") {
            return await this.getByPage(params, user.id);
        }
        return 1;
    }
    async getByPage(params, userid) {
        let { page, limit, zuid, name, open, username, action, groupId } = params;
        console.log("params", params);
        let qb = this.payAccountRepository.createQueryBuilder("pay_account")
            .leftJoin("pay_account.SysUser", "user")
            .leftJoinAndSelect((qb) => qb
            .select(["top_order.id AS top_orderId", "top_order.amount as top_orderAmount", "top_order.zhId", "top_order.createdAt AS top_orderCreatedAt", "sum(amount) AS totalquota", "top_order.status AS top_orderStatus"])
            .from(top_entity_1.TopOrder, "top_order")
            .where("(top_order.status = 1 OR top_order.status = 4) AND top_order.createdAt >= DATE_FORMAT(DATE_SUB(NOW(),INTERVAL 48 HOUR),'%Y-%m-%d %H:%i:%s')")
            .groupBy("top_order.zhId"), "top_order", "top_order.zhId = pay_account.id")
            .select(["pay_account.id AS id ", "pay_account.status AS status", "pay_account.uid AS uid", "pay_account.weight as weight", "pay_account.name AS name", "pay_account.rechargeLimit AS rechargeLimit", "pay_account.lockLimit AS lockLimit", "pay_account.totalRecharge AS totalRecharge", "pay_account.open AS open"])
            .addSelect(["user.username as username"])
            .addSelect([`SUM(DISTINCT CASE WHEN top_order.top_orderCreatedAt >= CURDATE() AND top_order.top_orderCreatedAt < NOW() AND top_order.top_orderStatus = 1 THEN top_order.totalquota ELSE 0 END) AS todaySale`])
            .addSelect([`SUM(DISTINCT CASE WHEN top_order.top_orderCreatedAt >= DATE_FORMAT(DATE_SUB(NOW(),INTERVAL 1 DAY),'%Y-%m-%d %H:%i:%s') AND top_order.top_orderCreatedAt < CURDATE() AND top_order.top_orderStatus = 1 THEN top_order.totalquota ELSE 0 END) AS yesterdaySale`])
            .where(userid != 1 ? "user.id = :id" : "1=1", { id: userid })
            .andWhere(open ? "pay_account.open = :open" : "2=2", { open: open == "true" ? true : false })
            .andWhere(name ? "pay_account.name LIKE :name" : "3=3", { name: `%${name}%` })
            .groupBy("pay_account.id")
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
        }
        else if (action == "all") {
        }
    }
    async add(params, user) {
        let { action } = params;
        if (action == "getQrCode") {
            try {
                let res = await this.util.requestGet("http://localhost:3005/api/create");
                let { code, image, id, task } = res;
                if (code == 1) {
                    return { image, id };
                }
            }
            catch (e) {
                console.error(e);
            }
        }
        else if (action == "close") {
            let { id } = params;
            let have = await this.payAccountRepository.findOne({ where: { _id: id } });
            if (id && !have) {
                let res = await this.util.requestGet(`http://localhost:3005/api/close/${id}`);
                let { code, tasks } = res;
                if (code == 1) {
                    return 1;
                }
            }
            return 0;
        }
        else if (action == "getQrCodeStatus") {
            let { id } = params;
            let res = await this.util.requestGet(`http://localhost:3005/api/status/${id}`);
            let { code, cookies, uid } = res;
            if (code == 1) {
                return {
                    cookies: Buffer.from(cookies).toString("base64"),
                    uid
                };
            }
            else if (code == 0) {
                return {
                    cookies: ""
                };
            }
        }
        else if (action == "add") {
            let u = await this.userRepository.findOne({ where: { id: user.id } });
            let { name, mark, cookies, uid, id, act } = params.data;
            if (act == 'update') {
                try {
                    let p = await this.payAccountRepository.findOne({ where: { uid } });
                    p.name = name;
                    p.mark = mark;
                    p.cookies = cookies;
                    p.uid = uid;
                    p.SysUser = u;
                    p.status = true;
                    p.open = true;
                    p._id = id;
                    await this.payAccountRepository.save(p);
                }
                catch (e) {
                    console.log(e);
                }
            }
            else {
                let p = new payaccount_entity_1.PayAccount();
                p.name = name;
                p.mark = mark;
                p.cookies = cookies;
                p.uid = uid;
                p.SysUser = u;
                p._id = id;
                await this.payAccountRepository.save(p);
            }
            return 1;
        }
    }
    async addAppid(params, user) {
        let { appId, privateKey, name, mark } = params;
        let u = await this.userRepository.findOne({ where: { id: user.id } });
        if (!u) {
            return;
        }
        try {
            let config = {
                appId,
                privateKey
            };
            if (process.env.NODE_ENV == "development") {
                config["gateway"] = "https://openapi-sandbox.alipaydev.com/gateway.do";
            }
            let alipaySdk = new alipay_sdk_1.default(config);
            const bizContent = {
                out_trade_no: "ALIPfdf1211sdfsd12gfddsgs3",
                product_code: "FAST_INSTANT_TRADE_PAY",
                subject: "100元充值",
                body: "234",
                total_amount: "100.00"
            };
            const result = alipaySdk.pageExec("alipay.trade.wap.pay", {
                method: "POST",
                bizContent,
                returnUrl: "https://www.taobao.com"
            });
        }
        catch (e) {
            console.log(e);
            console.error("支付宝账户接入失败");
            throw new api_exception_1.ApiException(40006);
        }
        console.log("录入数据库");
        return 1;
    }
    async addByFile(filePath, userinfo) {
    }
    async edit(params, user) {
        let { action, ids, id, open, rechargeLimit } = params;
        console.log(params);
        try {
            if (action == "all") {
                let u = await this.userRepository.createQueryBuilder("user")
                    .leftJoinAndSelect("user.pay_account", "pay_account")
                    .where("user.id = :id", { id: user.id })
                    .getOne();
                await this.payAccountRepository.remove(u.pay_account);
                for (let i = 0; i < u.pay_account.length; i++) {
                    let res = await this.util.requestGet(`http://localhost:3005/api/close/${u.pay_account[i]._id}`);
                    if (res.code == 0) {
                        common_1.Logger.error("关闭浏览器实例失败" + u.pay_account[i].uid);
                    }
                }
                return;
            }
            if (ids) {
                let qb = await this.payAccountRepository.createQueryBuilder("pay_account")
                    .leftJoin("pay_account.SysUser", "user")
                    .where("pay_account.id in (:...ids)", { ids })
                    .andWhere(user.roleLabel == "admin" ? "1=1" : "user.id = :userid", { userid: user.id })
                    .getMany();
                if (action == "open") {
                    for (let i = 0; i < qb.length; i++) {
                        qb[i].open = true;
                        await this.payAccountRepository.save(qb[i]);
                    }
                }
                else if (action == "del") {
                    for (let i = 0; i < qb.length; i++) {
                        await this.payAccountRepository.remove(qb[i]);
                        let res = await this.util.requestGet(`http://localhost:3005/api/close/${qb[i]._id}`);
                        if (res.code == 0) {
                            common_1.Logger.error("关闭浏览器实例失败" + qb[i].uid);
                        }
                    }
                }
                else if (action == "upRechargeLimit") {
                    for (let i = 0; i < qb.length; i++) {
                        qb[i].rechargeLimit = Number(rechargeLimit) * 100;
                        await this.payAccountRepository.save(qb[i]);
                    }
                }
                else if (action == "close") {
                    for (let i = 0; i < qb.length; i++) {
                        qb[i].open = false;
                        await this.payAccountRepository.save(qb[i]);
                    }
                }
            }
            else {
                let p = await this.payAccountRepository.createQueryBuilder("pay_account")
                    .leftJoin("pay_account.SysUser", "user")
                    .where("pay_account.id = :id", { id })
                    .andWhere(user.roleLabel == "admin" ? "1=1" : "user.id = :userid", { userid: user.id })
                    .getOne();
                if (!p)
                    throw new api_exception_1.ApiException(10017);
                if (action == "open") {
                    p.open = open;
                    await this.payAccountRepository.save(p);
                }
                else if (action == "upRechargeLimit") {
                    p.rechargeLimit = Number(rechargeLimit) * 100;
                    ;
                    await this.payAccountRepository.save(p);
                }
                else if (action == "resetRechargeLimit") {
                    p.lockLimit = 0;
                    await this.payAccountRepository.save(p);
                }
                else if (action == "del") {
                    await this.payAccountRepository.remove(p);
                    let res = await this.util.requestGet(`http://localhost:3005/api/close/${p._id}`);
                    if (res.code == 0) {
                        common_1.Logger.error("关闭浏览器实例失败" + p.uid);
                    }
                }
                else if (action == "weight") {
                    p.weight = Number(params.weight) <= 0 ? 0 : Number(params.weight) > 100 ? 100 : Number(params.weight);
                    await this.payAccountRepository.save(p);
                }
            }
        }
        catch (e) {
            throw new api_exception_1.ApiException(40002);
        }
    }
    async newTask() {
        const browser = await this.revisionInfo.puppeteer.launch({
            args: [
                "--no-sandbox",
                "--start-maximized",
                "--disable-setuid-sandbox",
                "--disable-infobars",
                "--window-position=0,0",
                "--ignore-certifcate-errors",
                "--ignore-certifcate-errors-spki-list",
                "--user-agent=\"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36\""
            ],
            executablePath: this.revisionInfo.executablePath,
            defaultViewport: { width: 375, height: 812 },
            ignoreHTTPSErrors: true,
            headless: process.env.NODE_ENV == "development" ? false : true,
            timeout: 0,
            pipe: true
        });
        const [page] = await browser.pages();
        return { browser, page };
    }
    getTaskLength() {
        return Object.keys(this.task_page_map).filter((x) => this.task_page_map[x].browser).length;
    }
};
PayAccountService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payaccount_entity_1.PayAccount)),
    __param(1, (0, typeorm_1.InjectRepository)(sys_user_entity_1.default)),
    __param(2, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.EntityManager,
        redis_service_1.RedisService,
        util_service_1.UtilService])
], PayAccountService);
exports.PayAccountService = PayAccountService;
//# sourceMappingURL=payaccount.service.js.map