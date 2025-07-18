import { Connection } from "@solana/web3.js"
import { Program, Idl, Provider } from "@coral-xyz/anchor"
import idl from "../idl/stake_do.json"
import type { StakeDo } from "../types/stake_do"

const connection = new Connection("https://api.devnet.solana.com", "confirmed")

export const getProgram = (wallet: Provider["wallet"]): Program<StakeDo> => {
  const provider: Provider = {
    connection,
    wallet,
  }

  return new Program<StakeDo>(idl as Idl, provider)
}
