function expenseTracker (classWrapper) {
        const wrapper = document.querySelector(`.${classWrapper}`);
        const historyList = wrapper.querySelector('.history .inner');
        const balance = wrapper.querySelector('#balance');
        const incomeInfo = wrapper.querySelector('#income');
        const expenseInfo = wrapper.querySelector('#expense');
        const btnSubmit = wrapper.querySelector('#submit');
        const message = wrapper.querySelector('.message');
        const monthList = ['January','February','March','April','May','June','July','August','September','November','December'];
        let selectedMonth = localStorage.getItem('selectedMonth') || '';
        btnSubmit.addEventListener('click', addTransaction);
        historyList.addEventListener('click', removeItem);
        window.addEventListener('keydown', keyboardSupport)

    function uid()  {
        let a = new Uint32Array(3);
        window.crypto.getRandomValues(a);
        return (performance.now().toString(36)+Array.from(a).map(A => A.toString(36)).join("")).replace(/\./g,"");
    };


    function monthSelector() {
        const select = wrapper.querySelector('#month-selector');
        const lastMonth = localStorage.getItem('selectedMonth');
        if(!lastMonth) localStorage.setItem('selectedMonth', monthList[0]);
        selectedMonth = localStorage.getItem('selectedMonth');
        select.addEventListener('change', (e) => {
            historyList.closest('.history').classList.add('fade-in');
            localStorage.setItem('selectedMonth', monthList[e.target.selectedIndex]);
            selectedMonth = localStorage.getItem('selectedMonth');
            getTransactions();
            updateHeight(e);
            setTimeout(()=> {
                historyList.closest('.history').classList.remove('fade-in');
            },300)
        })
        monthList.map(el => {
            let option = `<option ${el==lastMonth?'selected="selected"':""} value="${el}">${el}</option>`;
            select.insertAdjacentHTML('beforeend', option);
        });
    }


    function updateHeight(e) {
        if(e) {
            const arr = Array.from(wrapper.querySelectorAll('.single'));
            const last = arr[arr.length - 1];
            if(last) {
                if (e.target.id === "submit") {
                        last.classList.add('fade-in');
                }
                setTimeout(()=> {
                    last.classList.remove('fade-in');
                },300)
            }
        }
        wrapper.querySelector('.history').style.height = wrapper.querySelector('.history .inner').scrollHeight + 64 + 'px';
    }
    function validate(name,price) {
        function validationMessage(errorText) {
            message.classList.add('active', 'fade-in');
            message.querySelector('p').innerText = `${errorText}`;
            message.querySelector('span').addEventListener('click', () => {
                message.classList.remove('fade-in');
                message.classList.add('fade-out');
                setTimeout(()=>{
                    message.classList.remove('active');
                    message.querySelector('p').innerText = '';
                    message.classList.remove('fade-out');
                },300);
            });
        }
        if(name === '') {
            validationMessage('Please fill all fields');
            return false;
        }
        if(typeof price === 'string' && Number(price) === 0) {
            validationMessage('Cash amount should be a number and different from 0');
            return false;
        }
        return true;
    }
    function keyboardSupport(e) {
        if(e.key === 'Enter' || e.keyCode === 13) {
            addTransaction(e);
        }
    }
    function getTransactions() {
        const transactions = JSON.parse(localStorage.getItem(`expenseTracker${selectedMonth}`));
        if(transactions) {
            historyList.innerText = '';
            transactions.map(el => {
                const div = `<div id="${el.id}" class="single ${Number(el.price > 0) ? "income" : "expense"}">
                <p><span id="name" class="name">${el.name}</span><span id="price" class="price">${el.price}</span></p>
                </div>`
                historyList.insertAdjacentHTML('beforeend',div);
            });
            countAll();
        } else {
            historyList.innerText = '';
            countAll();
        }
    }
    function addTransaction(e) {
        if(!selectedMonth) selectedMonth = '';
        const inputs = Array.from(e.target.closest('.add-transaction').querySelectorAll('input'));
        const values = Array.from(inputs).map(el => el.value);
        const validation = validate(values[0],values[1]);
        if(!validation) return false;
        const obj = {
            id: uid(),
            name: values[0],
            price: Number(values[1]).toFixed(2),
        };
        const localItem = localStorage.getItem(`expenseTracker${selectedMonth}`);
        if(!localItem) localStorage.setItem(`expenseTracker${selectedMonth}`, JSON.stringify([obj]));
        if(localItem) {
            let arr = JSON.parse(localItem);
            arr.push(obj);
            localStorage.setItem(`expenseTracker${selectedMonth}`, JSON.stringify(arr));
        }
            setTimeout(() => {
                getTransactions(e);
                updateHeight(e);
            },300)
            inputs.map(el => el.value = '');
            message.classList.remove('active');
    }
    function removeItem(e) {
        if(e.target.classList.contains('single') || e.target.closest('.single')) {
            const target = e.target.closest('.single') || e.target;
            target.classList.add('fade-out');
            setTimeout(() => {
                let transactions = JSON.parse(localStorage.getItem(`expenseTracker${selectedMonth}`));
                transactions = transactions.filter(el =>{
                    return el.id != target.id;
                })
                localStorage.setItem(`expenseTracker${selectedMonth}`, JSON.stringify(transactions));
                getTransactions(e);
            }, 300);
            setTimeout(() => {
                updateHeight(e);
            },310)
        }
    }
    function countAll() {
            let balanceSum = 0;
            let incomeSum = 0;
            let expenseSum = 0;
            const transactions = JSON.parse(localStorage.getItem(`expenseTracker${selectedMonth}`));
            if(transactions) {
                transactions.map(el => {
                    let price = Number(el.price);
                    balanceSum += price
                    if(price < 0) expenseSum += price;
                    if(price > 0) incomeSum += price;
                });
            }
            balance.removeAttribute('class');
            if(balanceSum < 0) balance.classList.add('negative');
            if(balanceSum > 0) balance.classList.add('positive');
            balance.innerText = balanceSum.toFixed(2) + ' zł';
            incomeInfo.innerText = incomeSum.toFixed(2) + ' zł';
            expenseInfo.innerText = expenseSum.toFixed(2) + ' zł';
    };

    getTransactions();
    countAll();
    updateHeight();
    monthSelector();
}


expenseTracker('wrapper');