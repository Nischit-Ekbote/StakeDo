"use client"

import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { Transaction } from "@solana/web3.js";

function InitUser() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  const initUser = async () => {
    if (!wallet || !wallet.publicKey || !wallet.signTransaction) {
      alert("Please connect your wallet.")
      return
    }

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        body: JSON.stringify({ user: wallet.publicKey.toBase58() }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      const { transaction } = await res.json()

      const tx = Transaction.from(Buffer.from(transaction, "base64"))
      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTx = await wallet.signTransaction(tx)
      const signature = await connection.sendRawTransaction(signedTx.serialize())
      const latestBlockhash = await connection.getLatestBlockhash()
      await connection.confirmTransaction({
        signature,
        ...latestBlockhash,
      }, "confirmed")

      alert("✅ User initialized!")
    } catch (err: any) {
      console.error("Error initializing user:", err)
      alert("❌ Failed to initialize user.")
    }
  }

  return (
    <div>
      <button onClick={initUser} className="bg-green-600 text-white px-4 py-2 rounded">
        Initialize User
      </button>
    </div>
  )
}

export default InitUser
