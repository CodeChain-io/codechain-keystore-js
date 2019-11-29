import { getPublicFromPrivate, signEcdsa } from "codechain-primitives";
import * as _ from "lodash";
import { Context } from "../context";
import { ErrorCode, KeystoreError } from "../logic/error";
import { decode, encode } from "../logic/hdstorage";
import {
    PrivateKey,
    PublicKey,
    SecretSeedStorage,
    Seed,
    SeedHash
} from "../types";
import { KeyType } from "./keytypes";

const Mnemonic = require("bitcore-mnemonic");
const Random = Mnemonic.bitcore.crypto.Random;

// Seed: Seed(entropy) of a mnemonic code. Not a direct seed of a HD wallet.
// See the definition:
// https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki

export async function getSeedHashes(context: Context): Promise<SeedHash[]> {
    const rows: any = await context.db.get(KeyType.HDWSeed).value();
    return _.map(
        rows,
        (storage: SecretSeedStorage) => storage.seedHash
    ) as SeedHash[];
}

export async function exportSeed(
    context: Context,
    params: { seedHash: SeedHash; passphrase: string }
): Promise<SecretSeedStorage> {
    const secret = await getSecretSeedStorage(context, params);
    if (secret == null) {
        throw new KeystoreError(ErrorCode.NoSuchSeedHash);
    }
    await decode(secret, params.passphrase);
    return secret;
}

export async function exportRawSeed(
    context: Context,
    params: { seedHash: SeedHash; passphrase: string }
): Promise<Seed> {
    const secret = await getSecretSeedStorage(context, params);
    if (secret == null) {
        throw new KeystoreError(ErrorCode.NoSuchSeedHash);
    }
    return decode(secret, params.passphrase);
}

export async function exportMnemonic(
    context: Context,
    params: {
        seedHash: SeedHash;
        passphrase: string;
    }
): Promise<string> {
    const secret = await getSecretSeedStorage(context, params);
    if (secret == null) {
        throw new KeystoreError(ErrorCode.NoSuchSeedHash);
    }
    const seed = await decode(secret, params.passphrase);
    const code = new Mnemonic(Buffer.from(seed, "hex"));

    return code.toString();
}

export async function importSeed(
    context: Context,
    params: {
        secret: SecretSeedStorage;
        passphrase: string;
    }
): Promise<SeedHash> {
    const seed = await decode(params.secret, params.passphrase);
    return importSeedToDB(context, {
        seed,
        passphrase: params.passphrase,
        meta: params.secret.meta
    });
}

export function importRawSeed(
    context: Context,
    params: {
        seed: Seed;
        passphrase?: string;
        meta?: string;
    }
): Promise<SeedHash> {
    return importSeedToDB(context, params);
}

export async function importMnemonic(
    context: Context,
    params: {
        mnemonic: string;
        passphrase?: string;
        meta?: string;
    }
): Promise<SeedHash> {
    // This code is from Mnemonic.isValid().
    // There's no way to get a seed from a code in bitcore-mnemonic,
    // (.toSeed() generates the seed of the HD wallet)
    // so copied .isValid() code and reused buf variable to convert.
    const { mnemonic } = params;
    const wordlist = Mnemonic._getDictionary(mnemonic);

    if (!wordlist) {
        throw new KeystoreError(ErrorCode.WrongMnemonicString);
    }

    const words = mnemonic.split(" ");
    let bin = "";
    for (const word of words) {
        const ind = wordlist.indexOf(word);
        if (ind < 0) {
            throw new KeystoreError(ErrorCode.WrongMnemonicString);
        }
        bin = bin + ("00000000000" + ind.toString(2)).slice(-11);
    }

    const cs = bin.length / 33;
    const hashBits = bin.slice(-cs);
    const nonhashBits = bin.slice(0, bin.length - cs);
    const buf = new Buffer(nonhashBits.length / 8);
    for (let i = 0; i < nonhashBits.length / 8; i++) {
        buf.writeUInt8(parseInt(bin.slice(i * 8, (i + 1) * 8), 2), i);
    }
    const expectedHashBits = Mnemonic._entropyChecksum(buf);
    if (expectedHashBits !== hashBits) {
        throw new KeystoreError(ErrorCode.WrongMnemonicString);
    }

    const seed = buf.toString("hex");
    return importSeedToDB(context, {
        ...params,
        seed
    });
}

