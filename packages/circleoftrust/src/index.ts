import { Buffer } from "buffer";
import { Address } from '@stellar/stellar-sdk';
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from '@stellar/stellar-sdk/contract';
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from '@stellar/stellar-sdk/contract';
export * from '@stellar/stellar-sdk'
export * as contract from '@stellar/stellar-sdk/contract'
export * as rpc from '@stellar/stellar-sdk/rpc'

if (typeof window !== 'undefined') {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CCVE2TAXEBLVZJFVEQIMBLJUH4CXOO2KQCIX6DQRSDIC7JKIWDU4Y4MD",
  }
} as const


export interface Circle {
  betrayed: boolean;
  betrayer: Option<string>;
  creator: string;
  member_count: u32;
  name: string;
  password_hash: Buffer;
  total_kale_earned: i128;
}


export interface CircleInfo {
  betrayed: boolean;
  circle_id: u32;
  creator: string;
  member_count: u32;
  name: string;
  total_kale_earned: i128;
}


export interface HarvestResult {
  failed_harvests: u32;
  successful_circles: u32;
  total_distributed: i128;
}


export interface PlayerEarnings {
  address: string;
  kale_earned_from_betrayals: i128;
  kale_earned_from_join_circles: i128;
  kale_earned_from_own_circles: i128;
  total_kale_earned: i128;
}


export interface CircleEarnings {
  average_per_harvest: i128;
  circle_id: u32;
  last_harvest_amount: i128;
  total_earned: i128;
  total_harvests: u32;
}


export interface PlayerStats {
  address: string;
  circles_betrayed: u32;
  circles_created: u32;
  circles_joined: u32;
  times_betrayed: u32;
  total_kale_earned: i128;
}


export interface ScoreboardEntry {
  address: string;
  betrayal_ratio: u32;
  circles_betrayed: u32;
  circles_created: u32;
  circles_joined: u32;
  kale_per_circle: i128;
  times_betrayed: u32;
  total_kale_earned: i128;
  trust_score: i32;
}

export type DataKey = {tag: "Circle", values: readonly [u32]} | {tag: "WalletCircle", values: readonly [string]} | {tag: "NextCircleId", values: void} | {tag: "CreatedCircle", values: readonly [string]} | {tag: "CircleMembers", values: readonly [u32]} | {tag: "AllCircleIds", values: void} | {tag: "PlayerStats", values: readonly [string]} | {tag: "AllPlayers", values: void} | {tag: "PlayerEarnings", values: readonly [string]} | {tag: "CircleEarnings", values: readonly [u32]} | {tag: "TotalKaleEarned", values: void};

export const Errors = {
  1: {message:"AlreadyCreatedCircle"},
  2: {message:"CircleDoesNotExist"},
  3: {message:"CircleBetrayed"},
  4: {message:"WrongPassword"},
  5: {message:"AlreadyInCircle"},
  6: {message:"LongPassword"},
  7: {message:"NotOwner"},
  9: {message:"HarvestFailed"},
  10: {message:"CannotJoinOwnCircle"},
  11: {message:"CannotBetrayOwnCircle"},
  12: {message:"TokenTransferFailed"},
  13: {message:"InvalidAmount"}
}

