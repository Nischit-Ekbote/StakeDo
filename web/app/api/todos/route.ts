import { NextRequest } from "next/server";
import * as anchor from "@coral-xyz/anchor";
import { getProgram } from "@/app/util/getProgramBackend";
import { BN } from "bn.js";
import { SystemProgram, PublicKey, Transaction } from "@solana/web3.js";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
    const user = searchParams.get("user")?.trim();


  if (!user) {
    return new Response(JSON.stringify({ error: "User public key required" }), {
      status: 400,
    });
  }

  try {
    const program = getProgram();

    const todos = await program.account.todoAccount.all([
      {
        memcmp: {
          offset: 16,
          bytes: user,
        },
      },
    ]);

    const response = todos.map((t) => ({
      pubkey: t.publicKey.toBase58(),
      ...t.account,
    }));

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Fetch error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { user, todoId, title, description, deadline } = body;
    if (!user || !todoId || !title || !description) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userKey = new PublicKey(user);
    const program = getProgram();

    const [todoPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("todo"), userKey.toBuffer(), new BN(todoId).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Build the transaction
    const ix = await program.methods
      .initializeTodo(
        new BN(todoId),
        title,
        description,
        deadline ? new BN(deadline) : null
      )
      .accounts({
        user: userKey,
      })
      .instruction(); 

    const tx = new Transaction().add(ix);
    tx.feePayer = userKey;
    tx.recentBlockhash = (await program.provider.connection.getLatestBlockhash()).blockhash;

    // Serialize and return base64 transaction
    const serialized = tx.serialize({
      requireAllSignatures: false, // the wallet will sign
    });

    return Response.json({
      todoAccount: todoPda.toBase58(),
      transaction: serialized.toString("base64"),
      message: "Sign this transaction to create a todo",
    });
  } catch (error) {
    console.error("Create Todo Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
