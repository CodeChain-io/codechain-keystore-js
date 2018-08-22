import { Context, createContext, closeContext } from "./context";
import { getKeys, createKey, deleteKey, signKey } from "./model/keys";
import { insertPKH, getPKH } from "./model/pkhs";

class CCKey {
    public static CCKey = CCKey;

    public static async create(params: {
        useMemoryDB?: boolean
    } = {}): Promise<CCKey> {
        const useMemoryDB = params.useMemoryDB || false;
        const context = await createContext({ useMemoryDB });
        return new CCKey(context);
    }

    private context: Context;

    private constructor(context: Context) {
        this.context = context;
    }

    public getKeys(): Promise<string[]> {
        return getKeys(this.context);
    }

    public createKey(params: { passphrase?: string }): Promise<string> {
        return createKey(this.context, params);
    }

    public deleteKey(params: { publicKey: string, passphrase: string }): Promise<boolean> {
        return deleteKey(this.context, params);
    }

    public signKey(params: { publicKey: string, message: string, passphrase: string }): Promise<string> {
        return signKey(this.context, params);
    }

    public insertPKH(params: { publicKey: string }): Promise<string> {
        return insertPKH(this.context, params);
    }

    public getPKH(params: { hash: string }): Promise<string | null> {
        return getPKH(this.context, params);
    }

    public close(): Promise<void> {
        return closeContext(this.context);
    }
}

export { CCKey };

module.exports = CCKey;