export interface Client {
  /**
   * Construct and simulate a create_circle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_circle: ({creator, name, password_hash}: {creator: string, name: string, password_hash: Buffer}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a join_circle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Join an existing circle with the correct password
   */
  join_circle: ({joiner, circle_id, password}: {joiner: string, circle_id: u32, password: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<boolean>>>

  /**
   * Construct and simulate a betray_circle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Betray the circle the caller has joined
   */
  betray_circle: ({betrayer, circle_id, password}: {betrayer: string, circle_id: u32, password: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<boolean>>>

  /**
   * Construct and simulate a set_password transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Set a new password for a circle (only creator can do this)
   */
  set_password: ({caller, circle_id, password_hash}: {caller: string, circle_id: u32, password_hash: Buffer}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Result<boolean>>>

  /**
   * Construct and simulate a harvest_and_distribute_all transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Robust harvest and distribution with comprehensive error handling and earnings tracking
   */
  harvest_and_distribute_all: ({caller, index}: {caller: string, index: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<HarvestResult>>

  /**
   * Construct and simulate a get_scoreboard transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the complete scoreboard with all player statistics including earnings
   */
  get_scoreboard: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<ScoreboardEntry>>>

  /**
   * Construct and simulate a get_player_stats transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get statistics for a specific player
   */
  get_player_stats: ({player}: {player: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Option<PlayerStats>>>

  /**
   * Construct and simulate a get_player_earnings transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get detailed earnings for a specific player
   */
  get_player_earnings: ({player}: {player: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Option<PlayerEarnings>>>

  /**
   * Construct and simulate a get_circle_earnings transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get earnings for a specific circle
   */
  get_circle_earnings: ({circle_id}: {circle_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Option<CircleEarnings>>>

  /**
   * Construct and simulate a get_total_kale_earned transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get total KALE earned across all circles
   */
  get_total_kale_earned: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_top_earning_circles transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get top earning circles
   */
  get_top_earning_circles: ({limit}: {limit: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<CircleEarnings>>>

  /**
   * Construct and simulate a get_total_stats transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get total participation statistics including earnings
   */
  get_total_stats: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<readonly [u32, u32, u32, u32, i128]>>

  /**
   * Construct and simulate a get_circle_info transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get circle information including member count and earnings
   */
  get_circle_info: ({circle_id}: {circle_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Option<readonly [string, boolean, string, u32, i128]>>>

  /**
   * Construct and simulate a get_all_circles transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all created circles with earnings information
   */
  get_all_circles: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<CircleInfo>>>

  /**
   * Construct and simulate a get_owner_circle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get Circle information based on owner information with earnings
   */
  get_owner_circle: ({wallet}: {wallet: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Option<readonly [string, boolean, string, u32, u32, i128]>>>

  /**
   * Construct and simulate a get_wallet_circles transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all circles a wallet has joined
   */
  get_wallet_circles: ({wallet}: {wallet: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<u32>>>

  /**
   * Construct and simulate a get_circle_members transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all members of a circle
   */
  get_circle_members: ({circle_id}: {circle_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<string>>>

  /**
   * Construct and simulate a is_in_circle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Check if a wallet is in any circle
   */
  is_in_circle: ({wallet}: {wallet: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a is_in_specific_circle transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Check if a wallet is in a specific circle
   */
  is_in_specific_circle: ({wallet, circle_id}: {wallet: string, circle_id: u32}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a hello transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Original hello function (keeping for compatibility)
   */
  hello: ({to}: {to: string}, options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<Array<string>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAABkNpcmNsZQAAAAAABwAAAAAAAAAIYmV0cmF5ZWQAAAABAAAAAAAAAAhiZXRyYXllcgAAA+gAAAATAAAAAAAAAAdjcmVhdG9yAAAAABMAAAAAAAAADG1lbWJlcl9jb3VudAAAAAQAAAAAAAAABG5hbWUAAAAQAAAAAAAAAA1wYXNzd29yZF9oYXNoAAAAAAAD7gAAACAAAAAAAAAAEXRvdGFsX2thbGVfZWFybmVkAAAAAAAACw==",
        "AAAAAQAAAAAAAAAAAAAACkNpcmNsZUluZm8AAAAAAAYAAAAAAAAACGJldHJheWVkAAAAAQAAAAAAAAAJY2lyY2xlX2lkAAAAAAAABAAAAAAAAAAHY3JlYXRvcgAAAAATAAAAAAAAAAxtZW1iZXJfY291bnQAAAAEAAAAAAAAAARuYW1lAAAAEAAAAAAAAAARdG90YWxfa2FsZV9lYXJuZWQAAAAAAAAL",
        "AAAAAQAAAAAAAAAAAAAADUhhcnZlc3RSZXN1bHQAAAAAAAADAAAAAAAAAA9mYWlsZWRfaGFydmVzdHMAAAAABAAAAAAAAAASc3VjY2Vzc2Z1bF9jaXJjbGVzAAAAAAAEAAAAAAAAABF0b3RhbF9kaXN0cmlidXRlZAAAAAAAAAs=",
        "AAAAAQAAAAAAAAAAAAAADlBsYXllckVhcm5pbmdzAAAAAAAFAAAAAAAAAAdhZGRyZXNzAAAAABMAAAAAAAAAGmthbGVfZWFybmVkX2Zyb21fYmV0cmF5YWxzAAAAAAALAAAAAAAAAB1rYWxlX2Vhcm5lZF9mcm9tX2pvaW5fY2lyY2xlcwAAAAAAAAsAAAAAAAAAHGthbGVfZWFybmVkX2Zyb21fb3duX2NpcmNsZXMAAAALAAAAAAAAABF0b3RhbF9rYWxlX2Vhcm5lZAAAAAAAAAs=",
        "AAAAAQAAAAAAAAAAAAAADkNpcmNsZUVhcm5pbmdzAAAAAAAFAAAAAAAAABNhdmVyYWdlX3Blcl9oYXJ2ZXN0AAAAAAsAAAAAAAAACWNpcmNsZV9pZAAAAAAAAAQAAAAAAAAAE2xhc3RfaGFydmVzdF9hbW91bnQAAAAACwAAAAAAAAAMdG90YWxfZWFybmVkAAAACwAAAAAAAAAOdG90YWxfaGFydmVzdHMAAAAAAAQ=",
        "AAAAAQAAAAAAAAAAAAAAC1BsYXllclN0YXRzAAAAAAYAAAAAAAAAB2FkZHJlc3MAAAAAEwAAAAAAAAAQY2lyY2xlc19iZXRyYXllZAAAAAQAAAAAAAAAD2NpcmNsZXNfY3JlYXRlZAAAAAAEAAAAAAAAAA5jaXJjbGVzX2pvaW5lZAAAAAAABAAAAAAAAAAOdGltZXNfYmV0cmF5ZWQAAAAAAAQAAAAAAAAAEXRvdGFsX2thbGVfZWFybmVkAAAAAAAACw==",
        "AAAAAQAAAAAAAAAAAAAAD1Njb3JlYm9hcmRFbnRyeQAAAAAJAAAAAAAAAAdhZGRyZXNzAAAAABMAAAAAAAAADmJldHJheWFsX3JhdGlvAAAAAAAEAAAAAAAAABBjaXJjbGVzX2JldHJheWVkAAAABAAAAAAAAAAPY2lyY2xlc19jcmVhdGVkAAAAAAQAAAAAAAAADmNpcmNsZXNfam9pbmVkAAAAAAAEAAAAAAAAAA9rYWxlX3Blcl9jaXJjbGUAAAAACwAAAAAAAAAOdGltZXNfYmV0cmF5ZWQAAAAAAAQAAAAAAAAAEXRvdGFsX2thbGVfZWFybmVkAAAAAAAACwAAAAAAAAALdHJ1c3Rfc2NvcmUAAAAABQ==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAACwAAAAEAAAAAAAAABkNpcmNsZQAAAAAAAQAAAAQAAAABAAAAAAAAAAxXYWxsZXRDaXJjbGUAAAABAAAAEwAAAAAAAAAAAAAADE5leHRDaXJjbGVJZAAAAAEAAAAAAAAADUNyZWF0ZWRDaXJjbGUAAAAAAAABAAAAEwAAAAEAAAAAAAAADUNpcmNsZU1lbWJlcnMAAAAAAAABAAAABAAAAAAAAAAAAAAADEFsbENpcmNsZUlkcwAAAAEAAAAAAAAAC1BsYXllclN0YXRzAAAAAAEAAAATAAAAAAAAAAAAAAAKQWxsUGxheWVycwAAAAAAAQAAAAAAAAAOUGxheWVyRWFybmluZ3MAAAAAAAEAAAATAAAAAQAAAAAAAAAOQ2lyY2xlRWFybmluZ3MAAAAAAAEAAAAEAAAAAAAAAAAAAAAPVG90YWxLYWxlRWFybmVkAA==",
        "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAADAAAAAAAAAAUQWxyZWFkeUNyZWF0ZWRDaXJjbGUAAAABAAAAAAAAABJDaXJjbGVEb2VzTm90RXhpc3QAAAAAAAIAAAAAAAAADkNpcmNsZUJldHJheWVkAAAAAAADAAAAAAAAAA1Xcm9uZ1Bhc3N3b3JkAAAAAAAABAAAAAAAAAAPQWxyZWFkeUluQ2lyY2xlAAAAAAUAAAAAAAAADExvbmdQYXNzd29yZAAAAAYAAAAAAAAACE5vdE93bmVyAAAABwAAAAAAAAANSGFydmVzdEZhaWxlZAAAAAAAAAkAAAAAAAAAE0Nhbm5vdEpvaW5Pd25DaXJjbGUAAAAACgAAAAAAAAAVQ2Fubm90QmV0cmF5T3duQ2lyY2xlAAAAAAAACwAAAAAAAAATVG9rZW5UcmFuc2ZlckZhaWxlZAAAAAAMAAAAAAAAAA1JbnZhbGlkQW1vdW50AAAAAAAADQ==",
        "AAAAAAAAAAAAAAANY3JlYXRlX2NpcmNsZQAAAAAAAAMAAAAAAAAAB2NyZWF0b3IAAAAAEwAAAAAAAAAEbmFtZQAAABAAAAAAAAAADXBhc3N3b3JkX2hhc2gAAAAAAAPuAAAAIAAAAAEAAAPpAAAABAAAAAM=",
        "AAAAAAAAADFKb2luIGFuIGV4aXN0aW5nIGNpcmNsZSB3aXRoIHRoZSBjb3JyZWN0IHBhc3N3b3JkAAAAAAAAC2pvaW5fY2lyY2xlAAAAAAMAAAAAAAAABmpvaW5lcgAAAAAAEwAAAAAAAAAJY2lyY2xlX2lkAAAAAAAABAAAAAAAAAAIcGFzc3dvcmQAAAAQAAAAAQAAA+kAAAABAAAAAw==",
        "AAAAAAAAACdCZXRyYXkgdGhlIGNpcmNsZSB0aGUgY2FsbGVyIGhhcyBqb2luZWQAAAAADWJldHJheV9jaXJjbGUAAAAAAAADAAAAAAAAAAhiZXRyYXllcgAAABMAAAAAAAAACWNpcmNsZV9pZAAAAAAAAAQAAAAAAAAACHBhc3N3b3JkAAAAEAAAAAEAAAPpAAAAAQAAAAM=",
        "AAAAAAAAADpTZXQgYSBuZXcgcGFzc3dvcmQgZm9yIGEgY2lyY2xlIChvbmx5IGNyZWF0b3IgY2FuIGRvIHRoaXMpAAAAAAAMc2V0X3Bhc3N3b3JkAAAAAwAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAljaXJjbGVfaWQAAAAAAAAEAAAAAAAAAA1wYXNzd29yZF9oYXNoAAAAAAAD7gAAACAAAAABAAAD6QAAAAEAAAAD",
        "AAAAAAAAAFdSb2J1c3QgaGFydmVzdCBhbmQgZGlzdHJpYnV0aW9uIHdpdGggY29tcHJlaGVuc2l2ZSBlcnJvciBoYW5kbGluZyBhbmQgZWFybmluZ3MgdHJhY2tpbmcAAAAAGmhhcnZlc3RfYW5kX2Rpc3RyaWJ1dGVfYWxsAAAAAAACAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAAAAAABWluZGV4AAAAAAAABAAAAAEAAAfQAAAADUhhcnZlc3RSZXN1bHQAAAA=",
        "AAAAAAAAAElHZXQgdGhlIGNvbXBsZXRlIHNjb3JlYm9hcmQgd2l0aCBhbGwgcGxheWVyIHN0YXRpc3RpY3MgaW5jbHVkaW5nIGVhcm5pbmdzAAAAAAAADmdldF9zY29yZWJvYXJkAAAAAAAAAAAAAQAAA+oAAAfQAAAAD1Njb3JlYm9hcmRFbnRyeQA=",
        "AAAAAAAAACRHZXQgc3RhdGlzdGljcyBmb3IgYSBzcGVjaWZpYyBwbGF5ZXIAAAAQZ2V0X3BsYXllcl9zdGF0cwAAAAEAAAAAAAAABnBsYXllcgAAAAAAEwAAAAEAAAPoAAAH0AAAAAtQbGF5ZXJTdGF0cwA=",
        "AAAAAAAAACtHZXQgZGV0YWlsZWQgZWFybmluZ3MgZm9yIGEgc3BlY2lmaWMgcGxheWVyAAAAABNnZXRfcGxheWVyX2Vhcm5pbmdzAAAAAAEAAAAAAAAABnBsYXllcgAAAAAAEwAAAAEAAAPoAAAH0AAAAA5QbGF5ZXJFYXJuaW5ncwAA",
        "AAAAAAAAACJHZXQgZWFybmluZ3MgZm9yIGEgc3BlY2lmaWMgY2lyY2xlAAAAAAATZ2V0X2NpcmNsZV9lYXJuaW5ncwAAAAABAAAAAAAAAAljaXJjbGVfaWQAAAAAAAAEAAAAAQAAA+gAAAfQAAAADkNpcmNsZUVhcm5pbmdzAAA=",
        "AAAAAAAAAChHZXQgdG90YWwgS0FMRSBlYXJuZWQgYWNyb3NzIGFsbCBjaXJjbGVzAAAAFWdldF90b3RhbF9rYWxlX2Vhcm5lZAAAAAAAAAAAAAABAAAACw==",
        "AAAAAAAAABdHZXQgdG9wIGVhcm5pbmcgY2lyY2xlcwAAAAAXZ2V0X3RvcF9lYXJuaW5nX2NpcmNsZXMAAAAAAQAAAAAAAAAFbGltaXQAAAAAAAAEAAAAAQAAA+oAAAfQAAAADkNpcmNsZUVhcm5pbmdzAAA=",
        "AAAAAAAAADVHZXQgdG90YWwgcGFydGljaXBhdGlvbiBzdGF0aXN0aWNzIGluY2x1ZGluZyBlYXJuaW5ncwAAAAAAAA9nZXRfdG90YWxfc3RhdHMAAAAAAAAAAAEAAAPtAAAABQAAAAQAAAAEAAAABAAAAAQAAAAL",
        "AAAAAAAAADpHZXQgY2lyY2xlIGluZm9ybWF0aW9uIGluY2x1ZGluZyBtZW1iZXIgY291bnQgYW5kIGVhcm5pbmdzAAAAAAAPZ2V0X2NpcmNsZV9pbmZvAAAAAAEAAAAAAAAACWNpcmNsZV9pZAAAAAAAAAQAAAABAAAD6AAAA+0AAAAFAAAAEAAAAAEAAAATAAAABAAAAAs=",
        "AAAAAAAAADFHZXQgYWxsIGNyZWF0ZWQgY2lyY2xlcyB3aXRoIGVhcm5pbmdzIGluZm9ybWF0aW9uAAAAAAAAD2dldF9hbGxfY2lyY2xlcwAAAAAAAAAAAQAAA+oAAAfQAAAACkNpcmNsZUluZm8AAA==",
        "AAAAAAAAAD9HZXQgQ2lyY2xlIGluZm9ybWF0aW9uIGJhc2VkIG9uIG93bmVyIGluZm9ybWF0aW9uIHdpdGggZWFybmluZ3MAAAAAEGdldF9vd25lcl9jaXJjbGUAAAABAAAAAAAAAAZ3YWxsZXQAAAAAABMAAAABAAAD6AAAA+0AAAAGAAAAEAAAAAEAAAATAAAABAAAAAQAAAAL",
        "AAAAAAAAACNHZXQgYWxsIGNpcmNsZXMgYSB3YWxsZXQgaGFzIGpvaW5lZAAAAAASZ2V0X3dhbGxldF9jaXJjbGVzAAAAAAABAAAAAAAAAAZ3YWxsZXQAAAAAABMAAAABAAAD6gAAAAQ=",
        "AAAAAAAAABtHZXQgYWxsIG1lbWJlcnMgb2YgYSBjaXJjbGUAAAAAEmdldF9jaXJjbGVfbWVtYmVycwAAAAAAAQAAAAAAAAAJY2lyY2xlX2lkAAAAAAAABAAAAAEAAAPqAAAAEw==",
        "AAAAAAAAACJDaGVjayBpZiBhIHdhbGxldCBpcyBpbiBhbnkgY2lyY2xlAAAAAAAMaXNfaW5fY2lyY2xlAAAAAQAAAAAAAAAGd2FsbGV0AAAAAAATAAAAAQAAAAE=",
        "AAAAAAAAAClDaGVjayBpZiBhIHdhbGxldCBpcyBpbiBhIHNwZWNpZmljIGNpcmNsZQAAAAAAABVpc19pbl9zcGVjaWZpY19jaXJjbGUAAAAAAAACAAAAAAAAAAZ3YWxsZXQAAAAAABMAAAAAAAAACWNpcmNsZV9pZAAAAAAAAAQAAAABAAAAAQ==",
        "AAAAAAAAADNPcmlnaW5hbCBoZWxsbyBmdW5jdGlvbiAoa2VlcGluZyBmb3IgY29tcGF0aWJpbGl0eSkAAAAABWhlbGxvAAAAAAAAAQAAAAAAAAACdG8AAAAAABAAAAABAAAD6gAAABA=" ]),
      options
    )
  }
  public readonly fromJSON = {
    create_circle: this.txFromJSON<Result<u32>>,
        join_circle: this.txFromJSON<Result<boolean>>,
        betray_circle: this.txFromJSON<Result<boolean>>,
        set_password: this.txFromJSON<Result<boolean>>,
        harvest_and_distribute_all: this.txFromJSON<HarvestResult>,
        get_scoreboard: this.txFromJSON<Array<ScoreboardEntry>>,
        get_player_stats: this.txFromJSON<Option<PlayerStats>>,
        get_player_earnings: this.txFromJSON<Option<PlayerEarnings>>,
        get_circle_earnings: this.txFromJSON<Option<CircleEarnings>>,
        get_total_kale_earned: this.txFromJSON<i128>,
        get_top_earning_circles: this.txFromJSON<Array<CircleEarnings>>,
        get_total_stats: this.txFromJSON<readonly [u32, u32, u32, u32, i128]>,
        get_circle_info: this.txFromJSON<Option<readonly [string, boolean, string, u32, i128]>>,
        get_all_circles: this.txFromJSON<Array<CircleInfo>>,
        get_owner_circle: this.txFromJSON<Option<readonly [string, boolean, string, u32, u32, i128]>>,
        get_wallet_circles: this.txFromJSON<Array<u32>>,
        get_circle_members: this.txFromJSON<Array<string>>,
        is_in_circle: this.txFromJSON<boolean>,
        is_in_specific_circle: this.txFromJSON<boolean>,
        hello: this.txFromJSON<Array<string>>
  }
}