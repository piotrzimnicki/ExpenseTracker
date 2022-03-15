function summary() {
    let monthsSummary = {};
    const maxYearVal = {};
    const maxChartHeight = 20;
    const summaryDiv =
    `<div id="summary" class="summary fade-in">
        <div class="inner">
            <div class="summary-top-bar">
                <select id="summary-year" class="selector"></select>
                <div id="summary-balance-wrapper" class="summary-balance-wrapper">
                    <span id="summary-income" class="summary-income">Income: <span></span></span>
                    <span id="summary-expense" class="summary-expense">Expense: <span></span></span>
                    <span id="summary-balance" class="summary-balance">Balance: <span></span></span>
                </div>
            </div>
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
    // BUTTON SUMMARY ACTION
    btnSummary.addEventListener('click', generateSummary);
    function generateSummary() {
        const isSummary = document.querySelector('#summary');
        if(isSummary) return;
        if(window.innerHeight > window.innerWidth) {
            alert('Please use horizontal view');
            return;
        }
        getSummary ();
        getMaxValue();

        function generateTopBalanceBar(year) {
            const summaryBalanceWrapper = document.querySelector('#summary-balance-wrapper');
            summaryBalanceWrapper.classList.add('fade-in');
            const yearData = monthsSummary[year];
            const income = yearData ? (Object.values(yearData).filter(el => el > 0)).reduce((a,b) => a+b,0) : 0;
            const expense = yearData ? (Object.values(yearData).filter(el => el < 0)).reduce((a,b) => a+b,0) : 0;
            const balance = income || expense ? income + expense : 0;
            const incomeSpan = document.querySelector('#summary-income > span');
            const expenseSpan = document.querySelector('#summary-expense > span');
            const balanceSpan = document.querySelector('#summary-balance > span');
            if (incomeSpan) incomeSpan.textContent = income + ' zł';
            if (expenseSpan) expenseSpan.textContent = expense + ' zł';
            if (balanceSpan) balanceSpan.textContent = balance + ' zł';
            setTimeout(() => {
                summaryBalanceWrapper.classList.remove('fade-in');
            },300)
        }

        document.body.insertAdjacentHTML('beforeend',summaryDiv);
        const summaryBg = document.querySelector('.summary');
        summaryBg.addEventListener('click',(e)=>{
            if(e.target.classList.contains('summary')) {
                e.target.classList.remove('fade-in');
                e.target.classList.add('fade-out');
                setTimeout(()=> {
                    e.target.remove();
                },300)
            }
        })
        const xAxis = document.querySelector('.x-axis');
        const yearSelector = document.querySelector('#summary-year');
        const currentSummaryYear = JSON.parse(localStorage.getItem('selected')).year;

        generateTopBalanceBar(currentSummaryYear);

        monthsNames.map(month => {
            xAxis.insertAdjacentHTML('beforeend', `<span data-month="${month}" class="month">${month.slice(0,3)}</span>`);
        })
        yearsNames.map(year => {
            yearSelector.insertAdjacentHTML('beforeend',`<option ${year == currentSummaryYear ? "selected='selected'": ""} value="${year}">${year}</option>`);
        })
        // GENERATE CHART ON CLICK OR LOAD
        function generateChart(currentlySelectedYear) {
            const summaryMonthsArr = Array.from(xAxis.children);
            const chartArr = Array.from(xAxis.querySelectorAll('.single-chart'));
            if(chartArr) chartArr.map(el => {if(el) el.remove()});
            summaryMonthsArr.map( el => {
                const currentScale = maxYearVal[currentlySelectedYear] ? maxYearVal[currentlySelectedYear].scale : null;
                const currentExpenseValue = monthsSummary[currentlySelectedYear] ? monthsSummary[currentlySelectedYear][el.dataset.month]: null;
                const currentHeight = Number((Number(currentExpenseValue) / Number(currentScale)));
                if(currentExpenseValue){
                    const htmlEl = `<span
                    style="${currentExpenseValue > 0 ? "bottom: 5.2rem;background-color:#05b305" : "top: 5.2rem; background-color:#d30000"}"
                    class="single-chart">
                    <span style="${currentExpenseValue > 0 ? "top: -8rem" : "bottom: -8rem"}" class="modal-info hidden">Click on chart to show this month</span>
                    <span
                    style="${currentExpenseValue > 0 ? "top: -3rem" : "bottom: -3rem"}"
                    class="chart-text"></span></span>`;
                    el.insertAdjacentHTML('beforeend', htmlEl);
                    setTimeout(()=>{
                        el.querySelector('.single-chart').style.height =  Math.abs(currentHeight) < 2 ? Math.abs(currentHeight.toFixed(2)) + 1.5 + 'vh' : Math.abs(currentHeight.toFixed(2)) + 'vh';
                    },100)
                    setTimeout(()=> {
                        const chartText = el.querySelector('.single-chart .chart-text');
                        if(chartText) {
                            chartText.textContent = currentExpenseValue + String.fromCharCode(160)+'zł';
                            chartText.classList.add('fade-in');
                            chartText.style.color = currentHeight > 0 ? "#05b305" : "#d30000";
                        }
                    },200)

                    el.addEventListener('click', (e) => {
                        if(e.target.classList.contains('single-chart') || e.target.classList.contains('chart-text') ) {
                            const month = el.dataset.month;
                            const year = document.querySelector('#summary-year') ? document.querySelector('#summary-year').value : null;
                            const summaryBg = document.querySelector('.summary');
                            const yearSelector = document.querySelector('#year-selector');
                            const monthSelector = document.querySelector('#month-selector');
                            yearSelector.value = year;
                            monthSelector.value = month;
                            setTimeout(()=> {
                                yearSelector.dispatchEvent(new Event('change', { 'bubbles': true }))
                                monthSelector.dispatchEvent(new Event('change', { 'bubbles': true }))
                                if(summaryBg) summaryBg.remove();
                            },100)
                        }
                    })
                }
            })
        }
        generateChart(currentSummaryYear);

        //GENERATE CHART ON YEAR CHANGE
        yearSelector.addEventListener('change', generateChartOnSelect);
        function generateChartOnSelect(e) {
                const summaryOptionsArr = Array.from(yearSelector.children);
                summaryOptionsArr.map(el => {
                    el.removeAttribute('selected');
                    if(yearSelector.value == el.value) el.setAttribute('selected','selected');
                });
                const selectedYear = e.target.value;
                generateChart(selectedYear);
                generateTopBalanceBar(selectedYear);
        }

    }
        function getMaxValue() {
            yearsNames.map(year => {
                const obj = monthsSummary[year];
                maxYearVal[year] = obj ? {
                    max: Number((Math.max(...(Object.values(obj)).map(el => Math.abs(el)))).toFixed(3)),
                    scale: Number((Number((Math.max(...(Object.values(obj)).map(el => Math.abs(el))))/maxChartHeight)).toFixed(3))
                } : null;
            });
        }
}


summary();