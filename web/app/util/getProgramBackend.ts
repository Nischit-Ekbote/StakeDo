import { Connection, PublicKey } from "@solana/web3.js"
import { Program, Idl, AnchorProvider, Wallet } from "@coral-xyz/anchor"
import idl from "../idl/stake_do.json"
import type { StakeDo } from "../types/stake_do"
import { Keypair } from "@solana/web3.js"

const connection = new Connection("https://api.devnet.solana.com", "confirmed")

export const getProgram = (wallet?: Wallet): Program<StakeDo> => {

  const dummyKeypair = Keypair.generate();

  const dummyWallet: Wallet = {
    publicKey: dummyKeypair.publicKey,
    signAllTransactions: async txs => txs,
    signTransaction: async tx => tx,
    payer: dummyKeypair,
  }

  const provider = new AnchorProvider(connection, wallet || dummyWallet, {});

  return new Program<StakeDo>(idl as Idl, provider);
}
