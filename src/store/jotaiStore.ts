import { Connection, PublicKey } from "@solana/web3.js";
import { atom } from "jotai";

//atom to show will model
export const walletPublicKey = atom<null | PublicKey>()
export const oracleConnection = atom<null | Connection>()