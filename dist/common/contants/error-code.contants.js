"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodeMap = exports.ErrorCodeEnum = void 0;
var ErrorCodeEnum;
(function (ErrorCodeEnum) {
    ErrorCodeEnum[ErrorCodeEnum["CHANNEL_ERROR_CLOSE"] = 60001] = "CHANNEL_ERROR_CLOSE";
})(ErrorCodeEnum = exports.ErrorCodeEnum || (exports.ErrorCodeEnum = {}));
exports.ErrorCodeMap = {
    10000: "参数校验异常",
    10001: "系统用户已存在",
    10002: "填写验证码有误",
    10112: "ip白名单格式错误",
    10113: "请先绑定谷歌验证器",
    10114: "md5Key长度必须为8-32位",
    10003: "用户名密码有误",
    10004: "节点路由已存在",
    10005: "权限必须包含父节点",
    10006: "非法操作：该节点仅支持目录类型父节点",
    10007: "非法操作：节点类型无法直接转换",
    10008: "该角色存在关联用户，请先删除关联用户",
    10009: "该部门存在关联用户，请先删除关联用户",
    10010: "该部门存在关联角色，请先删除关联角色",
    10015: "该部门存在子部门，请先删除子部门",
    10011: "旧密码与原密码不一致",
    10012: "如想下线自身可右上角退出",
    10013: "不允许下线该用户",
    10014: "父级菜单不存在",
    10016: "系统内置功能不允许操作",
    10017: "用户不存在",
    10018: "无法查找当前用户所属部门",
    10019: "部门不存在",
    10020: "任务不存在",
    10021: "参数配置键值对已存在",
    10101: "不安全的任务，确保执行的加入@Mission注解",
    10102: "所执行的任务不存在",
    10103: "该ip不在白名单",
    11101: "谷歌验证码过期",
    11102: "谷歌验证码错误",
    11103: "密码错误",
    11001: "登录无效或无权限访问",
    11002: "登录身份已过期",
    11003: "无权限，请联系管理员申请权限",
    20001: "当前创建的文件或目录已存在",
    20002: "无需操作",
    20003: "已超出支持的最大处理数量",
    20004: "文件类型不支持",
    20005: "文件大小超出限制",
    30001: "不允许添加代理",
    30002: "余额不足,请先充值",
    30003: "充值金额必须为整数",
    30004: "非法操作",
    30005: "下线余额为0",
    40001: "该账号已存在",
    40002: "编辑出错",
    40003: "该账号不存在",
    40004: "该通道不存在",
    40006: "支付宝账户接入失败",
    40008: "该号码是黑名单,无法查询余额",
    40009: "查询失败",
    40005: "链接支付中,请勿操作",
    40007: "该产品不允许更改",
    40010: "请直接删除,再添加账户",
    50001: "请选中要添加的账号",
    50002: "删除分组失败,请先删除分组成员",
    61100: "创建订单失败,请联系管理员",
    61101: "获取商家超时",
    61102: "商家没有该指定金额订单",
    61103: "创建订单失败,请联系管理员",
    61104: "创建订单失败,请联系管理员",
    61106: "静态码为空",
    60001: "暂停接单",
    60002: "没有该支付通道或通道关闭",
    60102: "必须指定子通道",
    60103: "子通道服务未启用",
    60003: "校验失败",
    60031: "无该订单",
    60032: "无该商户",
    60004: "没有该金额的支付链接",
    60005: "创建订单失败",
    60006: "没有该订单",
    60007: "订单未超时,请等待",
    60008: "订单已支付成功并且回调成功",
    60009: "订单已强制回调,请勿重复回调",
    60010: "系统配置错误,请联系管理员",
    60011: "没有可用支付子频道",
    60012: "没有配置拉取平台",
    60013: "无法提取符合条件的支付连接",
    60014: "无符合话单",
    60015: "不支持该订单金额",
    60016: "系统维护中，禁止推单",
    60017: "该通道不存在",
    60018: "该通道暂不可用",
    60019: "平台已存在相同库存单号的订单",
    60200: "推单成功",
    61200: "退单成功",
    61201: "该订单已经退单成功",
    61400: "退单失败,不存在该订单或该订单正处于充值中,无法退单",
    66666: "尚未开启测试拉单",
    70001: "没有配置订单金额限定",
    70002: "该运营商禁止入单",
    70003: "该运营商的该省份禁止入单",
    70004: "产品权重只能0或100",
    80001: "保存失败",
    80002: "通道保持拉取API关联失败"
};
//# sourceMappingURL=error-code.contants.js.map