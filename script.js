class BankAccount{constructor(name,accountNumber,initialBalance){this.name=name;this.accountNumber=accountNumber;this.balance=parseFloat(initialBalance);this.withdrawalAmount=0;this.transactions=[];this.createdAt=new Date()}
deposit(amount){const depositAmount=parseFloat(amount);if(depositAmount>0){this.balance+=depositAmount;this.addTransaction('deposit',depositAmount);return{success:!0,message:`Depósito de $ ${depositAmount.toFixed(2)} realizado com sucesso!`,newBalance:this.balance}}
return{success:!1,message:'Valor de depósito deve ser maior que zero!'}}
withdraw(amount){const withdrawAmount=parseFloat(amount);if(withdrawAmount<=0){return{success:!1,message:'Valor de levantamento deve ser maior que zero!'}}
if(withdrawAmount<=this.balance){this.balance-=withdrawAmount;this.withdrawalAmount=withdrawAmount;this.addTransaction('withdraw',withdrawAmount);return{success:!0,message:`Levantamento de $ ${withdrawAmount.toFixed(2)} realizado com sucesso!`,newBalance:this.balance}}else{return{success:!1,message:'Saldo insuficiente! Levantamento não realizado.'}}}
addTransaction(type,amount){this.transactions.push({type:type,amount:amount,timestamp:new Date(),balanceAfter:this.balance})}
getAccountInfo(){return{name:this.name,accountNumber:this.accountNumber,balance:this.balance,transactions:this.transactions}}}
class BankManager{constructor(){this.accounts=[];this.loadAccountsFromStorage();this.initializeEventListeners();this.renderAccounts();this.renderTransactionHistory()}
initializeEventListeners(){const createAccountForm=document.getElementById('create-account-form');createAccountForm.addEventListener('submit',(e)=>this.handleCreateAccount(e));const modal=document.getElementById('transaction-modal');const closeBtn=document.querySelector('.close');closeBtn.addEventListener('click',()=>this.closeModal());window.addEventListener('click',(e)=>{if(e.target===modal){this.closeModal()}});document.getElementById('deposit-btn').addEventListener('click',()=>this.handleTransaction('deposit'));document.getElementById('withdraw-btn').addEventListener('click',()=>this.handleTransaction('withdraw'))}
handleCreateAccount(e){e.preventDefault();const formData=new FormData(e.target);const name=formData.get('accountName').trim();const accountNumber=formData.get('accountNumber').trim();const initialBalance=formData.get('initialBalance');if(!name||!accountNumber||!initialBalance){this.showNotification('Todos os campos são obrigatórios!','error');return}
if(parseFloat(initialBalance)<0){this.showNotification('Saldo inicial não pode ser negativo!','error');return}
if(this.accounts.find(account=>account.accountNumber===accountNumber)){this.showNotification('Número da conta já existe!','error');return}
const newAccount=new BankAccount(name,accountNumber,initialBalance);this.accounts.push(newAccount);this.saveAccountsToStorage();this.renderAccounts();this.renderTransactionHistory();e.target.reset();this.showNotification(`Conta criada com sucesso para ${name}!`,'success')}
openTransactionModal(accountNumber){const account=this.accounts.find(acc=>acc.accountNumber===accountNumber);if(!account)return;document.getElementById('transaction-account-id').value=accountNumber;document.getElementById('modal-title').textContent=`Transação - ${account.name}`;document.getElementById('transaction-amount').value='';document.getElementById('transaction-modal').style.display='block'}
closeModal(){document.getElementById('transaction-modal').style.display='none'}
handleTransaction(type){const accountNumber=document.getElementById('transaction-account-id').value;const amount=document.getElementById('transaction-amount').value;if(!amount||parseFloat(amount)<=0){this.showNotification('Digite um valor válido!','error');return}
const account=this.accounts.find(acc=>acc.accountNumber===accountNumber);if(!account){this.showNotification('Conta não encontrada!','error');return}
let result;if(type==='deposit'){result=account.deposit(amount)}else if(type==='withdraw'){result=account.withdraw(amount)}
this.showNotification(result.message,result.success?'success':'error');if(result.success){this.renderAccounts();this.renderTransactionHistory();this.saveAccountsToStorage();this.closeModal()}}
renderAccounts(){const container=document.getElementById('accounts-container');if(this.accounts.length===0){container.innerHTML=`
                <div class="empty-state">
                    <h3>Nenhuma conta cadastrada</h3>
                    <p>Crie sua primeira conta bancária usando o formulário acima.</p>
                </div>
            `;return}
container.innerHTML=this.accounts.map(account=>`
            <div class="account-card fade-in">
                <div class="account-header">
                    <div class="account-name">${account.name}</div>
                    <div class="account-number">#${account.accountNumber}</div>
                </div>
                <div class="account-balance">$ ${account.balance.toFixed(2)}</div>
                <div class="account-actions">
                    <button class="btn btn-success" onclick="bankManager.openTransactionModal('${account.accountNumber}')">
                        Transações
                    </button>
                    <button class="btn btn-danger" onclick="bankManager.deleteAccount('${account.accountNumber}')">
                        Excluir
                    </button>
                </div>
            </div>
        `).join('')}
renderTransactionHistory(){const container=document.getElementById('transaction-history');let allTransactions=[];this.accounts.forEach(account=>{account.transactions.forEach(transaction=>{allTransactions.push({...transaction,accountName:account.name,accountNumber:account.accountNumber})})});allTransactions.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp));if(allTransactions.length===0){container.innerHTML=`
                <div class="empty-state">
                    <h3>Nenhuma transação realizada</h3>
                    <p>As transações aparecerão aqui conforme forem realizadas.</p>
                </div>
            `;return}
