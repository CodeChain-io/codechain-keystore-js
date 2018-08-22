import { Context } from "../context";
export declare function addMapping(context: Context, params: {
    key: string;
    value: string;
}): Promise<void>;
export declare function getMapping(context: Context, params: {
    key: string;
}): Promise<string | null>;
