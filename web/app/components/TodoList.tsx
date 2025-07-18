"use client"

import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { todo } from "../types/todo";
import { PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { BN } from "bn.js";
import { getProgram } from "../util/getProgramFrontend";
import { AnchorProvider } from "@coral-xyz/anchor";

function TodoList() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [todos, setTodos] = useState<todo[]>([]);

  const fetchTodos = async () => {
    if (!wallet?.publicKey) return;

    try {
      const response = await fetch(`/api/todos?user=${wallet.publicKey.toBase58()}`);
      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to fetch todos:", data?.error || response.statusText);
        return;
      }

      setTodos(data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [wallet]);

  return (
    <div>
      {todos.map((item, key) => (
        <Todo
          key={item.todoId}
          item={item}
          wallet={wallet}
          connection={connection}
          fetchTodos={fetchTodos}
        />
      ))}
    </div>
  );
}

export default TodoList;

// Todo Component
export function Todo({
  item,
  wallet,
  connection,
  fetchTodos,
}: {
  item: todo;
  wallet: any;
  connection: any;
  fetchTodos: () => void;
}) {
  const [loading, setLoading] = useState(false);

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

      toast.success("✅ Todo marked as complete!");
      fetchTodos();
    } catch (err) {
      console.error("❌ Failed to complete todo:", err);
      toast.error("Failed to mark as complete");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
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
        .deleteTodo(new BN(item.todoId))
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

      toast.success("✅ Deleted!");
    } catch (err: any) {
      const message = err?.message || err?.toString() || ""

      if (message.includes("already been processed") || message.includes("custom program error: 0x0")) {
        toast.success("✅ Todo Deleted")
        return
      }
      console.error("❌ Failed to delete todo:", err);
      toast.error("Failed to delete");
    } finally {
      setLoading(false);
      fetchTodos();
    }
  };

  return (
    <div className="flex justify-between items-center bg-gray-800 p-4 rounded mb-2">
      <div>
        <h1 className="font-bold">{item.title}</h1>
        <p>{item.description}</p>
      </div>
      <div className="flex gap-2 items-center">
        <input
          type="checkbox"
          checked={item.isCompleted}
          onChange={handleComplete}
          disabled={loading || item.isCompleted}
        />
        {item.isCompleted && (
          <button
            onClick={handleDelete}
            className="text-red-500 hover:underline disabled:opacity-50"
            disabled={loading}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
