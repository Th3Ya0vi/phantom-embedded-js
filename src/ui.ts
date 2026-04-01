import { truncateAddress, formatBalance, copyToClipboard } from './solana';

// DOM element references
let connectSection: HTMLElement;
let accountSection: HTMLElement;
let connectGoogleBtn: HTMLButtonElement;
let connectAppleBtn: HTMLButtonElement;
let connectExtensionBtn: HTMLButtonElement | null;
let disconnectBtn: HTMLButtonElement;
let copyBtn: HTMLButtonElement;
let refreshBtn: HTMLButtonElement;
let addressDisplay: HTMLElement;
let balanceDisplay: HTMLElement;
let errorMessage: HTMLElement;
let loadingOverlay: HTMLElement;

// New feature elements
let signMessageBtn: HTMLButtonElement | null;
let messageInput: HTMLInputElement | null;
let signatureResult: HTMLElement | null;
let sendSolBtn: HTMLButtonElement | null;
let recipientInput: HTMLInputElement | null;
let amountInput: HTMLInputElement | null;
let transactionResult: HTMLElement | null;

// Initialize and cache DOM element references
export function initializeUI(): void {
  // Get all required DOM elements by ID
  connectSection = document.getElementById('connect-section') as HTMLElement;
  accountSection = document.getElementById('account-section') as HTMLElement;
  connectGoogleBtn = document.getElementById('connect-google-btn') as HTMLButtonElement;
  connectAppleBtn = document.getElementById('connect-apple-btn') as HTMLButtonElement;
  connectExtensionBtn = document.getElementById('connect-extension-btn') as HTMLButtonElement | null;
  disconnectBtn = document.getElementById('disconnect-btn') as HTMLButtonElement;
  copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
  refreshBtn = document.getElementById('refresh-btn') as HTMLButtonElement;
  addressDisplay = document.getElementById('address') as HTMLElement;
  balanceDisplay = document.getElementById('balance') as HTMLElement;
  errorMessage = document.getElementById('error-message') as HTMLElement;
  loadingOverlay = document.getElementById('loading-overlay') as HTMLElement;

  // New feature elements (optional, may not exist)
  signMessageBtn = document.getElementById('sign-message-btn') as HTMLButtonElement | null;
  messageInput = document.getElementById('message-input') as HTMLInputElement | null;
  signatureResult = document.getElementById('signature-result') as HTMLElement | null;
  sendSolBtn = document.getElementById('send-sol-btn') as HTMLButtonElement | null;
  recipientInput = document.getElementById('recipient-input') as HTMLInputElement | null;
  amountInput = document.getElementById('amount-input') as HTMLInputElement | null;
  transactionResult = document.getElementById('transaction-result') as HTMLElement | null;

  // Validate core elements exist
  if (!connectSection || !accountSection || !connectGoogleBtn || !connectAppleBtn || 
      !disconnectBtn || !copyBtn || !refreshBtn || !addressDisplay || 
      !balanceDisplay || !errorMessage || !loadingOverlay) {
    throw new Error('Missing required DOM elements');
  }

  console.log('UI initialized');
}

// Show login/connect view
export function showConnectView(): void {
  connectSection.classList.remove('hidden');
  accountSection.classList.add('hidden');
  hideError();
}

// Show account dashboard with address and balance
export function showAccountView(address: string, balance?: number): void {
  connectSection.classList.add('hidden');
  accountSection.classList.remove('hidden');
  
  // Display truncated address with full address on hover
  const truncated = truncateAddress(address);
  addressDisplay.textContent = truncated;
  addressDisplay.title = address;
  
  // Update balance or show loading
  if (balance !== undefined) {
    updateBalance(balance);
  } else {
    balanceDisplay.textContent = 'Loading...';
  }
  
  // Clear any previous results
  clearSignatureResult();
  clearTransactionResult();
  
  hideError();
}

// Update the balance display
export function updateBalance(balance: number): void {
  balanceDisplay.textContent = `${formatBalance(balance)} SOL`;
}

// Show loading overlay with message
export function showLoading(message: string = 'Connecting...'): void {
  loadingOverlay.classList.remove('hidden');
  const loadingText = loadingOverlay.querySelector('p');
  if (loadingText) {
    loadingText.textContent = message;
  }
}

// Hide loading overlay
export function hideLoading(): void {
  loadingOverlay.classList.add('hidden');
}

// Display error message to user
export function showError(message: string): void {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
  console.error(message);
}