container.innerHTML=allTransactions.map(transaction=>`
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-type ${transaction.type}">
                        ${transaction.type === 'deposit' ? '💰 Depósito' : '💸 Levantar'}
                    </div>
                    <div class="transaction-details">
                        ${transaction.accountName} (#${transaction.accountNumber}) - 
                        ${new Date(transaction.timestamp).toLocaleString('pt-BR')}
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type === 'deposit' ? 'positive' : 'negative'}">
                    ${transaction.type === 'deposit' ? '+' : '-'}$ ${transaction.amount.toFixed(2)}
                </div>
            </div>
        `).join('')}
deleteAccount(accountNumber){if(confirm('Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.')){this.accounts=this.accounts.filter(account=>account.accountNumber!==accountNumber);this.saveAccountsToStorage();this.renderAccounts();this.renderTransactionHistory();this.showNotification('Conta excluída com sucesso!','success')}}
saveAccountsToStorage(){localStorage.setItem('bankAccounts',JSON.stringify(this.accounts))}
loadAccountsFromStorage(){const savedAccounts=localStorage.getItem('bankAccounts');if(savedAccounts){const accountsData=JSON.parse(savedAccounts);this.accounts=accountsData.map(data=>{const account=new BankAccount(data.name,data.accountNumber,data.balance);account.withdrawalAmount=data.withdrawalAmount||0;account.transactions=data.transactions||[];account.createdAt=new Date(data.createdAt);return account})}}
showNotification(message,type='info'){const existingNotification=document.querySelector('.notification');if(existingNotification){existingNotification.remove()}
const notification=document.createElement('div');notification.className=`notification notification-${type}`;notification.innerHTML=`
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;notification.style.cssText=`
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;document.body.appendChild(notification);notification.querySelector('.notification-close').addEventListener('click',()=>{notification.remove()});setTimeout(()=>{if(notification.parentNode){notification.remove()}},5000)}}
const notificationStyles=document.createElement('style');notificationStyles.textContent=`
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;document.head.appendChild(notificationStyles);let bankManager;document.addEventListener('DOMContentLoaded',()=>{bankManager=new BankManager()});function demonstrateSystem(){console.log('=== Demonstração do Sistema Bancário ===');const account1=new BankAccount('João Silva','12345',1000);const account2=new BankAccount('Maria Santos','67890',500);console.log('Contas criadas:');console.log(account1.getAccountInfo());console.log(account2.getAccountInfo());console.log('\nRealizando transações...');console.log(account1.deposit(200));console.log(account1.withdraw(150));console.log(account2.deposit(100));console.log(account2.withdraw(700));console.log('\nEstado final das contas:');console.log(account1.getAccountInfo());console.log(account2.getAccountInfo())}