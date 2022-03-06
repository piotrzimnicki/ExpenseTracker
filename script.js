function expenseTracker (classWrapper) {
    const wrapper = document.querySelector(`.${classWrapper}`);
    const drop = wrapper.querySelector('#drop');
    const historyList = wrapper.querySelector('.history .inner');
    const balance = wrapper.querySelector('#balance');
    const incomeInfo = wrapper.querySelector('#income');
    const expenseInfo = wrapper.querySelector('#expense');
    const btnSubmit = wrapper.querySelector('#submit');
    const message = wrapper.querySelector('.message');
    const yearList = [2024,2023,2022,2021,2020];
    const monthList = ['January','February','March','April','May','June','July','August','September','November','December'];
    let selected = {
        month: localStorage.getItem('selected') ? (JSON.parse(localStorage.getItem('selected'))).month : null,
        year: localStorage.getItem('selected') ? (JSON.parse(localStorage.getItem('selected'))).year : null,
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
    function monthSelector() {
        const selectMonth = wrapper.querySelector('#month-selector');
        const selectYear = wrapper.querySelector('#year-selector');
        const lastMonth = localStorage.getItem('selected') ? (JSON.parse(localStorage.getItem('selected'))).month: monthList[0];
        const lastYear = localStorage.getItem('selected') ? (JSON.parse(localStorage.getItem('selected'))).year : yearList[0];
        selected = {
            month: lastMonth,
            year: lastYear
        }
        localStorage.setItem('selected', JSON.stringify(selected));
        function addEvent(selector,array,monthOrYear) {
            selector.addEventListener('change', (e) => {
                const optionArr = Array.from(selector.children)
                optionArr.map(el => {
                    el.removeAttribute('selected');
                    if(selector.value == el.value) el.setAttribute('selected','selected');
                });
                localShort = `expenseTracker${selected.month}${selected.year}`;
                selected[`${monthOrYear}`] = array[e.target.selectedIndex];
                historyList.closest('.history').classList.add('fade-in');
                localStorage.setItem('selected', JSON.stringify(selected));
                selected[`${monthOrYear}`] = (JSON.parse(localStorage.getItem('selected')))[`${monthOrYear}`];
                getTransactions();
                updateHeight(e);
                setTimeout(()=> {
                    historyList.closest('.history').classList.remove('fade-in');
                },300)
            });
        }
        addEvent(selectMonth,monthList,'month');
        addEvent(selectYear,yearList,'year');
        function printOptions(arr,last,wrapper) {
            arr.map(el => {
                let option = `<option ${el==last?'selected="selected"':""} value="${el}">${el}</option>`;
                wrapper.insertAdjacentHTML('beforeend', option);
            });
        }
        printOptions(monthList,lastMonth,selectMonth);
        printOptions(yearList,lastYear,selectYear);
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
        if(transactions) {
            historyList.innerText = '';
            transactions.map(el => {
                const div = `<div id="${el.id}" class="single ${Number(el.price > 0) ? "income" : "expense"}">
                <p><span id="name" class="name">${el.name}</span><span id="price" class="price">${el.price}</span></p>
                </div>`
                historyList.insertAdjacentHTML('beforeend',div);
            });
            countMonth();
        } else {
            historyList.innerText = '';
            countMonth();
        }
    }
    function addTransaction(e) {
        const inputs = Array.from(e.target.closest('.add-transaction').querySelectorAll('input'));
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
            balance.innerText = balanceSum.toFixed(2) + ' zł';
            incomeInfo.innerText = incomeSum.toFixed(2) + ' zł';
            expenseInfo.innerText = expenseSum.toFixed(2) + ' zł';
    };
    drop.addEventListener('click',dropList);
    function dropList() {
        const confirm = window.confirm('Are u sure to delete ALL data?');
        if(confirm) {
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

    getTransactions();
    countMonth();
    updateHeight();
    monthSelector();
}
function summary() {
    let monthsSummary = {};
    const maxYearVal = {};
    const maxChartHeightPx = 300;
    const div =
    `<div class="summary">
        <div class="inner">
            <div class="year-selector"><select id="summary-year"></select></div>
            <div class="x-axis"></div>
        </div>
    </div>`
    const btnSummary = document.querySelector('#btn-summary');
    const monthsDOM = Array.from(document.querySelectorAll('#month-selector option'));
    const yearsDOM = Array.from(document.querySelectorAll('#year-selector option'));
    const monthsNames = monthsDOM.map(el => el.innerText);
    const yearsNames = yearsDOM.map(el => el.innerText);
    function getSummary () {
        monthsSummary = {};
        yearsNames.map(year => {
            monthsNames.map(month => {
                let balanceSum = 0;
                const transaction = JSON.parse(localStorage.getItem(`expenseTracker${month}${year}`));
                if(transaction && transaction.length > 0) {
                    if(!monthsSummary[`${year}`]) monthsSummary[`${year}`] = {};
                    transaction.map(el => {
                        let price = Number(el.price);
                        balanceSum += price
                        monthsSummary[`${year}`][`${month}`] = balanceSum;
                    });
                }
            })
        })
    }
    btnSummary.addEventListener('click', generateSummary);
    function generateSummary() {
        getSummary ();
        getMaxValue();
        document.body.insertAdjacentHTML('beforeend',div);
        const summaryBg = document.querySelector('.summary');
        summaryBg.addEventListener('click',(e)=>{
            if(e.target.classList.contains('summary'))
            e.target.remove();
        })
        const xAxis = document.querySelector('.x-axis');
        const yearSelector = document.querySelector('#summary-year');
        const currentSummaryYear = JSON.parse(localStorage.getItem('selected')).year;
        monthsNames.map(month => {
            xAxis.insertAdjacentHTML('beforeend', `<span data-month="${month}" class="month">${month.slice(0,3)}</span>`);
        })
        yearsNames.map(year => {
            yearSelector.insertAdjacentHTML('beforeend',`<option ${year == currentSummaryYear ? "selected='selected'": ""} value="${year}">${year}</option>`);
        })
        function generateChartOnLoad(currentlySelectedYear) {
            const summaryMonthsArr = Array.from(xAxis.children);
            const chartArr = Array.from(xAxis.querySelectorAll('.single-chart'));
            if(chartArr) chartArr.map(el => {if(el) el.remove()});
            summaryMonthsArr.map( el => {
                const currentScale = maxYearVal[currentlySelectedYear] ? maxYearVal[currentlySelectedYear].scale : null;
                const currentExpenseValue = monthsSummary[currentlySelectedYear] ? monthsSummary[currentlySelectedYear][el.dataset.month]: null;
                const currentHeight = Number((Number(currentExpenseValue) / Number(currentScale)).toFixed(0));
                if(currentExpenseValue)
                el.insertAdjacentHTML('beforeend', `<span
                style="height:${Math.abs(currentHeight) > maxChartHeightPx ? maxChartHeightPx + 'px' : Math.abs(currentHeight) + 'px'};${currentHeight > 0 ? "bottom: 52px;background-color:#05b305" : "top: 52px; background-color:#a80000"}"
                class="single-chart"><span
                style="${currentHeight > 0 ? "top: -30px" : "bottom: -30px"}"
                class="chart-text">${currentExpenseValue + ' zł'}</span></span>`);
            })
        }
        generateChartOnLoad(currentSummaryYear);
        yearSelector.addEventListener('change', generateChart);
        function generateChart(e) {
                const summaryOptionsArr = Array.from(yearSelector.children);
                summaryOptionsArr.map(el => {
                    el.removeAttribute('selected');
                    if(yearSelector.value == el.value) el.setAttribute('selected','selected');
                });
                const selectedYear = e.target.value;
                generateChartOnLoad(selectedYear);
        }

    }
    function getMaxValue() {
        yearsNames.map(year => {
            const obj = monthsSummary[year];
            maxYearVal[year] = obj ? {
                max: Number((Math.max(...(Object.values(obj)).map(el => Math.abs(el)))).toFixed(3)),
                scale: Number((Number((Math.max(...(Object.values(obj)).map(el => Math.abs(el))))/maxChartHeightPx)).toFixed(3))
            } : {max:0,scale:0};
        });
    }
}

expenseTracker('wrapper');
summary();