import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { PROGRAM_ID, IDL } from '../utils/constants';

export function useSolanaProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const getProgram = () => {
    if (!wallet.publicKey || !wallet.signTransaction) throw new Error('Wallet not connected');
    const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
    return new Program(IDL as any, provider);
  };

  const signConsent = async (trialName: string) => {
    const program = getProgram();
    const encoder = new TextEncoder();
    const data = encoder.encode(`Verified Medical Trial Consent v1.0 - ${trialName}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const agreementHash: number[] = Array.from(new Uint8Array(hashBuffer)); // Explicitly define type

    const [consentPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('consent'), wallet.publicKey!.toBuffer()],
      PROGRAM_ID
    );

    return await program.methods
      .signConsent(agreementHash) // No need to cast
      .accounts({
        consentRecord: consentPDA,
        patient: wallet.publicKey!,
        systemProgram: SystemProgram.programId,
      }).rpc();
  };

  const rewardPatient = async (patientPubkey: PublicKey, amount: number) => {
    const program = getProgram();
    const [vaultPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), patientPubkey.toBuffer()],
      PROGRAM_ID
    );

    await program.methods
      .rewardPatient(amount)
      .accounts({
        patient: patientPubkey,
        vault: vaultPDA,
        systemProgram: SystemProgram.programId,
      }).rpc();

    console.log(`Rewarding patient: ${patientPubkey.toString()} with amount: ${amount}`);
  };

  return { signConsent, rewardPatient };
}