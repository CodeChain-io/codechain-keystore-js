export enum KeyType {
    Platform,
    Asset,
    HDWSeed
}

export function getTableName(type: KeyType) {
    switch (type) {
        case KeyType.Platform:
            return "platform";
        case KeyType.Asset:
            return "asset";
        case KeyType.HDWSeed:
            return "hdwseed";
        default:
            throw new Error("Invalid key type");
    }
}
