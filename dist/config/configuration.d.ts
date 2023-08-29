import * as qiniu from 'qiniu';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
export declare const getConfiguration: () => {
    readonly rootRoleId: number;
    readonly mailer: {
        readonly host: "xxx";
        readonly port: 80;
        readonly auth: {
            readonly user: "xxx";
            readonly pass: "xxx";
        };
        readonly secure: false;
    };
    readonly amap: {
        readonly key: "xxx";
    };
    readonly jwt: {
        readonly secret: string;
    };
    readonly database: MysqlConnectionOptions;
    readonly redis: {
        readonly host: string;
        readonly port: number;
        readonly password: string;
        readonly db: string;
    };
    readonly qiniu: {
        readonly accessKey: string;
        readonly secretKey: string;
        readonly domain: string;
        readonly bucket: string;
        readonly zone: qiniu.conf.Zone;
        readonly access: any;
    };
    readonly logger: {
        readonly timestamp: false;
        readonly dir: string;
        readonly maxFileSize: string;
        readonly maxFiles: string;
        readonly errorLogName: string;
        readonly appLogName: string;
    };
    readonly swagger: {
        readonly enable: boolean;
        readonly path: string;
        readonly title: string;
        readonly desc: string;
        readonly version: string;
    };
    readonly WaMir: {
        readonly ADD: string;
        readonly PORT: string;
        readonly WAMIR_WS: string;
    };
    readonly resources: {
        readonly host: `http://${string}:${string}/`;
        readonly masterHost: `http://${string}/`;
        readonly uploadDir: string;
        readonly uploadMaxSize: string;
        readonly resourceDir: string;
        readonly APP_NAME: string;
    };
};
export type ConfigurationType = ReturnType<typeof getConfiguration>;
export type ConfigurationKeyPaths = Record<NestedKeyOf<ConfigurationType>, any>;
