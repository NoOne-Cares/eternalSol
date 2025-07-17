import { PublicKey } from "@solana/web3.js";

export const isValidSolanaAddress = (address: string): boolean => {
    try {
        const key = new PublicKey(address);
        return PublicKey.isOnCurve(key);
    } catch {
        return false;
    }
};