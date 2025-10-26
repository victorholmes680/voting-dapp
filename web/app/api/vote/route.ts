import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Voting } from "@/../anchor/target/types/voting";
import { Program } from "@coral-xyz/anchor";
import * as anchor from '@coral-xyz/anchor';

const IDL = require("@/../anchor/target/idl/voting.json");


export const OPTIONS = GET;


export async function GET(request: Request) {
  const actionMetaData: ActionGetResponse = {
    type: "action",
    title: "Vote for your favorite peanut butter flavor",
    description: "Vote for your favorite peanut butter flavor",
    icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6CmCKKkFb2Wz2iQntrhtOT4IA8SR4BCdyEA&s",
    label: "Vote",
    links: {
      actions: [
        {
          href: "/vote?candidate=Smooth",
          type: "post",
          label: "Smooth",
        },
        {
          href: "/vote?candidate=Crunchy",
          type: "post",
          label: "Crunchy",
        },
      ]
    }
  };
  return Response.json(actionMetaData,{headers:ACTIONS_CORS_HEADERS});
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const candidate = url.searchParams.get("candidate");
  if( candidate!="Crunchy" && candidate!="Smooth"){
    return Response.json({error:"invalid candidate"},{headers:ACTIONS_CORS_HEADERS});
  }

  const connection = new Connection("https://127.0.0.1:8899","confirmed");
  const program: Program<Voting> = new Program(IDL, {connection});

  const body: ActionPostRequest = await request.json();
  let voter; 

  try {
    voter = new PublicKey(body.account);
  } catch (error) {
    return Response.json({error:"invalid account"},{headers:ACTIONS_CORS_HEADERS});
  }

  const instruction = await program.methods
  .vote(candidate, new anchor.BN(1))
  .accounts({
    signer: voter,
  })
  .instruction();

  const blockhash = await connection.getLatestBlockhash();
  const transaction = new Transaction({
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
    feePayer: voter,
  }).add(instruction);

  const response = await createPostResponse({
    fields: {
      transaction: transaction,
      type: "transaction",
    }
  });
  return Response.json(response,{headers:ACTIONS_CORS_HEADERS});
}
