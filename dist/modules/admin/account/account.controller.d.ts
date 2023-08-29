import { FastifyRequest } from 'fastify';
import { UtilService } from 'src/shared/services/util.service';
import { IAdminUser } from '../admin.interface';
import { PermMenuInfo } from '../login/login.class';
import { LoginService } from '../login/login.service';
import { AccountInfo } from '../system/user/user.class';
import { UpdatePasswordDto } from '../system/user/user.dto';
import { SysUserService } from '../system/user/user.service';
import { UpdatePersonInfoDto } from './account.dto';
export declare class AccountController {
    private userService;
    private loginService;
    private utils;
    constructor(userService: SysUserService, loginService: LoginService, utils: UtilService);
    info(user: IAdminUser, req: FastifyRequest): Promise<AccountInfo>;
    update(dto: UpdatePersonInfoDto, user: IAdminUser): Promise<void>;
    password(dto: UpdatePasswordDto, user: IAdminUser): Promise<void>;
    logout(user: IAdminUser): Promise<void>;
    permmenu(user: IAdminUser): Promise<PermMenuInfo>;
}
