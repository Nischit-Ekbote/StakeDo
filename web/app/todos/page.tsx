"use client"
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { SendTransactionError, Transaction, PublicKey } from "@solana/web3.js"
import { useEffect, useState } from "react"
import { Plus, Calendar, FileText, Hash, CheckCircle, Clock, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { BN } from "bn.js"
import { getProgram } from "../util/getProgramFrontend"
import { todo } from "../types/todo"

const Todo: React.FC = () => {
  const wallet = useAnchorWallet()
  const { connection } = useConnection()
  
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [deadline, setDeadline] = useState<string>("")
  const [todos, setTodos] = useState<todo[]>([])
  const [todoId, setTodoId] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)


  useEffect(() => {
    console.log("Current RPC endpoint:", connection.rpcEndpoint)
  }, [connection])

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
      console.log("signature")
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
        console.log(message)
        toast.success("✅ Todo created!")
        setTitle("")
        setDescription("")
        setDeadline("")
        return
      }
      console.error("❌ Error creating todo:", err)
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
      console.log("Todos fetched:", data)
    } catch (error) {
      console.error("Error fetching todos:", error)
      toast.error("Failed to fetch todos.")
    }
  }

  const formatDeadline = (timestamp: number | null): string => {
    if (!timestamp) return 'No deadline'
    const date = new Date(timestamp * 1000)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const isOverdue = (deadline: number | null): boolean => {
    if (!deadline) return false
    return new Date(deadline * 1000) < new Date()
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
            Todos
          </h1>
        </div>

        {/* Wallet Connection */}
        <div className="flex items-center space-x-4">
          <WalletMultiButton />
          <Link href={"/todos/create"} className="text-white bg-white/20 py-3 px-5 rounded">Create</Link>
        </div>
        </div>

        {/* Todos List */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center space-x-3">
              <span>Your Todos</span>
            </h2>
            <div className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-xl">
              {todos.length} Total
            </div>
          </div>

          {todos.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-purple-300 mx-auto mb-4 opacity-50" />
              <p className="text-purple-200 text-lg">No todos found</p>
              <p className="text-purple-300 text-sm">Create your first todo to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todos.map((todo, index) => (
                <TodoItem
                  key={todo.todoId}
                  item={todo}
                  wallet={wallet}
                  connection={connection}
                  fetchTodos={fetchTodos}
                  formatDeadline={formatDeadline}
                  isOverdue={isOverdue}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// TodoItem Component
const TodoItem: React.FC<{
  item: todo
  wallet: any
  connection: any
  fetchTodos: () => void
  formatDeadline: (timestamp: number | null) => string
  isOverdue: (deadline: number | null) => boolean
}> = ({ item, wallet, connection, fetchTodos, formatDeadline, isOverdue }) => {
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    if (!wallet || !wallet.publicKey || !wallet.signTransaction) {
      alert("Please connect your wallet.");
      return;
    }

    if (loading) return;
    setLoading(true);

    const program = getProgram(wallet);

    const [todoPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("todo"),
        wallet.publicKey.toBuffer(),
        new BN(item.todoId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    try {
      const tx = await program.methods
        .completeTodo(new BN(item.todoId))
        .accounts({
          authority: wallet.publicKey,
          todoAccount: todoPda,
        })
        .transaction();

      tx.feePayer = wallet.publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

      const signedTx = await wallet.signTransaction(tx);
      const sig = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(sig, "confirmed");

      toast.success("Todo marked as complete!");
    } catch (err : any) {
      const message = err?.message || err?.toString() || ""
      if (message.includes("already been processed") || message.includes("custom program error: 0x0")) {
        toast.success("Todo marked as complete!")
        return
      }
      console.error("Failed to complete todo:", err);
      toast.error("Failed to mark as complete");
    } finally {
      setLoading(false);
      fetchTodos()
    }
  };


  const handleDelete = async () => {
    if (!wallet || !wallet.publicKey || !wallet.signTransaction) {
      toast.error("Please connect your wallet.")
      return
    }

    if (loading) return
    setLoading(true)

    const program = getProgram(wallet)

    const [todoPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("todo"),
        wallet.publicKey.toBuffer(),
        new BN(item.todoId).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    )

    try {
      const tx = await program.methods
        .deleteTodo(new BN(item.todoId))
        .accounts({
          authority: wallet.publicKey,
          todoAccount: todoPda,
        })
        .transaction()

      tx.feePayer = wallet.publicKey
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

      const signedTx = await wallet.signTransaction(tx)
      const sig = await connection.sendRawTransaction(signedTx.serialize())
      await connection.confirmTransaction(sig, "confirmed")

      toast.success("Todo deleted!")
    } catch (err: any) {
      const message = err?.message || err?.toString() || ""

      if (message.includes("already been processed") || message.includes("custom program error: 0x0")) {
        toast.success("Todo deleted!")
        return
      }
      console.error("Failed to delete todo:", err)
      toast.error("Failed to delete todo.")
    } finally {
      setLoading(false)
      fetchTodos()
    }
  }

  return (
    <div className="bg-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors border border-white/10">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${item.isCompleted ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <h3 className="text-white font-semibold text-lg">{item.title}</h3>
            <span className="text-purple-300 text-sm">#{item.todoId}</span>
          </div>
          
          {item.description && (
            <p className="text-purple-200 mb-3 ml-6">{item.description}</p>
          )}
          
          <div className="flex items-center space-x-4 ml-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-300" />
              <span className={`text-sm ${isOverdue(item.deadline) ? 'text-red-400' : 'text-purple-300'}`}>
                {formatDeadline(item.deadline)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-purple-300" />
              <span className="text-purple-300 text-sm">
                Created: {formatDeadline(item.createdAt)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {item.isCompleted ? (
            <CheckCircle className="w-6 h-6 text-green-400" />
          ) : (
            <Clock className="w-6 h-6 text-yellow-400" />
          )}
          
          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            {!item.isCompleted && (
              <button
                onClick={handleComplete}
                disabled={loading}
                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "..." : "Complete"}
              </button>
            )}
            
            {item.isCompleted && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>{loading ? "..." : "Delete"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Todo