// Initialize Petra wallet
let wallet = null;
let isConnected = false;
const APTOS_EXPLORER_URL = 'https://explorer.aptoslabs.com/transaction/';
const TARGET_WALLET = '0x060605f4a3ff7c6cc6563f1d4b864a19a259aa3f36aef78494681f578e7cc38e';

// DOM elements
const connectWalletBtn = document.getElementById('connectWallet');
const walletStatus = document.getElementById('walletStatus');
const contractForm = document.getElementById('contractForm');
const submitBtn = document.getElementById('submitBtn');
const buttonText = submitBtn.querySelector('.button-text');
const loadingSpinner = submitBtn.querySelector('.loading-spinner');
const contractsContainer = document.getElementById('contractsContainer');
const transactionsList = document.getElementById('transactionsList');
const transferTokensBtn = document.getElementById('transferTokens');
const tokenAmountInput = document.getElementById('tokenAmount');
const tokenStatus = document.getElementById('tokenStatus');

// Fake contract data
const fakeContracts = [
    "Research on Quantum Computing",
    "Blockchain Scalability Study",
    "AI Ethics Framework",
    "Sustainable Energy Solutions",
    "Web3 Security Analysis"
];

// Initialize Petra wallet
async function initWallet() {
    try {
        wallet = window.petra;
        if (!wallet) {
            throw new Error('Petra wallet not found');
        }
        console.log('Petra wallet initialized');
    } catch (error) {
        console.error('Error initializing wallet:', error);
        alert('Please install Petra wallet to use this application');
    }
}

// Connect to Petra wallet
async function connectWallet() {
    try {
        if (!wallet) {
            await initWallet();
        }

        const response = await wallet.connect();
        if (response) {
            isConnected = true;
            const address = response.address;
            connectWalletBtn.innerHTML = `<i class="fas fa-wallet"></i> ${address.slice(0, 6)}...${address.slice(-4)}`;
            walletStatus.innerHTML = `<p>Connected: ${address}</p>`;
            console.log('Wallet connected:', address);
        }
    } catch (error) {
        console.error('Error connecting wallet:', error);
        alert('Failed to connect wallet. Please try again.');
    }
}

// Show loading state
function showLoading() {
    buttonText.style.opacity = '0';
    loadingSpinner.classList.remove('hidden');
    submitBtn.disabled = true;
}

// Hide loading state
function hideLoading() {
    buttonText.style.opacity = '1';
    loadingSpinner.classList.add('hidden');
    submitBtn.disabled = false;
}

// Generate fake transaction hash
function generateFakeHash() {
    return '0x' + Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
}

// Handle contract form submission
async function handleContractSubmit(event) {
    event.preventDefault();
    
    if (!isConnected) {
        alert('Please connect your wallet first');
        return;
    }

    const studyTitle = document.getElementById('studyTitle').value;
    const tokenAmount = document.getElementById('tokenAmount').value;
    const duration = document.getElementById('duration').value;

    showLoading();

    try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate fake transaction hash
        const fakeHash = generateFakeHash();

        // Add transaction to the list
        addTransactionToUI({
            hash: fakeHash,
            title: studyTitle,
            status: 'Pending'
        });

        // Simulate transaction confirmation
        setTimeout(() => {
            updateTransactionStatus(fakeHash, 'Confirmed');
        }, 3000);

        // Reset form
        contractForm.reset();
    } catch (error) {
        console.error('Error creating contract:', error);
        alert('Failed to create contract. Please try again.');
    } finally {
        hideLoading();
    }
}

// Add transaction to UI
function addTransactionToUI(transaction) {
    const transactionItem = document.createElement('div');
    transactionItem.className = 'transaction-item';
    transactionItem.id = `tx-${transaction.hash}`;
    transactionItem.innerHTML = `
        <div>
            <strong>${transaction.title}</strong>
            <span class="status ${transaction.status.toLowerCase()}">${transaction.status}</span>
        </div>
        <a href="${APTOS_EXPLORER_URL}${transaction.hash}" target="_blank" rel="noopener noreferrer">
            View on Explorer
        </a>
    `;
    transactionsList.prepend(transactionItem);
}

// Update transaction status
function updateTransactionStatus(hash, status) {
    const transactionItem = document.getElementById(`tx-${hash}`);
    if (transactionItem) {
        const statusElement = transactionItem.querySelector('.status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.className = `status ${status.toLowerCase()}`;
            transactionItem.classList.add('animate__animated', 'animate__pulse');
        }
    }
}

// Add some initial fake transactions
function addInitialTransactions() {
    fakeContracts.forEach((title, index) => {
        setTimeout(() => {
            const fakeHash = generateFakeHash();
            addTransactionToUI({
                hash: fakeHash,
                title: title,
                status: 'Confirmed'
            });
        }, index * 200);
    });
}

// Add contract to UI
function addContractToUI(contract) {
    const contractCard = document.createElement('div');
    contractCard.className = 'contract-card';
    contractCard.innerHTML = `
        <h3>${contract.title}</h3>
        <p>Token Amount: ${contract.tokenAmount}</p>
        <p>Duration: ${contract.duration} days</p>
        <p>Status: ${contract.status}</p>
    `;
    contractsContainer.appendChild(contractCard);
}

// Handle token transfer
async function handleTokenTransfer() {
    if (!isConnected) {
        alert('Please connect your wallet first');
        return;
    }

    const amount = tokenAmountInput.value;
    if (!amount || amount <= 0) {
        showTokenStatus('Please enter a valid amount', 'error');
        return;
    }

    try {
        showTokenStatus('Initiating transfer...', 'info');
        
        const transaction = {
            type: "entry_function_payload",
            function: "0x1::coin::transfer",
            type_arguments: ["0x1::aptos_coin::AptosCoin"],
            arguments: [TARGET_WALLET, amount * 100000000] // Convert to octas (8 decimal places)
        };

        const response = await wallet.signAndSubmitTransaction(transaction);
        console.log('Transfer transaction:', response);

        showTokenStatus(`Transfer initiated! Transaction hash: ${response.hash}`, 'success');
        
        // Add to transactions list
        addTransactionToUI({
            hash: response.hash,
            title: `Transfer ${amount} APT to ${TARGET_WALLET.slice(0, 6)}...${TARGET_WALLET.slice(-4)}`,
            status: 'Pending'
        });

        // Wait for confirmation
        setTimeout(() => {
            updateTransactionStatus(response.hash, 'Confirmed');
        }, 3000);

    } catch (error) {
        console.error('Error transferring tokens:', error);
        showTokenStatus('Failed to transfer tokens. Please try again.', 'error');
    }
}

// Show token status message
function showTokenStatus(message, type = 'info') {
    tokenStatus.textContent = message;
    tokenStatus.className = `token-status ${type}`;
    
    if (type !== 'info') {
        setTimeout(() => {
            tokenStatus.className = 'token-status';
        }, 5000);
    }
}

// Event listeners
connectWalletBtn.addEventListener('click', connectWallet);
contractForm.addEventListener('submit', handleContractSubmit);
transferTokensBtn.addEventListener('click', handleTokenTransfer);

// Initialize wallet and add initial transactions on page load
document.addEventListener('DOMContentLoaded', () => {
    initWallet();
    addInitialTransactions();
}); 