export async function createSeed(
    context: Context,
    params: { seedLength?: number; passphrase?: string; meta?: string }
): Promise<SeedHash> {
    const { seedLength = 128 } = params;
    if (seedLength % 32 !== 0 || seedLength < 128) {
        throw new KeystoreError(ErrorCode.WrongSeedLength);
    }
    const seed = Random.getRandomBuffer(seedLength / 8).toString("hex");
    return importSeedToDB(context, {
        ...params,
        seed
    });
}

export async function deleteSeed(
    context: Context,
    params: { seedHash: SeedHash }
): Promise<boolean> {
    const secret = await getSecretSeedStorage(context, params);
    if (secret == null) {
        return false;
    }

    await removeKey(context, params);
    return true;
}

export async function getPrivateKeyFromSeed(
    context: Context,
    params: {
        seedHash: SeedHash;
        path: string;
        passphrase: string;
    }
): Promise<PrivateKey> {
    const secret = await getSecretSeedStorage(context, params);
    if (secret == null) {
        throw new KeystoreError(ErrorCode.NoSuchSeedHash);
    }

    const seed = await decode(secret, params.passphrase);
    const code = new Mnemonic(Buffer.from(seed, "hex"));
    const masterKey = code.toHDPrivateKey();
    const derivedKey = masterKey.derive(params.path);
    const privateKey = derivedKey.privateKey.toString();

    return privateKey;
}

export async function getPublicKeyFromSeed(
    context: Context,
    params: {
        seedHash: SeedHash;
        path: string;
        passphrase: string;
    }
): Promise<PublicKey> {
    const privateKey = await getPrivateKeyFromSeed(context, params);
    const publicKey = getPublicFromPrivate(privateKey);

    return publicKey;
}

export async function signFromSeed(
    context: Context,
    params: {
        seedHash: SeedHash;
        path: string;
        message: string;
        passphrase: string;
    }
): Promise<string> {
    const privateKey = await getPrivateKeyFromSeed(context, params);

    const { r, s, v } = signEcdsa(params.message, privateKey);
    const sig = `${_.padStart(r, 64, "0")}${_.padStart(s, 64, "0")}${_.padStart(
        v.toString(16),
        2,
        "0"
    )}`;
    return sig;
}

async function importSeedToDB(
    context: Context,
    params: {
        seed: Seed;
        passphrase?: string;
        meta?: string;
    }
): Promise<SeedHash> {
    const passphrase = params.passphrase || "";
    const meta = params.meta || "{}";

    const secret = await encode(params.seed, passphrase, meta);
    const rows: any = context.db.get(KeyType.HDWSeed);
    await rows.push(secret).write();
    return secret.seedHash;
}

async function getSecretSeedStorage(
    context: Context,
    params: { seedHash: SeedHash }
): Promise<SecretSeedStorage | null> {
    const collection: any = context.db.get(KeyType.HDWSeed);
    const secret = await collection
        .find(
            (secretStorage: SecretSeedStorage) =>
                secretStorage.seedHash === params.seedHash
        )
        .value();

    if (secret == null) {
        return null;
    }
    return secret as SecretSeedStorage;
}

async function removeKey(
    context: Context,
    params: { seedHash: SeedHash }
): Promise<void> {
    const collection: any = context.db.get(KeyType.HDWSeed);
    await collection
        .remove(
            (secret: SecretSeedStorage) => secret.seedHash === params.seedHash
        )
        .write();
}

export async function getMeta(
    context: Context,
    params: { seedHash: SeedHash }
): Promise<string> {
    const secret = await getSecretSeedStorage(context, params);
    if (secret == null) {
        throw new KeystoreError(ErrorCode.NoSuchKey);
    }
    return secret.meta;
}

export async function save(context: Context): Promise<SecretSeedStorage[]> {
    return await context.db.get(KeyType.HDWSeed).value();
}

export async function load(
    context: Context,
    value: SecretSeedStorage[]
): Promise<void> {
    return context.db.set(KeyType.HDWSeed, value).write();
}

export async function clear(context: Context): Promise<void> {
    await context.db.unset(KeyType.HDWSeed).write();
}
