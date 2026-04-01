import {
  initializeSDK,
  connect,
  disconnect,
  getAddress,
  isConnected,
  signMessage,
  signAndSendTransaction,
} from './phantom';

import { 
  initializeConnection, 
  getBalance, 
  isValidSolanaAddress,
  getExplorerUrl,
} from './solana';

import {
  initializeUI,
  showConnectView,
  showAccountView,
  showLoading,
  hideLoading,
  showError,
  hideError,
  updateBalance,
  setBalanceLoading,
  clearBalanceLoading,
  getConnectGoogleButton,
  getConnectAppleButton,
  getConnectExtensionButton,
  getDisconnectButton,
  getCopyButton,
  getRefreshButton,
  getSignMessageButton,
  getSendSolButton,
  handleCopyAddress,
  resetUI,
  showSignatureResult,
  clearSignatureResult,
  showTransactionResult,
  clearTransactionResult,
  getMessageInput,
  getRecipientInput,
  getAmountInput,
} from './ui';

import { 
  Transaction, 
  SystemProgram, 
  PublicKey, 
  LAMPORTS_PER_SOL 
} from '@solana/web3.js';

// App state
let currentAddress: string | null = null;
let balanceRefreshInterval: number | null = null;

// Initialize theme from localStorage (defaults to light)
function initializeTheme(): void {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
}

// Apply theme and update icon visibility
function setTheme(theme: string): void {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  const lightIcon = document.getElementById('theme-icon-light');
  const darkIcon = document.getElementById('theme-icon-dark');
  
  // Toggle icon visibility based on theme
  if (theme === 'dark') {
    if (lightIcon) lightIcon.style.display = 'none';
    if (darkIcon) darkIcon.style.display = 'block';
  } else {
    if (lightIcon) lightIcon.style.display = 'block';
    if (darkIcon) darkIcon.style.display = 'none';
  }
}

// Toggle between light and dark themes
function toggleTheme(): void {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

// Main app initialization
async function initializeApp(): Promise<void> {
  try {
    console.log('Initializing app...');

    // Initialize all systems
    initializeTheme();
    initializeUI();
    initializeSDK();
    initializeConnection();
    setupEventListeners();

    // Show loading while checking for existing session
    showLoading('Loading...');

    // Check if SDK has an existing session
    if (isConnected()) {
      console.log('Existing session detected');
      
      // Try to retrieve addresses using the 'phantom' provider for existing sessions
      try {
        const address = await connect('google');
        if (address) {
          currentAddress = address;
          await loadAccountData();
          hideLoading();
          console.log('App initialized - session restored');
          return;
        }
      } catch (err) {
        console.log('Session retrieval needed manual connect:', err);
      }
    }
    
    // Clean URL if there are OAuth callback params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('response_type') || urlParams.has('wallet_id') || 
        urlParams.has('code') || urlParams.has('state')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // No session - show login view
    hideLoading();
    showConnectView();
    console.log('App initialized - no session');
  } catch (error) {
    console.error('Initialization failed:', error);
    hideLoading();
    showError('Failed to initialize. Please refresh the page.');
  }
}

// Set up all event listeners
function setupEventListeners(): void {
  // Social login buttons
  getConnectGoogleButton().addEventListener('click', () => handleConnect('google'));
  getConnectAppleButton().addEventListener('click', () => handleConnect('apple'));
  
  // Extension/injected wallet button (optional, may not exist)
  const extensionBtn = getConnectExtensionButton();
  if (extensionBtn) {
    extensionBtn.addEventListener('click', () => handleConnect('injected'));
  }
  
  // Account actions
  getDisconnectButton().addEventListener('click', handleDisconnect);
  getCopyButton().addEventListener('click', handleCopyClick);
  getRefreshButton().addEventListener('click', handleRefreshBalance);

  // New feature buttons
  const signMsgBtn = getSignMessageButton();
  if (signMsgBtn) {
    signMsgBtn.addEventListener('click', handleSignMessage);
  }
  
  const sendSolBtn = getSendSolButton();
  if (sendSolBtn) {
    sendSolBtn.addEventListener('click', handleSendSol);
  }

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

// Handle social login button clicks
async function handleConnect(provider: 'google' | 'apple' | 'injected' | 'deeplink'): Promise<void> {
  try {
    hideError();
    const providerName = provider === 'injected' ? 'Extension' : provider.charAt(0).toUpperCase() + provider.slice(1);
    showLoading(`Connecting with ${providerName}...`);

    // Trigger connection with selected provider
    // For OAuth providers, this will redirect the user
    const address = await connect(provider);

    if (!address) {
      throw new Error('No address returned');
    }

    currentAddress = address;
    hideLoading();
    await loadAccountData();
  } catch (error) {
    console.error('Connection error:', error);
    hideLoading();
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Connection failed. Please try again.';
    
    showError(errorMessage);
  }
}

// Handle logout button click
async function handleDisconnect(): Promise<void> {
  try {
    hideError();
    showLoading('Logging out...');

    // Stop balance polling and disconnect
    stopBalanceAutoRefresh();
    await disconnect();

    currentAddress = null;

    hideLoading();
    resetUI();
  } catch (error) {
    console.error('Logout error:', error);
    hideLoading();
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Logout failed. Please try again.';
    
    showError(errorMessage);
  }
}

// Handle copy address button click
async function handleCopyClick(): Promise<void> {
  if (!currentAddress) {
    showError('No address to copy');
    return;
  }

  try {
    await handleCopyAddress(currentAddress);
  } catch (error) {
    console.error('Copy error:', error);
  }
}

// Handle refresh balance button click
async function handleRefreshBalance(): Promise<void> {
  if (!currentAddress) {
    showError('No connected account');
    return;
  }

  try {
    hideError();
    await fetchAndDisplayBalance(currentAddress);
  } catch (error) {
    console.error('Refresh error:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Refresh failed. Please try again.';
    
    showError(errorMessage);
  }
}

// Handle sign message button click
async function handleSignMessage(): Promise<void> {
  try {
    hideError();
    clearSignatureResult();
    
    const messageInput = getMessageInput();
    const message = messageInput?.value?.trim();
    
    if (!message) {
      showError('Please enter a message to sign');
      return;
    }
    
    showLoading('Signing message...');
    
    const result = await signMessage(message);
    
    hideLoading();
    showSignatureResult(result.signature);
  } catch (error) {
    console.error('Sign message error:', error);
    hideLoading();
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to sign message. Please try again.';
    
    showError(errorMessage);
  }
}

// Handle send SOL button click
async function handleSendSol(): Promise<void> {
  try {
    hideError();
    clearTransactionResult();
    
    const recipientInput = getRecipientInput();
    const amountInput = getAmountInput();
    
    const recipient = recipientInput?.value?.trim();
    const amountStr = amountInput?.value?.trim();
    
    // Validate inputs
    if (!recipient) {
      showError('Please enter a recipient address');
      return;
    }
    
    if (!isValidSolanaAddress(recipient)) {
      showError('Invalid Solana address');
      return;
    }
    
    if (!amountStr) {
      showError('Please enter an amount');
      return;
    }
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      showError('Please enter a valid amount');
      return;
    }
    
    if (!currentAddress) {
      showError('No connected account');
      return;
    }
    
    showLoading('Sending transaction...');
    
    // Create transfer transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(currentAddress),
        toPubkey: new PublicKey(recipient),
        lamports: Math.floor(amount * LAMPORTS_PER_SOL),
      })
    );
    
    // Sign and send using SDK
    const result = await signAndSendTransaction(transaction);
    
    hideLoading();
    
    // Show transaction result with explorer link
    const explorerUrl = getExplorerUrl(result.signature, 'mainnet-beta');
    showTransactionResult(result.signature, explorerUrl);
    
    // Refresh balance after transaction
    await fetchAndDisplayBalance(currentAddress);
    
    // Clear inputs
    if (recipientInput) recipientInput.value = '';
    if (amountInput) amountInput.value = '';
  } catch (error) {
    console.error('Send SOL error:', error);
    hideLoading();
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Transaction failed. Please try again.';
    
    showError(errorMessage);
  }
}

// Load and display account data (address + balance)
async function loadAccountData(): Promise<void> {
  try {
    const address = getAddress();
    
    if (!address) {
      throw new Error('No connected address');
    }

    currentAddress = address;
    // Show account view first (balance will show "Loading...")
    showAccountView(address);
    // Fetch balance from blockchain
    await fetchAndDisplayBalance(address);
    // Start auto-refresh every 30 seconds
    startBalanceAutoRefresh(address);
  } catch (error) {
    console.error('Load account failed:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to load account.';
    
    showError(errorMessage);
    showConnectView();
  }
}

// Fetch balance from Solana blockchain and update UI
async function fetchAndDisplayBalance(address: string): Promise<void> {
  try {
    setBalanceLoading();
    // Query Solana RPC for balance
    const balance = await getBalance(address);
    updateBalance(balance);
    clearBalanceLoading();
  } catch (error) {
    console.error('Balance fetch failed:', error);
    clearBalanceLoading();
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to fetch balance';
    
    showError(errorMessage);
  }
}

// Start polling for balance updates every 30 seconds
function startBalanceAutoRefresh(address: string): void {
  stopBalanceAutoRefresh();
  
  balanceRefreshInterval = window.setInterval(() => {
    fetchAndDisplayBalance(address);
  }, 30000);
}

// Stop balance polling
function stopBalanceAutoRefresh(): void {
  if (balanceRefreshInterval !== null) {
    clearInterval(balanceRefreshInterval);
    balanceRefreshInterval = null;
  }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
