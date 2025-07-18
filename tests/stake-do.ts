import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StakeDo } from "../target/types/stake_do";

describe("stake-do", () => {

  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.stakeDo as Program<StakeDo>;
  const provider = anchor.getProvider();
  const user = provider.publicKey;

  const [ userPda ] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('user'), user.toBuffer()],
    program.programId
  )


  it("Initilizes the User", async () => {
    const tx = await program.methods
    .initializeUser()
    .accounts({
      user: user,
    })
    .rpc()

    console.log("transaction:", tx)
    const userAccount = await program.account.userAccount.fetch(userPda);
    console.log("UserAccount:", userAccount);

    
  });

  
  it("Initializes the Todo1", async() => {

    const todoId = new anchor.BN(1);
    const [ todoPda ] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('todo'), user.toBuffer(), todoId.toArrayLike(Buffer, "le", 8)],
      program.programId,
    )

    const tx = await program.methods.initializeTodo(
      todoId,
      "Solana tutorial",
      "Complete the Solana tutorial as soon as possible",
      new anchor.BN(Math.floor(Date.now() / 1000) + 86400)

    ).accounts({
      user: user,
      todoAccount: todoPda,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();

    const todoAccount = await program.account.todoAccount.fetch(todoPda)
    console.log(todoAccount)
  })

  it("Initializes the Todo2", async() => {

    const todoId = new anchor.BN(2);
    const [ todoPda ] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('todo'), user.toBuffer(), todoId.toArrayLike(Buffer, "le", 8)],
      program.programId,
    )

    const tx = await program.methods.initializeTodo(
      todoId,
      "Anchor Tutorial",
      "Complte the anchor tutorial and start building projects",
      new anchor.BN(Math.floor(Date.now() / 1000) + 86400)

    ).accounts({
      user: user,
      todoAccount: todoPda,
      systemProgram: anchor.web3.SystemProgram.programId,
    }).rpc();

    const todoAccount = await program.account.todoAccount.fetch(todoPda)
    console.log(todoAccount)
  })

  it("Completes the Todo", async () => {
    const todoId = new anchor.BN(1);
    const [ todoPda ] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('todo'), user.toBuffer(), todoId.toArrayLike(Buffer, "le", 8)],
      program.programId,
    )

    const tx = await program.methods.completeTodo(
      todoId
    ).rpc()

    const todoAccount = await program.account.todoAccount.fetch(todoPda)
    console.log(todoAccount)
  })

  it("Fetches all the user Todos", async () => {
    const todos = await program.account.todoAccount.all([{
      memcmp: {
        offset: 16,
        bytes: user.toBase58()
      }
    }])

    console.log(todos)
  })

  it("Deletes the Todo", async() => {
    const todoId = new anchor.BN(1);
    const [ todoPda ] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from('todo'), user.toBuffer(), todoId.toArrayLike(Buffer, "le", 8)],
      program.programId
    )
    
    const tx = await program.methods.deleteTodo(
      todoId
    ).rpc();

    try {
      const todoAccount = await program.account.todoAccount.fetch(todoPda)
      console.log(todoAccount)
    } catch (error) {
      console.log("Account does not Exist")
    }
  })
  

  
});
