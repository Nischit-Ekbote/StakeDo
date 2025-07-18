"use client"
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { Transaction, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { useState, useEffect } from "react"
import { Wallet, Send, History, Plus, Coins, ExternalLink, Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface TransactionData {
  signature: string
  slot: number
  timestamp: number | null
  fee: number
  status: 'success' | 'failed'
}

const SolanaWalletDashboard: React.FC = () => {
  const wallet = useAnchorWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [airdropLoading, setAirdropLoading] = useState<boolean>(false)
  const [initLoading, setInitLoading] = useState<boolean>(false)
  const [copied, setCopied] = useState<boolean>(false)

  const fetchBalance = async (): Promise<void> => {
    if (!wallet?.publicKey) return
    
    try {
      const balance = await connection.getBalance(wallet.publicKey)
      setBalance(balance / LAMPORTS_PER_SOL)
    } catch (err) {
      console.error("Error fetching balance:", err)
    }
  }

  const fetchTransactions = async (): Promise<void> => {
    if (!wallet?.publicKey) return
    
    setLoading(true)
    try {
      const signatures = await connection.getSignaturesForAddress(wallet.publicKey, { limit: 10 })
      const txs: TransactionData[] = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await connection.getTransaction(sig.signature, { maxSupportedTransactionVersion: 0 })
          return {
            signature: sig.signature,
            slot: sig.slot,
            timestamp: sig.blockTime ?? null,
            fee: tx?.meta?.fee || 0,
            status: tx?.meta?.err ? 'failed' as const : 'success' as const
          }
        })
      )
      setTransactions(txs)
    } catch (err) {
      console.error("Error fetching transactions:", err)
      toast.error("Failed to fetch transactions. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const airdropSol = async (): Promise<void> => {
    if (!wallet?.publicKey) {
      alert("Please connect your wallet.")
      return
    }

    setAirdropLoading(true)
    try {
      const signature = await connection.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL)
      const latestBlockhash = await connection.getLatestBlockhash()
      await connection.confirmTransaction({
        signature,
        ...latestBlockhash,
      }, "confirmed")
      
      toast.success("Airdrop successful! 1 SOL added to your wallet.")
      fetchBalance()
      fetchTransactions()
    } catch (err) {
      console.error("Error during airdrop:", err)
      toast.error("Airdrop failed. You may have reached the daily limit.")
    } finally {
      setAirdropLoading(false)
    }
  }

  const initUser = async (): Promise<void> => {
    if (!wallet || !wallet.publicKey || !wallet.signTransaction) {
      alert("Please connect your wallet.")
      return
    }
    
    setInitLoading(true)
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        body: JSON.stringify({ user: wallet.publicKey.toBase58() }),
        headers: {
          "Content-Type": "application/json",
        },
      })
      const { transaction }: { transaction: string } = await res.json()
      const tx = Transaction.from(Buffer.from(transaction, "base64"))
      tx.feePayer = wallet.publicKey
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
      const signedTx = await wallet.signTransaction(tx)
      const signature = await connection.sendRawTransaction(signedTx.serialize())
      const latestBlockhash = await connection.getLatestBlockhash()
      await connection.confirmTransaction({
        signature,
        ...latestBlockhash,
      }, "confirmed")
      toast.success("✅ User initialized!")
      fetchTransactions()
    } catch (err: any) {
      console.error("Error initializing user:", err)
        toast.error("❌ Failed to initialize user.")
    } finally {
      setInitLoading(false)
    }
  }

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTimestamp = (timestamp: number | null): string => {
    if (!timestamp) return 'Pending'
    return new Date(timestamp * 1000).toLocaleString()
  }

  // Format signature for display
  const formatSignature = (sig: string): string => {
    return `${sig.slice(0, 8)}...${sig.slice(-8)}`
  }

  useEffect(() => {
    if (wallet?.publicKey) {
      fetchBalance()
      fetchTransactions()
    }
  }, [wallet?.publicKey])

  if (!wallet?.publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-24 h-24 text-purple-300 mx-auto mb-6" />
          <h1 className="text-4xl text-white mb-4">Solana Wallet Dashboard</h1>
          <p className="text-purple-200 text-lg">Please connect your wallet to continue</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text mt-10 mb-4">
          <h1 className="text-5xl  text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>

        {/* Wallet Info Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl text-white">Wallet Overview</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-300 font-mono text-sm">
                {wallet.publicKey.toBase58().slice(0, 8)}...{wallet.publicKey.toBase58().slice(-8)}
              </span>
              <button
                onClick={() => copyToClipboard(wallet.publicKey.toBase58())}
                className="text-purple-300 hover:text-white transition-colors"
                type="button"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors border border-white/10 p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Coins className="w-6 h-6 text-yellow-400" />
                <span className="text-purple-200">Balance</span>
              </div>
              <div className="text-3xl text-white">
                {balance.toFixed(4)} SOL
              </div>
              <div className="text-purple-300 text-sm">
                ≈ ${(balance * 20).toFixed(2)} USD
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors border border-white/10 p-6">
              <div className="flex items-center space-x-3 mb-2">
                <History className="w-6 h-6 text-blue-400" />
                <span className="text-purple-200">Transactions</span>
              </div>
              <div className="text-3xl text-white">
                {transactions.length}
              </div>
              <div className="text-purple-300 text-sm">
                Recent activities
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={airdropSol}
            disabled={airdropLoading}
            className="
            border-1 border-white/30 hover:bg-white/10 px-4 py-2 rounded-xl transition-colors text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform cursor-pointer  disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            type="button"
          >
            <Plus className="w-6 h-6" />
            <span>{airdropLoading ? "Airdropping..." : "Airdrop 1 SOL"}</span>
          </button>

          <button
            onClick={initUser}
            disabled={initLoading}
            className="bg-white text-black font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center space-x-3"
            type="button"
          >
            <Send className="w-6 h-6" />
            <span>{initLoading ? "Initializing..." : "Initialize User"}</span>
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center space-x-3">
              <span>Transaction History</span>
            </h2>
            <button
              onClick={fetchTransactions}
              disabled={loading}
              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-xl transition-colors"
              type="button"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-purple-300 mx-auto mb-4 opacity-50" />
              <p className="text-purple-200 text-lg">No transactions found</p>
              <p className="text-purple-300 text-sm">Start by making your first transaction!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx, index) => (
                <div
                  key={tx.signature}
                  className="bg-white/5 rounded-2xl p-4 hover:bg-white/10 transition-colors border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${tx.status === 'success' ? 'bg-green-400' : 'bg-red-400'}`} />
                      <div>
                        <div className="text-white font-medium">
                          Transaction #{index + 1}
                        </div>
                        <div className="text-purple-300 text-sm font-mono">
                          {formatSignature(tx.signature)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-sm">
                        Fee: {(tx.fee / LAMPORTS_PER_SOL).toFixed(6)} SOL
                      </div>
                      <div className="text-purple-300 text-xs">
                        {formatTimestamp(tx.timestamp)}
                      </div>
                    </div>
                    <a
                      href={`https://explorer.solana.com/tx/${tx.signature}/?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SolanaWalletDashboard