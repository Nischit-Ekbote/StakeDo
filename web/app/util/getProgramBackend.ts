import { Connection, PublicKey } from "@solana/web3.js"
import { Program, Idl, AnchorProvider, Wallet } from "@coral-xyz/anchor"
import idl from "../idl/stake_do.json"
import type { StakeDo } from "../types/stake_do"

const connection = new Connection("http://127.0.0.1:8899", "confirmed")

export const getProgram = (wallet?: Wallet): Program<StakeDo> => {
  // fallback dummy wallet for read-only queries
  const dummyWallet: Wallet = {
    publicKey: PublicKey.default,
    signAllTransactions: async txs => txs,
    signTransaction: async tx => tx,
  }

  const provider = new AnchorProvider(connection, wallet || dummyWallet, {});

  return new Program<StakeDo>(idl as Idl, provider);
}
