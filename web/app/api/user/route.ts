import { getProgram } from "@/app/util/getProgramBackend";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { user } = await req.json();
  const userKey = new PublicKey(user);
  const program = getProgram();

  const [userPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("user"), userKey.toBuffer()],
    program.programId
  );

  const ix = await program.methods
    .initializeUser()
    .accounts({
      user: userKey,
    })
    .instruction();

  const tx = new Transaction().add(ix);
  tx.feePayer = userKey;
  tx.recentBlockhash = (await program.provider.connection.getLatestBlockhash()).blockhash;

  return Response.json({
    transaction: tx.serialize({ requireAllSignatures: false }).toString("base64"),
    message: "Sign this transaction to initialize user",
  });
}
