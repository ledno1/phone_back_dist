import { JwtService } from "@nestjs/jwt";
import { UtilService } from "src/shared/services/util.service";
import { RedisService } from "src/shared/services/redis.service";
import { SysLogService } from "../system/log/log.service";
import { SysUserService } from "../system/user/user.service";
import { SysMenuService } from "../system/menu/menu.service";
import { ImageCaptchaDto } from "./login.dto";
import { ImageCaptcha, PermMenuInfo } from "./login.class";
export declare class LoginService {
    private redisService;
    private menuService;
    private userService;
    private logService;
    private util;
    private jwtService;
    constructor(redisService: RedisService, menuService: SysMenuService, userService: SysUserService, logService: SysLogService, util: UtilService, jwtService: JwtService);
    createImageCaptcha(captcha: ImageCaptchaDto): Promise<ImageCaptcha>;
    checkGoogleCode(username: string, code: string): Promise<void>;
    checkImgCaptcha(id: string, code: string): Promise<void>;
    getLoginSign(username: string, password: string, ip: string, ua: string): Promise<string>;
    clearLoginStatus(uid: number): Promise<void>;
    getPermMenu(uid: number, lv: number): Promise<PermMenuInfo>;
    getRedisPasswordVersionById(id: number): Promise<string>;
    getRedisTokenById(id: number): Promise<string>;
    getRedisPermsById(id: number): Promise<string>;
}
