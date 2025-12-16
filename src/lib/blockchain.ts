import { ethers } from 'ethers';
import { SEPOLIA_RPC, USDC_CONFIG, ERC20_ABI } from './config';

export interface TransferDetails {
    from: string;
    to: string;
    value: bigint;
    valueFormatted: number;
    blockNumber: number;
    status: boolean;
}

/**
 * Verify a USDC transfer transaction on Ethereum Sepolia
 * This is the core verification logic for the x402 protocol implementation
 */
export async function verifyUSDCTransfer(
    txHash: string,
    expectedRecipient: string,
    expectedAmount: number // in USDC (e.g., 0.5)
): Promise<{ valid: boolean; details?: TransferDetails; error?: string }> {
    try {
        const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);

        // Get transaction receipt
        const receipt = await provider.getTransactionReceipt(txHash);

        if (!receipt) {
            return { valid: false, error: 'Transaction not found or not yet confirmed' };
        }

        if (receipt.status !== 1) {
            return { valid: false, error: 'Transaction failed on-chain' };
        }

        // Check if transaction is to USDC contract
        if (receipt.to?.toLowerCase() !== USDC_CONFIG.address.toLowerCase()) {
            return { valid: false, error: 'Transaction is not a USDC transfer' };
        }

        // Parse the Transfer event from logs
        const usdcInterface = new ethers.Interface(ERC20_ABI);

        let transferFound = false;
        let transferDetails: TransferDetails | undefined;

        for (const log of receipt.logs) {
            try {
                const parsed = usdcInterface.parseLog({
                    topics: log.topics as string[],
                    data: log.data,
                });

                if (parsed && parsed.name === 'Transfer') {
                    const from = parsed.args[0] as string;
                    const to = parsed.args[1] as string;
                    const value = parsed.args[2] as bigint;

                    // Convert value to human-readable format (6 decimals for USDC)
                    const valueFormatted = Number(value) / Math.pow(10, USDC_CONFIG.decimals);

                    transferDetails = {
                        from,
                        to,
                        value,
                        valueFormatted,
                        blockNumber: receipt.blockNumber,
                        status: true,
                    };

                    // Verify recipient and amount
                    if (to.toLowerCase() === expectedRecipient.toLowerCase()) {
                        // Allow small tolerance for floating point
                        if (Math.abs(valueFormatted - expectedAmount) < 0.0001) {
                            transferFound = true;
                            break;
                        }
                    }
                }
            } catch {
                // Skip logs that can't be parsed as Transfer events
                continue;
            }
        }

        if (!transferFound) {
            if (transferDetails) {
                return {
                    valid: false,
                    error: `Transfer found but to wrong recipient or amount. Got: ${transferDetails.to} with ${transferDetails.valueFormatted} USDC`,
                    details: transferDetails,
                };
            }
            return { valid: false, error: 'No valid USDC Transfer event found in transaction' };
        }

        return { valid: true, details: transferDetails };
    } catch (error) {
        console.error('Blockchain verification error:', error);
        return {
            valid: false,
            error: error instanceof Error ? error.message : 'Unknown verification error'
        };
    }
}

/**
 * Get USDC balance for an address
 */
export async function getUSDCBalance(address: string): Promise<number> {
    try {
        const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
        const usdcContract = new ethers.Contract(USDC_CONFIG.address, ERC20_ABI, provider);
        const balance = await usdcContract.balanceOf(address);
        return Number(balance) / Math.pow(10, USDC_CONFIG.decimals);
    } catch (error) {
        console.error('Error getting USDC balance:', error);
        return 0;
    }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(txHash: string): Promise<boolean> {
    try {
        const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
        const receipt = await provider.waitForTransaction(txHash, 1, 60000); // 1 confirmation, 60s timeout
        return receipt !== null && receipt.status === 1;
    } catch (error) {
        console.error('Error waiting for transaction:', error);
        return false;
    }
}
