// Network Configuration for Ethereum Sepolia Testnet
export const SEPOLIA_CONFIG = {
    chainId: 11155111,
    chainIdHex: '0xaa36a7',
    chainName: 'Sepolia',
    nativeCurrency: {
        name: 'Sepolia Ether',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: ['https://eth-sepolia.g.alchemy.com/v2/_JJxS_y41ePFKtEgApvblp6sBbm_njoi', 'https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
};

// USDC Contract on Ethereum Sepolia
// Note: This is the Circle USDC address on Sepolia
export const USDC_CONFIG = {
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Official USDC on Sepolia
    decimals: 6,
    symbol: 'USDC',
};

// ERC20 ABI for transfer function
export const ERC20_ABI = [
    {
        constant: false,
        inputs: [
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' },
        ],
        name: 'transfer',
        outputs: [{ name: '', type: 'bool' }],
        type: 'function',
    },
    {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function',
    },
    {
        constant: true,
        inputs: [],
        name: 'decimals',
        outputs: [{ name: '', type: 'uint8' }],
        type: 'function',
    },
    // Transfer event for verification
    {
        anonymous: false,
        inputs: [
            { indexed: true, name: 'from', type: 'address' },
            { indexed: true, name: 'to', type: 'address' },
            { indexed: false, name: 'value', type: 'uint256' },
        ],
        name: 'Transfer',
        type: 'event',
    },
];

// RPC URL for server-side verification
export const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';

// HTTP 402 Headers (Following x402 Protocol)
export const X402_HEADERS = {
    PAYMENT_REQUIRED: 'X-Payment-Required',
    PAYMENT_SIGNATURE: 'X-Payment-Signature',
    PAYMENT_RESPONSE: 'X-Payment-Response',
    WALLET_ADDRESS: 'X-Wallet-Address',
};
