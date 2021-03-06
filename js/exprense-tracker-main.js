function expenseTracker (classWrapper) {
    const wrapper = document.querySelector(`.${classWrapper}`);
    const drop = wrapper.querySelector('#drop');
    const historyList = wrapper.querySelector('.history .inner');
    const balance = wrapper.querySelector('#balance');
    const incomeInfo = wrapper.querySelector('#income');
    const expenseInfo = wrapper.querySelector('#expense');
    const btnSubmit = wrapper.querySelector('#submit');
    const message = wrapper.querySelector('.message');
    const currentYear = new Date().getFullYear();
    const yearList = [currentYear];
    for(let i = 1; i <=2; i++) {
        yearList.push(currentYear - i);
        yearList.unshift(currentYear + i);
    }
    const monthList = ['January','February','March','April','May','June','July','August','September','November','December'];
    const currencyList = ['zł','PLN','$', '€'];
    const currencyOnLeft = ['$', '€'];
    let selected = {
        month: localStorage.getItem('selected') ? (JSON.parse(localStorage.getItem('selected'))).month : null,
        year: localStorage.getItem('selected') ? (JSON.parse(localStorage.getItem('selected'))).year : null,
        currency: localStorage.getItem('selected') ? (JSON.parse(localStorage.getItem('selected'))).currency : null,
    }
    let localShort = `expenseTracker${selected.month}${selected.year}`;
    btnSubmit.addEventListener('click', addTransaction);
    historyList.addEventListener('click', removeItem);
    window.addEventListener('keydown', keyboardSupport)

    // https://gist.github.com/gordonbrander/2230317
    function uid()  {
        let a = new Uint32Array(3);
        window.crypto.getRandomValues(a);
        return (performance.now().toString(36)+Array.from(a).map(A => A.toString(36)).join("")).replace(/\./g,"");
    };
    function selectors() {
        const selectMonth = wrapper.querySelector('#month-selector');
        const selectYear = wrapper.querySelector('#year-selector');
        const selectCurrency = wrapper.querySelector('#currency-selector');
        const lastMonth = localStorage.getItem('selected') ? (JSON.parse(localStorage.getItem('selected'))).month: monthList[0];
        const lastYear = localStorage.getItem('selected') ? (JSON.parse(localStorage.getItem('selected'))).year : currentYear;
        const lastCurrency = localStorage.getItem('selected') ? (JSON.parse(localStorage.getItem('selected'))).currency : currencyList[0];
        selected = {
            month: lastMonth,
            year: lastYear,
            currency: lastCurrency
        }
        localStorage.setItem('selected', JSON.stringify(selected));
        function addEvent(selector,array,monthYearCurrency) {
            selector.addEventListener('change', (e) => {
                const optionArr = Array.from(selector.children);
                const selectorVal = selector.value;
                optionArr.map(el => {
                    el.removeAttribute('selected');
                    if(selectorVal == el.value) el.setAttribute('selected','selected');
                });
                localShort = `expenseTracker${selected.month}${selected.year}`;
                selected[`${monthYearCurrency}`] = array[e.target.selectedIndex];
                historyList.closest('.history').classList.add('fade-in');
                localStorage.setItem('selected', JSON.stringify(selected));
                selected[`${monthYearCurrency}`] = (JSON.parse(localStorage.getItem('selected')))[`${monthYearCurrency}`];
                getTransactions();
                updateHeight(e);
                setTimeout(()=> {
                    historyList.closest('.history').classList.remove('fade-in');
                },300)
            });
        }
        addEvent(selectMonth,monthList,'month');
        addEvent(selectYear,yearList,'year');
        addEvent(selectCurrency,currencyList,'currency');
        function printOptions(arr,last,wrapper) {
            arr.map(el => {
                let option = `<option ${el==last?'selected="selected"':""} value="${el}">${el}</option>`;
                wrapper.insertAdjacentHTML('beforeend', option);
            });
        }
        printOptions(monthList,lastMonth,selectMonth);
        printOptions(yearList,lastYear,selectYear);
        printOptions(currencyList,lastCurrency,selectCurrency);
    }
    function updateHeight(e) {
        if(e) {
            const arr = Array.from(wrapper.querySelectorAll('.single'));
            const last = arr[arr.length - 1];
            if(last) {
                if (e.target.id === "submit") {last.classList.add('fade-in');}
                setTimeout(()=> {last.classList.remove('fade-in');},300)
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
        localShort = `expenseTracker${selected.month}${selected.year}`;
        const transactions = JSON.parse(localStorage.getItem(localShort));
        const currentCurrency = localStorage.getItem('selected') ? (JSON.parse(localStorage.getItem('selected'))).currency : document.querySelector('#currency-selector').value;
        const isLeft = currencyOnLeft.includes(currentCurrency) ? true : false;
        if(transactions) {
            historyList.innerText = '';
            transactions.map(el => {
                const div = `<div id="${el.id}" class="single ${Number(el.price > 0) ? "income" : "expense"}">
                <p>
                    <span id="name" class="name"></span>
                    <span id="price" class="price">${isLeft ? currentCurrency + el.price : el.price + ' ' + currentCurrency }</span>
                </p>
                </div>`
                historyList.insertAdjacentHTML('beforeend',div);
                const divById = document.getElementById(el.id);
                const span = divById ? divById.querySelector('span') : null;
                if(span) span.innerText = el.name;
            });
            countMonth();
        } else {
            historyList.innerText = '';
            countMonth();
        }
    }
    function addTransaction(e) {
        localShort = `expenseTracker${selected.month}${selected.year}`;
        const inputs = e.target.closest('.add-transaction') ? Array.from(e.target.closest('.add-transaction').querySelectorAll('input')): null;
        if(!inputs) return;
        const values = Array.from(inputs).map(el => el.value);
        const validation = validate(values[0],values[1]);
        if(!validation) return false;
        const obj = {
            id: uid(),
            name: values[0],
            price: Number(values[1]).toFixed(2),
        };
        const localItem = localStorage.getItem(localShort);
        if(!localItem) localStorage.setItem(localShort, JSON.stringify([obj]));
        if(localItem) {
            let arr = JSON.parse(localItem);
            arr.push(obj);
            localStorage.setItem(localShort, JSON.stringify(arr));
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
                let transactions = JSON.parse(localStorage.getItem(localShort));
                transactions = transactions.filter(el =>{
                    return el.id != target.id;
                })
                localStorage.setItem(localShort, JSON.stringify(transactions));
                getTransactions(e);
            }, 300);
            setTimeout(() => {
                updateHeight(e);
            },310)
        }
    }
    function countMonth() {
            let balanceSum = 0;
            let incomeSum = 0;
            let expenseSum = 0;
            const transactions = JSON.parse(localStorage.getItem(localShort));
            const currentCurrency = localStorage.getItem('selected') ? (JSON.parse(localStorage.getItem('selected'))).currency : document.querySelector('#currency-selector').value;
            const isLeft = currencyOnLeft.includes(currentCurrency) ? true : false;
            if(transactions && transactions.length > 0) {
                transactions.map(el => {
                    let price = Number(el.price);
                    balanceSum += price
                    if(price < 0) expenseSum += price;
                    if(price > 0) incomeSum += price;
                });
            } else {
                localStorage.removeItem(localShort)
            }
            balance.removeAttribute('class');
            if(balanceSum < 0) balance.classList.add('negative');
            if(balanceSum > 0) balance.classList.add('positive');
            if(isLeft) {
                balance.innerText = currentCurrency + balanceSum.toFixed(2);
                incomeInfo.innerText = currentCurrency + incomeSum.toFixed(2);
                expenseInfo.innerText = currentCurrency + expenseSum.toFixed(2);
            } else {
                balance.innerText = balanceSum.toFixed(2) + ' ' + currentCurrency;
                incomeInfo.innerText = incomeSum.toFixed(2) + ' ' + currentCurrency;
                expenseInfo.innerText = expenseSum.toFixed(2) + ' ' + currentCurrency;
            }
    };
    drop.addEventListener('click',dropList);
    function dropList() {
        const confirm = window.confirm('Are u sure to delete ALL data?');
        if(confirm) {
            if(localStorage.getItem(`selected`))
            localStorage.removeItem('selected');
            monthList.map(month => {
                yearList.map(year => {
                    if(localStorage.getItem(`expenseTracker${month}${year}`))
                    localStorage.removeItem(`expenseTracker${month}${year}`);
                })
            });
            getTransactions();
            countMonth();
            updateHeight();
        }
    }
    selectors();
    getTransactions();
    countMonth();
    updateHeight();
}

expenseTracker('wrapper');