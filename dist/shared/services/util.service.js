"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.UtilService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const nanoid_1 = require("nanoid");
const CryptoJS = __importStar(require("crypto-js"));
const dayjs_1 = __importDefault(require("dayjs"));
const otplib_1 = require("otplib");
const qrcode_1 = __importDefault(require("qrcode"));
const socks_proxy_agent_1 = __importDefault(require("socks-proxy-agent"));
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const backip_entity_1 = require("../../entities/resource/backip.entity");
const fingerprint_entity_1 = require("../../entities/resource/fingerprint.entity");
const retry = require('retry');
const REQ = require("request-promise-native");
let UtilService = class UtilService {
    httpService;
    entityManager;
    constructor(httpService, entityManager) {
        this.httpService = httpService;
        this.entityManager = entityManager;
    }
    async sleep(ms = 1000) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    getReqIP(req) {
        return ((req.headers["x-forwarded-for"] ||
            req.socket.remoteAddress).replace("::ffff:", ""));
    }
    IsLAN(ip) {
        ip.toLowerCase();
        if (ip == "localhost")
            return true;
        let a_ip = 0;
        if (ip == "")
            return false;
        const aNum = ip.split(".");
        if (aNum.length != 4)
            return false;
        a_ip += parseInt(aNum[0]) << 24;
        a_ip += parseInt(aNum[1]) << 16;
        a_ip += parseInt(aNum[2]) << 8;
        a_ip += parseInt(aNum[3]) << 0;
        a_ip = (a_ip >> 16) & 0xffff;
        return (a_ip >> 8 == 0x7f ||
            a_ip >> 8 == 0xa ||
            a_ip == 0xc0a8 ||
            (a_ip >= 0xac10 && a_ip <= 0xac1f));
    }
    async getLocation(ip) {
        if (this.IsLAN(ip))
            return "内网IP";
        let { data } = await this.httpService.axiosRef.get(`http://whois.pconline.com.cn/ipJson.jsp?ip=${ip}&json=true`, { responseType: "arraybuffer" });
        data = new TextDecoder("gbk").decode(data);
        data = JSON.parse(data);
        return data.addr.trim().split(" ").at(0);
    }
    aesEncrypt(msg, secret) {
        return CryptoJS.AES.encrypt(msg, secret).toString();
    }
    aesDecrypt(encrypted, secret) {
        return CryptoJS.AES.decrypt(encrypted, secret).toString(CryptoJS.enc.Utf8);
    }
    md5(msg) {
        return CryptoJS.MD5(msg).toString();
    }
    generateUUID() {
        return (0, nanoid_1.nanoid)();
    }
    generateUUIDSelf() {
        let randomStr = this.generateRandomValue(7);
        let nowTime = this.dayjsFormat(new Date().getTime()).replace(/[-\s:]/g, "");
        return randomStr + nowTime;
    }
    generateRandomValue(length, placeholder = "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM") {
        const customNanoid = (0, nanoid_1.customAlphabet)(placeholder, length);
        return customNanoid();
    }
    getNowTimestamp() {
        return (0, dayjs_1.default)().valueOf() / 1000;
    }
    dayjs(t = undefined) {
        if (t)
            return (0, dayjs_1.default)(t);
        return (0, dayjs_1.default)();
    }
    dayjsFormat(t) {
        return (0, dayjs_1.default)(t).format("YYYY-MM-DD HH:mm:ss");
    }
    unique(arr, key) {
        const res = new Map();
        return arr.filter((arr) => !res.has(arr[key]) && res.set(arr[key], 1));
    }
    ascesign(obj, yan) {
        let newData2 = {}, signData2 = [];
        Object.keys(obj).sort().map(key => {
            newData2[key] = obj[key];
            signData2.push(`${key}=${obj[key]}`);
        });
        let sign = this.md5(signData2.join("&") + `&key=${yan}`).toLocaleUpperCase();
        return sign;
    }
    ascesign_chaoneng(obj, yan) {
        let newData2 = {}, signData2 = [];
        Object.keys(obj).sort().map(key => {
            newData2[key] = obj[key];
            signData2.push(`${key}=${obj[key]}`);
        });
        let sign = this.md5(signData2.join("&") + yan).toLocaleLowerCase();
        return sign;
    }
    checkSign_chaoneng(obj, yan) {
        let sign = obj.sign;
        delete obj.sign;
        delete obj.sign_type;
        let sign2 = this.ascesign_chaoneng(obj, yan);
        console.log(`请求sign:${sign} 本地sign:${sign2}`);
        return sign == sign2;
    }
    async requestGet(url, headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }, timeout = 60000) {
        let { data } = await this.httpService.axiosRef.get(url, {
            proxy: false,
            headers,
            timeout
        });
        return data;
    }
    async requestPost(url, params, headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }, proxy = false, timeout = 30 * 1000) {
        let config;
        if (proxy) {
            const httpsAgent = new socks_proxy_agent_1.default.SocksProxyAgent(proxy);
            config = {
                proxy: {
                    host: "127.0.0.1",
                    port: 7890
                },
                headers,
                timeout
            };
        }
        else {
            config = {
                proxy: proxy ? proxy : false,
                headers,
                timeout
            };
        }
        let { data } = await this.httpService.axiosRef.post(url, params, config);
        return data;
    }
    checkSign(obj, yan) {
        let sign = obj.sign;
        delete obj.sign;
        let sign2 = this.ascesign(obj, yan);
        console.log(`${obj.merId} 请求sign:${sign} 本地sign:${sign2}`);
        return sign == sign2;
    }
    createSeedSecret = async (userName, appName = "PhonePay") => {
        const secret = otplib_1.authenticator.generateSecret();
        const googleKeyuri = otplib_1.authenticator.keyuri(userName, appName, secret);
        const qrcodeUrl = await qrcode_1.default.toDataURL(googleKeyuri);
        return { secret, qrcodeUrl };
    };
    isCodeCorrect = (code, secret) => {
        return otplib_1.authenticator.check(code, secret);
    };
    async notifyRequest(url, notify, yan) {
        let sign = this.ascesign(notify, yan);
        let form = JSON.stringify(notify);
        form = JSON.parse(form);
        form["sign"] = sign;
        console.log(form);
        try {
            let r = await REQ.post({ url: url, form: form, timeout: 1000 * 20 });
            console.log("上号补单执行回调结果");
            console.log(r);
            common_1.Logger.log("上号补单执行回调结果");
            common_1.Logger.log(r);
            if (r && r === "success") {
                return {
                    result: true,
                    msg: ""
                };
            }
            return {
                result: false,
                msg: r
            };
        }
        catch (error) {
            console.log("上号补单执行回调请求出错", error);
            return {
                result: false,
                msg: error.toString()
            };
        }
    }
    async backClient(ip, fingerprint) {
        if (ip.includes("127.0.0.1")) {
            return true;
        }
        let have = await this.entityManager.findOne(backip_entity_1.BackIP, { where: { address: ip } });
        if (have) {
            return true;
        }
        let have2 = await this.entityManager.findOne(fingerprint_entity_1.Fingerprint, { where: { name: fingerprint } });
        if (have2) {
            return true;
        }
        return false;
    }
};
UtilService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [axios_1.HttpService,
        typeorm_2.EntityManager])
], UtilService);
exports.UtilService = UtilService;
//# sourceMappingURL=util.service.js.map