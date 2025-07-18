"use client"
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { SendTransactionError, Transaction } from "@solana/web3.js"
import { useEffect, useState } from "react"
import { Plus, Calendar, FileText, Hash, CheckCircle, Clock, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface Todo {
  id: number
  title: string
  description: string
  deadline: number | null
  completed: boolean
  createdAt: number
}

const CreateTodo: React.FC = () => {
  const wallet = useAnchorWallet()
  const { connection } = useConnection()
  
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [deadline, setDeadline] = useState<string>("")
  const [todos, setTodos] = useState<Todo[]>([])
  const [todoId, setTodoId] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)

  const handleCreate = async (): Promise<void> => {
    if (!wallet || !wallet.publicKey || !wallet.signTransaction) {
      toast.error("Please connect your wallet.")
      return
    }

    if (!title.trim()) {
      toast.error("Please enter a title for your todo.")
      return
    }

    setLoading(true)
    const body = {
      user: wallet.publicKey.toBase58(),
      todoId,
      title,
      description,
      deadline: deadline ? Math.floor(new Date(deadline).getTime() / 1000) : null,
    }

    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
        },
      })
      const { transaction } = await res.json()
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
      toast.success("✅ Todo created!")
      
      // Clear form
      setTitle("")
      setDescription("")
      setDeadline("")
    } catch (err: any) {
      const message = err?.message || err?.toString() || ""

      if (message.includes("already been processed") || message.includes("custom program error: 0x0")) {
        toast.success("Todo created!")
        setTitle("")
        setDescription("")
        setDeadline("")
        return
      }
      console.error("Error creating todo:", err)
      toast.error("Failed to create todo.")
    } finally {
      setLoading(false)
      fetchTodos()
    }
  }

  const fetchTodos = async (): Promise<void> => {
    if (!wallet?.publicKey) return
    try {
      const response = await fetch(`/api/todos?user=${wallet.publicKey.toBase58()}`)
      const data = await response.json()
      if (!response.ok) {
        console.error("Failed to fetch todos:", data?.error || response.statusText)
        return
      }
      setTodos(data)
      setTodoId(data.length + 1)
    } catch (error) {
      console.error("Error fetching todos:", error)
      toast.error("Failed to fetch todos.")
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [wallet?.publicKey, connection])

  if (!wallet?.publicKey) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-24 h-24 text-purple-300 mx-auto mb-6" />
          <h1 className="text-4xl text-white mb-4">Todo Manager</h1>
          <p className="text-purple-200 text-lg mb-8">Please connect your wallet to continue</p>
          <WalletMultiButton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
            <div className="text mt-10 mb-4">
          <h1 className="text-5xl text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            <Link href={"/todos"}>Todos</Link>
             /Create
          </h1>
        </div>

        {/* Wallet Connection */}
        <div className="">
          <WalletMultiButton />
        </div>
        </div>

        {/* Create Todo Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
          <h2 className="text-2xl text-white mb-6">Create New Todo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-purple-200 mb-2 flex items-center space-x-2">
                <Hash className="w-4 h-4" />
                <span>Todo ID</span>
              </label>
              <input
                type="number"
                value={todoId}
                onChange={e => setTodoId(Number(e.target.value))}
                className="w-full bg-white/5 rounded-xl p-4 text-white border border-white/10 focus:border-purple-400 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-purple-200 mb-2 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Deadline</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-white/5 rounded-xl p-4 text-white border border-white/10 focus:border-purple-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-purple-200 mb-2 flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Title</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter todo title..."
                className="w-full bg-white/5 rounded-xl p-4 text-white border border-white/10 focus:border-purple-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-purple-200 mb-2">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Enter todo description..."
                rows={4}
                className="w-full bg-white/5 rounded-xl p-4 text-white border border-white/10 focus:border-purple-400 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="bg-white text-black font-semibold py-4 px-8 rounded-2xl transition-all duration-300 transform disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center space-x-3 mt-6"
            type="button"
          >
            <Plus className="w-6 h-6" />
            <span>{loading ? "Creating..." : "Create Todo"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateTodo