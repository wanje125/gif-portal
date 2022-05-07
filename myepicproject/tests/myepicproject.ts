import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Myepicproject } from "../target/types/myepicproject";

describe("myepicproject", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Myepicproject as Program<Myepicproject>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({});
    console.log("Your transaction signature", tx);
  });
});
