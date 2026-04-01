import { BrowserSDK, AddressType } from '@phantom/browser-sdk';

// SDK instance singleton
let sdk: BrowserSDK | null = null;
let connectedAddress: string | null = null;

// Initialize SDK with new configuration format
export function initializeSDK(): BrowserSDK {
  const appId = import.meta.env.VITE_PHANTOM_APP_ID;
  const redirectUrl = import.meta.env.VITE_REDIRECT_URL || window.location.origin;

  // Validate required configuration
  if (!appId || appId === 'your-app-id-here') {
    throw new Error(
      'Missing Phantom App ID. Set VITE_PHANTOM_APP_ID in .env file. ' +
      'Get your App ID at https://phantom.com/portal'
    );
  }

  // Create SDK with new providers array configuration
  sdk = new BrowserSDK({
    // List of allowed authentication providers
    providers: ['google', 'apple', 'injected', 'deeplink'],
    // Networks to enable
    addressTypes: [AddressType.solana],
    // Required for embedded providers (google, apple, deeplink)
    appId: appId,
    // Auth configuration for OAuth providers
    authOptions: {
      redirectUrl: redirectUrl,
    },
  });

  console.log('Phantom SDK initialized with providers: google, apple, injected, deeplink');
  return sdk;
}

// Get the SDK instance (must be initialized first)
export function getSDK(): BrowserSDK {
  if (!sdk) {
    throw new Error('SDK not initialized. Call initializeSDK() first.');
  }
  return sdk;
}

// Connect with specified provider (google, apple, injected, deeplink)
export async function connect(provider: 'google' | 'apple' | 'injected' | 'deeplink' = 'google'): Promise<string> {
  try {
    const sdkInstance = getSDK();
    console.log(`Starting connection with ${provider}...`);
    
    // Connect with selected provider
    const { addresses } = await sdkInstance.connect({ provider });
    
    // Extract Solana address from result
    const solanaAddress = addresses?.find(
      addr => addr.addressType === AddressType.solana
    );
    
    if (solanaAddress?.address) {
      connectedAddress = solanaAddress.address;
      console.log('Connected:', connectedAddress);
      return connectedAddress;
    }
    
    throw new Error('No Solana address returned from connection');
  } catch (error) {
    console.error('Connection error:', error);
    
    // Re-throw with helpful message
    if (error instanceof Error) {
      throw new Error(`Connection failed: ${error.message}`);
    }
    throw new Error('Failed to connect with Phantom. Please try again.');
  }
}

// Disconnect from Phantom and clear session
export async function disconnect(): Promise<void> {
  try {
    const sdkInstance = getSDK();
    await sdkInstance.disconnect();
    connectedAddress = null;
    console.log('Disconnected successfully');
  } catch (error) {
    console.error('Disconnect failed:', error);
    throw new Error('Failed to disconnect. Please try again.');
  }
}

// Get the cached connected address
export function getAddress(): string | null {
  return connectedAddress;
}

// Set address (used during auto-connect)
export function setAddress(address: string): void {
  connectedAddress = address;
}

// Check if user has an active session
export function isConnected(): boolean {
  try {
    const sdkInstance = getSDK();
    return sdkInstance.isConnected();
  } catch (error) {
    return false;
  }
}

// Helper to convert Uint8Array to hex string
function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper to convert Uint8Array to base58 string
function uint8ArrayToBase58(arr: Uint8Array): string {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  let num = BigInt('0x' + uint8ArrayToHex(arr));
  
  while (num > 0n) {
    const remainder = Number(num % 58n);
    num = num / 58n;
    result = ALPHABET[remainder] + result;
  }
  
  // Handle leading zeros
  for (const byte of arr) {
    if (byte === 0) {
      result = '1' + result;
    } else {
      break;
    }
  }
  
  return result || '1';
}

// Sign a message using Solana wallet
export async function signMessage(message: string): Promise<{ signature: string; rawSignature: string }> {
  try {
    const sdkInstance = getSDK();
    
    if (!sdkInstance.isConnected()) {
      throw new Error('Wallet not connected');
    }
    
    console.log('Signing message...');
    const result = await sdkInstance.solana.signMessage(message);
    console.log('Message signed successfully');
    
    // Convert Uint8Array signature to base58 string
    const signatureBase58 = uint8ArrayToBase58(result.signature);
    const signatureHex = uint8ArrayToHex(result.signature);
    
    return {
      signature: signatureBase58,
      rawSignature: signatureHex,
    };
  } catch (error) {
    console.error('Sign message failed:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to sign message: ${error.message}`);
    }
    throw new Error('Failed to sign message. Please try again.');
  }
}

// Sign and send a Solana transaction
export async function signAndSendTransaction(transaction: any): Promise<{ signature: string }> {
  try {
    const sdkInstance = getSDK();
    
    if (!sdkInstance.isConnected()) {
      throw new Error('Wallet not connected');
    }
    
    console.log('Signing and sending transaction...');
    const result = await sdkInstance.solana.signAndSendTransaction(transaction);
    console.log('Transaction sent:', result.signature);
    
    return { signature: result.signature };
  } catch (error) {
    console.error('Transaction failed:', error);
    if (error instanceof Error) {
      throw new Error(`Transaction failed: ${error.message}`);
    }
    throw new Error('Transaction failed. Please try again.');
  }
}

// Get the Solana public key
export function getPublicKey(): string | null {
  try {
    const sdkInstance = getSDK();
    if (!sdkInstance.isConnected()) return null;
    return sdkInstance.solana.publicKey;
  } catch (error) {
    return null;
  }
}

// Switch Solana network (mainnet, devnet)
export async function switchNetwork(network: 'mainnet' | 'devnet'): Promise<void> {
  try {
    const sdkInstance = getSDK();
    
    if (!sdkInstance.isConnected()) {
      throw new Error('Wallet not connected');
    }
    
    console.log(`Switching to ${network}...`);
    await sdkInstance.solana.switchNetwork(network);
    console.log(`Switched to ${network}`);
  } catch (error) {
    console.error('Network switch failed:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to switch network: ${error.message}`);
    }
    throw new Error('Failed to switch network');
  }
}

// Check Solana connection status
export function isSolanaConnected(): boolean {
  try {
    const sdkInstance = getSDK();
    return sdkInstance.solana.isConnected();
  } catch (error) {
    return false;
  }
}