// Clear error message
export function hideError(): void {
  errorMessage.classList.add('hidden');
  errorMessage.textContent = '';
}

// Show loading state in balance display
export function setBalanceLoading(): void {
  balanceDisplay.textContent = 'Loading...';
  balanceDisplay.classList.add('loading');
}

// Clear loading state from balance display
export function clearBalanceLoading(): void {
  balanceDisplay.classList.remove('loading');
}

// Button element getters
export function getConnectGoogleButton(): HTMLButtonElement {
  return connectGoogleBtn;
}

export function getConnectAppleButton(): HTMLButtonElement {
  return connectAppleBtn;
}

export function getConnectExtensionButton(): HTMLButtonElement | null {
  return connectExtensionBtn;
}

export function getDisconnectButton(): HTMLButtonElement {
  return disconnectBtn;
}

export function getCopyButton(): HTMLButtonElement {
  return copyBtn;
}

export function getRefreshButton(): HTMLButtonElement {
  return refreshBtn;
}

// New feature button getters
export function getSignMessageButton(): HTMLButtonElement | null {
  return signMessageBtn;
}

export function getSendSolButton(): HTMLButtonElement | null {
  return sendSolBtn;
}

// Input element getters
export function getMessageInput(): HTMLInputElement | null {
  return messageInput;
}

export function getRecipientInput(): HTMLInputElement | null {
  return recipientInput;
}

export function getAmountInput(): HTMLInputElement | null {
  return amountInput;
}

// Copy address to clipboard with visual feedback
export async function handleCopyAddress(address: string): Promise<void> {
  try {
    await copyToClipboard(address);
    
    // Show success feedback
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    copyBtn.classList.add('success');
    
    // Reset after 2 seconds
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.classList.remove('success');
    }, 2000);
  } catch (error) {
    showError('Failed to copy address');
  }
}

// Show signature result
export function showSignatureResult(signature: string): void {
  if (signatureResult) {
    // Truncate signature for display
    const truncated = signature.length > 20 
      ? `${signature.slice(0, 10)}...${signature.slice(-10)}`
      : signature;
    
    signatureResult.innerHTML = `
      <div class="result-content">
        <span class="result-label">Signature:</span>
        <span class="result-value" title="${signature}">${truncated}</span>
        <button class="copy-signature-btn icon-btn" data-signature="${signature}">Copy</button>
      </div>
    `;
    signatureResult.classList.remove('hidden');
    
    // Add copy handler
    const copySignatureBtn = signatureResult.querySelector('.copy-signature-btn');
    if (copySignatureBtn) {
      copySignatureBtn.addEventListener('click', async () => {
        try {
          await copyToClipboard(signature);
          copySignatureBtn.textContent = 'Copied!';
          setTimeout(() => {
            copySignatureBtn.textContent = 'Copy';
          }, 2000);
        } catch (err) {
          showError('Failed to copy signature');
        }
      });
    }
  }
}

// Clear signature result
export function clearSignatureResult(): void {
  if (signatureResult) {
    signatureResult.innerHTML = '';
    signatureResult.classList.add('hidden');
  }
}

// Show transaction result with explorer link
export function showTransactionResult(hash: string, explorerUrl: string): void {
  if (transactionResult) {
    // Truncate hash for display
    const truncated = hash.length > 20 
      ? `${hash.slice(0, 10)}...${hash.slice(-10)}`
      : hash;
    
    transactionResult.innerHTML = `
      <div class="result-content success">
        <span class="result-label">Transaction sent!</span>
        <span class="result-value" title="${hash}">${truncated}</span>
        <a href="${explorerUrl}" target="_blank" rel="noopener noreferrer" class="explorer-link">
          View on Explorer
        </a>
      </div>
    `;
    transactionResult.classList.remove('hidden');
  }
}

// Clear transaction result
export function clearTransactionResult(): void {
  if (transactionResult) {
    transactionResult.innerHTML = '';
    transactionResult.classList.add('hidden');
  }
}

// Reset UI to initial login state
export function resetUI(): void {
  showConnectView();
  addressDisplay.textContent = '';
  balanceDisplay.textContent = 'Loading...';
  clearSignatureResult();
  clearTransactionResult();
  
  // Clear inputs
  if (messageInput) messageInput.value = '';
  if (recipientInput) recipientInput.value = '';
  if (amountInput) amountInput.value = '';
  
  hideError();
  hideLoading();
}
