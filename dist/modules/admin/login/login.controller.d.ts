import { FastifyRequest } from 'fastify';
import { UtilService } from 'src/shared/services/util.service';
import { ImageCaptchaDto, LoginInfoDto } from './login.dto';
import { ImageCaptcha, LoginToken } from './login.class';
import { LoginService } from './login.service';
import { JwtService } from "@nestjs/jwt";
export declare class LoginController {
    private loginService;
    private utils;
    private jwtService;
    constructor(loginService: LoginService, utils: UtilService, jwtService: JwtService);
    captchaByImg(dto: ImageCaptchaDto): Promise<ImageCaptcha>;
    login(dto: LoginInfoDto, req: FastifyRequest, ua: string): Promise<LoginToken>;
}
