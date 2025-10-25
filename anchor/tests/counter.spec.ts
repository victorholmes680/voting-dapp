import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';
import { Voting } from '../target/types/voting';
import { startAnchor} from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";

const IDL = require('../target/idl/voting.json');

const votingAddress =new PublicKey("D7KJzxzV5Cby8bVnXVKHHDLc66dGrbiyzuW1dBfrQiRf");
describe('voting', () => {   
  let context;
  let provider;
  let votingProgram;

  beforeAll(async()=> {
    context = await startAnchor("",[{name:"voting",programId:votingAddress}],[]);
    provider = new BankrunProvider(context); 
    votingProgram = new Program<Voting>(IDL, provider);
  })

  it("Initalize Voting", async () => {
    await votingProgram.methods.initializePoll(
      new anchor.BN(1), 
      "What is your favorite peanut butter flavor?", 
      new anchor.BN(1761385554), 
      new anchor.BN(1861385554),
    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    console.log(poll);

    expect(poll.pollId.toNumber()).toBe(1);
    expect(poll.description).toBe("What is your favorite peanut butter flavor?");
    expect(poll.pollStart.toNumber()).toBe(1761385554);
    expect(poll.pollEnd.toNumber()).toBe(1861385554);
    expect(poll.candidateAmount.toNumber()).toBe(0);
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());


  });


  it("Initialize Candidate", async () => {  
    await votingProgram.methods.initializeCandidate(
      "Smooth",
      new anchor.BN(1),
    ).rpc();
    await votingProgram.methods.initializeCandidate(
      "Crunchy",
      new anchor.BN(1),
    ).rpc();
  });

  it("vote", async () => {
  })
});
