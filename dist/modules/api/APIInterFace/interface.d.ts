export declare class KaKa {
    user_id: number;
    order_sn: string;
    channel: number;
    payment: string;
    amount: number;
    phone: string;
    ip: string;
    ua: string;
    prov: string;
    method: string;
}
export declare const KaKaCode: {
    10000: string;
    10001: string;
    10010: string;
    10011: string;
    10012: string;
    10013: string;
    10014: string;
    10015: string;
    10016: string;
};
export declare class KaKaResponse {
    code: number;
    msg: string;
    data: KaKaResponseData;
}
export declare class KaKaResponseData {
    orderId: string;
    payParams: string;
    query_url: string;
    charge_num_type: string;
}
export declare class Pay {
    merId: string;
    orderId: string;
    orderAmt: string;
    channel: string;
    desc: string;
    smstyle: string;
    userId: string;
    ip: string;
    notifyUrl: string;
    returnUrl: string;
    nonceStr: string;
    sign: string;
    attch: string;
}
export declare class DirectPush {
    merId: string;
    orderId: string;
    orderAmt: string;
    attch: string;
    channel: string;
    rechargeNumber: string;
    notifyUrl: string;
    weight: string;
    sign: string;
}
export declare class DirectBack {
    merId: string;
    orderId: string;
    channel: string;
    sign: string;
}
export declare class PayCheck {
    merId: string;
    orderId: string;
    nonceStr: string;
    sign: string;
}
export declare class ALiPayNotify {
    type: string;
    no: string;
    money: string;
    mark: string;
    dt: string;
    idnumber: string;
    sign: string;
}
export declare class SysPay extends Pay {
    amount?: number;
    subChannel?: number;
    aliAmount?: string;
    md5Key?: string;
}
export declare class PayResponse {
    code: number;
    payurl: string;
    sysorderno: string;
    orderno: string;
}
export declare class PayResponseError {
    code: number;
    data: string;
    message: string;
}
