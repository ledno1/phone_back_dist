export declare class AddLink {
    amount: number;
    channel: number;
    oid: string;
    pay_link: string;
    accountNumber: string;
    zuid: string;
}
export declare class Notify {
    merId: string;
    orderId: string;
    sysOrderId: string;
    orderAmt: string;
    desc: string;
    status: string;
    nonceStr: string;
    attch: string;
}
export declare class NotifyResult {
    result: boolean;
    msg: string;
}
