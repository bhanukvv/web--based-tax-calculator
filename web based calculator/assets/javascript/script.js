  let currentPage = 'home';
        const activeCharts = {};

       
        const MONTHLY_SLAB_RATES = [0.00, 0.06, 0.12, 0.18, 0.24, 0.30, 0.36];
        const MONTHLY_SLAB_LIMITS = [100000, 141667, 183333, 225000, 266667, 308333, Infinity];

        
        function createTaxSlabs(limits, rates) {
            const slabs = [];
            let prevLimit = 0;
            
            for (let i = 0; i < limits.length; i++) {
                const currentLimit = limits[i];
                const rate = rates[i];
                const slabWidth = (currentLimit === Infinity) ? Infinity : (currentLimit - prevLimit);

                slabs.push({
                    limit: currentLimit,
                    rate: rate,
                    prev_limit: prevLimit,
                    slab_width: slabWidth
                });

                prevLimit = currentLimit;
            }
            return slabs;
        }

        const TAX_SLABS_MONTHLY = createTaxSlabs(MONTHLY_SLAB_LIMITS, MONTHLY_SLAB_RATES);
        
        
        const ANNUAL_SLAB_LIMITS = MONTHLY_SLAB_LIMITS.map(l => l === Infinity ? Infinity : l * 12);
        const TAX_SLABS_ANNUAL = createTaxSlabs(ANNUAL_SLAB_LIMITS, MONTHLY_SLAB_RATES);


       
        function destroyChart(chartId) {
            if (activeCharts[chartId]) {
                activeCharts[chartId].destroy();
                delete activeCharts[chartId];
            }
        }

        function renderBarChart(chartId, title, labels, data, colors, summaryText) {
            destroyChart(chartId);
            const ctx = document.getElementById(chartId).getContext('2d');
            document.getElementById(chartId.replace('Chart', '-chart-panel')).classList.remove('hidden');

            activeCharts[chartId] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: title,
                        data: data,
                        backgroundColor: colors,
                        borderColor: colors.map(c => c.replace('0.2', '1')),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: title,
                            color: 'white'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: Rs. ${formatCurrency(context.parsed.y)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: '#D1D5DB' },
                            grid: { color: '#374151' }
                        },
                        x: {
                            ticks: { color: '#D1D5DB' },
                            grid: { display: false }
                        }
                    }
                }
            });
            document.getElementById(chartId.replace('Chart', '-chart-summary')).textContent = summaryText;
        }

        function renderPieChart(chartId, title, labels, data, colors, summaryText) {
            destroyChart(chartId);
            const ctx = document.getElementById(chartId).getContext('2d');
            document.getElementById(chartId.replace('Chart', '-chart-panel')).classList.remove('hidden');

            activeCharts[chartId] = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: colors,
                        hoverBackgroundColor: colors
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'top', labels: { color: '#D1D5DB', font: { size: 14 } } },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(2);
                                    return `${label}: Rs. ${formatCurrency(value)} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
            document.getElementById(chartId.replace('Chart', '-chart-summary')).textContent = summaryText;
        }


       
        const modal = document.getElementById('custom-modal');
        const modalContent = document.getElementById('modal-content');

        function alertModal(title, message) {
            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-body').textContent = message;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            setTimeout(() => {
                modalContent.classList.remove('scale-95', 'opacity-0');
                modalContent.classList.add('scale-100', 'opacity-100');
            }, 10);
        }

        function closeModal() {
            modalContent.classList.remove('scale-100', 'opacity-100');
            modalContent.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }, 300);
        }

        function validateInput(amount, validationId) {
            const validationEl = document.getElementById(validationId);
            validationEl.textContent = '';
            
         
            if (isNaN(amount) || amount <= 0) {
                validationEl.textContent = 'Please enter a valid amount greater than 0.';
                return false;
            }
            return true;
        }

        function validateInputNonNegative(amount, validationId) {
            const validationEl = document.getElementById(validationId);
            validationEl.textContent = '';
            
            if (isNaN(amount) || amount < 0) {
                validationEl.textContent = 'Please enter a valid, non-negative amount.';
                return false;
            }
            return true;
        }
        
        function formatCurrency(amount) {
            if (typeof amount !== 'number') return '0.00';
            return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }


        
        const pages = ['home', 'withholding', 'payable', 'income', 'sscl', 'leasing'];
        
        function navigateTo(targetPageId) {
            if (targetPageId === currentPage) return;

            const currentSection = document.getElementById(currentPage);
            const targetSection = document.getElementById(targetPageId);
            
            if (!currentSection || !targetSection) return;

           
            currentSection.classList.remove('active');
            currentSection.style.pointerEvents = 'none';
            
           
            setTimeout(() => {
                
                targetSection.classList.add('active');
                targetSection.style.pointerEvents = 'auto';
                currentPage = targetPageId;

               
                targetSection.scrollTop = 0;
            }, 400); 
        }

        function resetAllForms() {
            pages.forEach(id => {
                const form = document.getElementById(id + '-form');
                if (form) {
                    form.reset();
                }
                
                const results = document.getElementById(id + '-results');
                if (results) {
                    results.classList.add('hidden');
                }
               
                const chartPanel = document.getElementById(id + '-chart-panel');
                if (chartPanel) {
                    chartPanel.classList.add('hidden');
                }
                destroyChart(id + 'Chart');

               
                document.querySelectorAll(`#${id} [id$="-validation"]`).forEach(el => el.textContent = '');
            });
            alertModal("Data Cleared", "All calculator data has been successfully cleared and reset.");
        }


       

        function calculateWithholdingTax() {
            const amountEl = document.getElementById('wht-amount');
            const amount = parseFloat(amountEl.value);
            const taxType = document.querySelector('input[name="tax-type"]:checked').value;
            const resultsEl = document.getElementById('wht-results');
            const chartPanelEl = document.getElementById('wht-chart-panel');

            if (!validateInput(amount, 'wht-amount-validation')) {
                resultsEl.classList.add('hidden');
                chartPanelEl.classList.add('hidden');
                return;
            }

            let taxRate = 0;
            let taxableAmount = 0;
            let taxAmount = 0;
            let message = '';
            let description = '';
            const threshold = 100000;

            if (taxType === 'rent') {
                taxRate = 0.10; // 10%
                description = 'Rent Tax';
                if (amount > threshold) {
                    taxableAmount = amount - threshold;
                    taxAmount = taxableAmount * taxRate;
                    message = `Note: The first Rs. ${formatCurrency(threshold)} is exempt. Tax is applied only on the excess.`;
                } else {
                    taxableAmount = 0;
                    taxAmount = 0;
                    message = `The gross amount is below the Rs. ${formatCurrency(threshold)} monthly threshold. No tax is applied.`;
                }
            } else if (taxType === 'bank_interest') {
                taxRate = 0.05; // 5%
                description = 'Bank Interest Tax';
                taxableAmount = amount;
                taxAmount = amount * taxRate;
                message = 'Note: Bank Interest Tax is a flat 5% on the gross interest income. No threshold applies.';
            } else if (taxType === 'dividend') { 
                taxRate = 0.14; // 14%
                description = 'Dividend Tax';
                if (amount > threshold) {
                    taxableAmount = amount - threshold;
                    taxAmount = taxableAmount * taxRate;
                    message = `Note: The first Rs. ${formatCurrency(threshold)} is exempt. Tax is applied at 14% on the excess dividend income.`;
                } else {
                    taxableAmount = 0;
                    taxAmount = 0;
                    message = `The gross amount is below the Rs. ${formatCurrency(threshold)} threshold. No tax is applied.`;
                }
            }

            const netAmount = amount - taxAmount;

           
            document.getElementById('wht-tax-amount').innerHTML = `**Withholding Tax Payable:** Rs. ${formatCurrency(taxAmount)}`;
            document.getElementById('wht-rate-applied').textContent = `Applied Rate: ${taxRate * 100}% on Taxable Amount (Rs. ${formatCurrency(taxableAmount)})`;
            document.getElementById('wht-message').textContent = message;
            resultsEl.classList.remove('hidden');

           
            const chartLabels = ['Net Income', 'WHT Deducted'];
            const chartData = [netAmount, taxAmount];
            const chartColors = ['#4F46E5', '#EF4444'];
            const summary = `Gross Income: Rs. ${formatCurrency(amount)}. Net amount after WHT: Rs. ${formatCurrency(netAmount)}`;

            renderPieChart('whtChart', `${description} Breakdown`, chartLabels, chartData, chartColors, summary);
        }


       

        function calculatePayableTax() {
            calculateProgressiveTax(
                document.getElementById('payable-salary'),
                'payable-salary-validation',
                'payable-results',
                'payable-net-salary',
                'payable-tax-amount',
                'payable-tax-breakdown',
                'payableChart',
                'Monthly Salary Allocation',
                TAX_SLABS_MONTHLY,
                'Monthly Gross Salary',
                'Monthly Net Salary',
                'Total Monthly Tax Payable'
            );
        }

       
        function calculateAnnualTax() {
             calculateProgressiveTax(
                document.getElementById('annual-income'),
                'annual-income-validation',
                'annual-results',
                'annual-net-income',
                'annual-tax-amount',
                'annual-tax-breakdown',
                'annualChart',
                'Annual Income Allocation',
                TAX_SLABS_ANNUAL,
                'Annual Gross Income',
                'Annual Net Income',
                'Total Annual Tax Payable'
            );
        }

       

        function calculateProgressiveTax(inputEl, validationId, resultsId, netIncomeId, taxAmountId, breakdownId, chartId, chartTitle, taxSlabs, grossLabel, netLabel, taxLabel) {
            const grossIncome = parseFloat(inputEl.value);
            const resultsEl = document.getElementById(resultsId);
            const chartPanelEl = document.getElementById(chartId.replace('Chart', '-chart-panel'));

            if (!validateInput(grossIncome, validationId)) {
                resultsEl.classList.add('hidden');
                chartPanelEl.classList.add('hidden');
                return;
            }

            let taxAmount = 0;
            let breakdownHTML = '';
            let currentIncome = grossIncome;
            let totalTaxable = 0;

            for (let i = 0; i < taxSlabs.length; i++) {
                const slab = taxSlabs[i];
                const prevLimit = slab.prev_limit;
                const slabRate = slab.rate;
                const slabWidth = slab.slab_width;
                
                let taxableInSlab = 0;
                
                if (currentIncome > prevLimit) {
                    if (slabWidth === Infinity) {
                      
                        taxableInSlab = currentIncome - prevLimit;
                    } else {
                        
                        taxableInSlab = Math.min(slabWidth, currentIncome - prevLimit);
                    }
                }

                if (taxableInSlab > 0) {
                    const taxInSlab = taxableInSlab * slabRate;
                    taxAmount += taxInSlab;
                    totalTaxable += taxableInSlab;
                    
                    const slabRateText = `${(slabRate * 100).toFixed(0)}%`;
                    const slabMin = formatCurrency(prevLimit + (prevLimit > 0 ? 1 : 0));
                    const slabMax = slab.limit === Infinity ? 'Balance' : formatCurrency(slab.limit);
                    
                    if (slabRate > 0) {
                        breakdownHTML += `
                            <p>
                                <span class="font-bold text-gray-100">${slabRateText} on Rs. ${formatCurrency(taxableInSlab)}</span> 
                                (Range: Rs. ${slabMin} to ${slabMax}) = 
                                <span class="text-yellow-300">Rs. ${formatCurrency(taxInSlab)}</span>
                            </p>`;
                    } else {
                        breakdownHTML += `<p class="font-bold text-green-400">Tax-Free Allowance (0%): Rs. ${formatCurrency(slabWidth)}</p>`;
                    }
                }

               
                if (currentIncome <= slab.limit) break;
            }

            const netIncome = grossIncome - taxAmount;

         
            document.getElementById(netIncomeId).innerHTML = `**${netLabel}:** Rs. ${formatCurrency(netIncome)}`;
            document.getElementById(taxAmountId).innerHTML = `**${taxLabel}:** Rs. ${formatCurrency(taxAmount)}`;
            document.getElementById(breakdownId).innerHTML = breakdownHTML;
            resultsEl.classList.remove('hidden');

           
            const chartLabels = [netLabel, taxLabel];
            const chartData = [netIncome, taxAmount];
            const chartColors = ['#22C55E', '#F97316'];
            const taxPercentage = grossIncome > 0 ? ((taxAmount / grossIncome) * 100).toFixed(2) : '0.00';
            const summary = `${grossLabel}: Rs. ${formatCurrency(grossIncome)}. Effective tax rate is ${taxPercentage}%.`;

            renderPieChart(chartId, chartTitle, chartLabels, chartData, chartColors, summary);
        }


       

        function calculateSSCLTax() {
            const turnoverEl = document.getElementById('sscl-turnover');
            const turnover = parseFloat(turnoverEl.value);
            const resultsEl = document.getElementById('sscl-results');
            const chartPanelEl = document.getElementById('sscl-chart-panel');

            if (!validateInputNonNegative(turnover, 'sscl-turnover-validation')) {
                resultsEl.classList.add('hidden');
                chartPanelEl.classList.add('hidden');
                return;
            }

            const THRESHOLD = 10000000; 
            const RATE = 0.025; 

            let taxableTurnover = 0;
            let ssclLevy = 0;
            let message = '';

            if (turnover > THRESHOLD) {
                taxableTurnover = turnover - THRESHOLD;
                ssclLevy = taxableTurnover * RATE;
                message = `The first Rs. ${formatCurrency(THRESHOLD)} is exempt. Tax is calculated on the remaining turnover.`;
            } else {
                taxableTurnover = 0;
                ssclLevy = 0;
                message = `The annual turnover is below the Rs. ${formatCurrency(THRESHOLD)} threshold. No SSCL is levied.`;
            }
            
            const untaxedTurnover = turnover - taxableTurnover;

          
            document.getElementById('sscl-taxable').innerHTML = `**Taxable Turnover (Over Threshold):** Rs. ${formatCurrency(taxableTurnover)}`;
            document.getElementById('sscl-levy').innerHTML = `**SSCL Levy (2.5%):** Rs. ${formatCurrency(ssclLevy)}`;
            document.getElementById('sscl-message').textContent = message;
            resultsEl.classList.remove('hidden');

            
            const chartLabels = ['Exempt Turnover', 'Taxable Turnover', 'SSCL Levy'];
            const chartData = [untaxedTurnover, taxableTurnover, ssclLevy];
            const chartColors = ['#A78BFA', '#8B5CF6', '#10B981'];
            const summary = `Total Annual Turnover: Rs. ${formatCurrency(turnover)}. The SSCL is Rs. ${formatCurrency(ssclLevy)}.`;

            renderBarChart('ssclChart', 'SSCL Turnover Breakdown', chartLabels, chartData, chartColors, summary);
        }


       

        function calculateLeasing() {
            const priceEl = document.getElementById('lease-price');
            const rateEl = document.getElementById('lease-rate');
            const termEl = document.getElementById('lease-term');

            const price = parseFloat(priceEl.value);
            const annualRate = parseFloat(rateEl.value) / 100;
            const termYears = parseInt(termEl.value);

            const resultsEl = document.getElementById('leasing-results');
            const chartPanelEl = document.getElementById('leasing-chart-panel');

            const isValid = validateInput(price, 'lease-price-validation') &&
                            validateInput(annualRate, 'lease-rate-validation') &&
                            validateInput(termYears, 'lease-term-validation');

            if (!isValid) {
                resultsEl.classList.add('hidden');
                chartPanelEl.classList.add('hidden');
                return;
            }

            
            const monthlyRate = annualRate / 12; 
            const numberOfPayments = termYears * 12; 

            
            if (annualRate === 0) {
                const monthlyPayment = price / numberOfPayments;
                const totalCost = price;
                const totalInterest = 0;
                
                document.getElementById('leasing-monthly').innerHTML = `**Monthly Payment:** Rs. ${formatCurrency(monthlyPayment)}`;
                document.getElementById('leasing-total-cost').textContent = `Total Cost (Principal only): Rs. ${formatCurrency(totalCost)}`;
                document.getElementById('leasing-total-interest').textContent = `Total Interest Paid: Rs. ${formatCurrency(totalInterest)} (0% Interest)`;
                resultsEl.classList.remove('hidden');

                
                const chartLabels = ['Principal'];
                const chartData = [price];
                const chartColors = ['#EF4444'];
                const summary = `The total cost is the asset price as the interest rate is 0%.`;
                renderPieChart('leasingChart', 'Lease Cost Breakdown', chartLabels, chartData, chartColors, summary);
                return;
            }


            const pmtNumerator = monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments);
            const pmtDenominator = Math.pow(1 + monthlyRate, numberOfPayments) - 1;
            const monthlyPayment = price * (pmtNumerator / pmtDenominator);

            const totalCost = monthlyPayment * numberOfPayments;
            const totalInterest = totalCost - price;

            
            document.getElementById('leasing-monthly').innerHTML = `**Estimated Monthly Payment:** Rs. ${formatCurrency(monthlyPayment)}`;
            document.getElementById('leasing-total-cost').textContent = `Total Payments (Principal + Interest): Rs. ${formatCurrency(totalCost)}`;
            document.getElementById('leasing-total-interest').textContent = `Total Interest Paid: Rs. ${formatCurrency(totalInterest)}`;
            resultsEl.classList.remove('hidden');

           
            const chartLabels = ['Principal', 'Total Interest'];
            const chartData = [price, totalInterest];
            const chartColors = ['#F87171', '#3B82F6'];
            const summary = `Asset Price (Principal): Rs. ${formatCurrency(price)}. Total interest paid over ${termYears} years: Rs. ${formatCurrency(totalInterest)}.`;

            renderPieChart('leasingChart', 'Lease Cost Breakdown', chartLabels, chartData, chartColors, summary);
        }

        document.addEventListener('DOMContentLoaded', (event) => {
            
            const homeSection = document.getElementById('home');
            if (homeSection) {
                homeSection.style.opacity = '1';
                homeSection.classList.add('active');
                homeSection.style.pointerEvents = 'auto';
            }
        });