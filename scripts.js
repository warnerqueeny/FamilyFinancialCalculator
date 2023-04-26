const categories = 6;

function calculateSavings() {
    const targetSavings = parseFloat(document.getElementById("target-savings").value);

    const allocations = [];
    const currentBalances = [];
    const interestRates = [];
    const maturities = [];
    for (let i = 1; i <= categories; i++) {
        const slider = document.getElementById(`slider-${i}`);
        allocations.push(parseFloat(slider.value) / 100 * targetSavings);
        currentBalances.push(parseFloat(document.getElementById(`current-balance-${i}`).value));
        interestRates.push(parseFloat(document.getElementById(`interest-rate-${i}`).value) / 100 / 12); // Divide interest rate by 12
        maturities.push(parseFloat(document.getElementById(`maturity-${i}`).value) * 12); // Multiply maturity by 12
    }

    const futureValues = [];
    for (let i = 0; i < categories; i++) {
        const futureValue = currentBalances[i] * Math.pow(1 + interestRates[i], maturities[i]) + allocations[i] * ((Math.pow(1 + interestRates[i], maturities[i]) - 1) / interestRates[i]);
        futureValues.push(futureValue);
        document.getElementById(`future-value-${i + 1}`).innerText = formatCurrency(futureValue);
        document.getElementById(`monthly-allocation-amount-${i + 1}`).innerText = formatCurrency(allocations[i]);
    }
}

function updateAllocations(currentSlider) {
    let currentSliderIndex = parseInt(currentSlider.id.split("-")[1]) - 1;
    let updatedAllocationPercentage = parseFloat(currentSlider.value);

    let allocations = [];
    let remainingAllocationPercentage = 100;
    for (let i = 1; i <= categories; i++) {
        allocations.push(parseFloat(document.getElementById(`slider-${i}`).value));
        if (i < currentSliderIndex + 1) {
            remainingAllocationPercentage -= allocations[i - 1];
        }
    }

    let allocationLimits = [];
    for (let i = 1; i <= categories; i++) {
        if (i <= currentSliderIndex + 1) {
            allocationLimits.push(remainingAllocationPercentage);
        } else {
            let allocationLimit = Math.max(0, 100 - remainingAllocationPercentage - allocations[i - 2]);
            allocationLimits.push(allocationLimit);
        }
    }

    let totalAllocationPercentage = 0;
    let highestPriorityAllocations = 0;
    for (let i = 1; i <= categories; i++) {
        let allocation = parseFloat(document.getElementById(`slider-${i}`).value);
        if (i === currentSliderIndex + 1) {
            allocation = updatedAllocationPercentage;
            highestPriorityAllocations = allocation;
        } else if (i >= currentSliderIndex + 1 && highestPriorityAllocations > 0) {
            let allocationLimit = allocationLimits[i - 1];
            let maxAllocation = Math.min(allocationLimit, remainingAllocationPercentage + allocation - 100);
            allocation = Math.max(Math.min(allocation, maxAllocation), 0);
        }
        totalAllocationPercentage += allocation;
        allocations[i - 1] = allocation;
        remainingAllocationPercentage = Math.max(remainingAllocationPercentage - allocation, 0);
    }

    if (totalAllocationPercentage !== 100) {
        let allocationAdjustment = (100 - totalAllocationPercentage) / (categories - currentSliderIndex);
        for (let i = currentSliderIndex + 1; i <= categories; i++) {
            allocations[i - 1] += allocationAdjustment;
        }
    }

    // Adjust the allocations that exceed 100%.
    let excessAllocationPercentage = totalAllocationPercentage - 100;
    while (excessAllocationPercentage > 0) {
        let maxAllocation = 0;
        let maxAllocationIndex = -1;
        for (let i = 1; i <= categories; i++) {
            if (allocations[i - 1] > allocationLimits[i - 1]) {
                let allocation = allocations[i - 1] - allocationLimits[i - 1];
                if (allocation > maxAllocation) {
                    maxAllocation = allocation;
                    maxAllocationIndex = i - 1;
                }
            }
        }
        if (maxAllocationIndex >= 0) {
            allocations[maxAllocationIndex] -= Math.min(excessAllocationPercentage, maxAllocation);
            excessAllocationPercentage -= Math.min(excessAllocationPercentage, maxAllocation);
        } else {
            break;
        }
    }

    for (let i = 1; i <= categories; i++) {
        document.getElementById(`slider-${i}`).value = allocations[i - 1];
    }

    calculateSavings();
}

function createTableRows() {
    const tableBody = document.getElementById('allocation-table').getElementsByTagName('tbody')[0];
    for (let i = 1; i <= categories; i++) {
        const row = tableBody.insertRow();

        const allocationGroupCell = row.insertCell(0);
        const categoryNameInput = document.createElement('input');
        categoryNameInput.type = 'text';
        categoryNameInput.value = `Category ${i}`;
        categoryNameInput.id = `category-name-${i}`;
        allocationGroupCell.appendChild(categoryNameInput);

        const monthlyAllocationCell = row.insertCell(1);
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = 0;
        slider.max = 100;
        slider.value = 100 / categories;
        slider.className = 'slider';
        slider.id = `slider-${i}`;
        slider.oninput = function() {
            updateAllocations(this);
        };
        monthlyAllocationCell.appendChild(slider);

        const monthlyAllocationAmount = document.createElement('span');
        monthlyAllocationAmount.id = `monthly-allocation-amount-${i}`;
        monthlyAllocationCell.append(monthlyAllocationAmount);

        const currentBalanceCell = row.insertCell(2);
        const currentBalanceInput = document.createElement('input');
        currentBalanceInput.type = 'number';
        currentBalanceInput.placeholder = 'Enter balance';
        currentBalanceInput.id = `current-balance-${i}`;
        currentBalanceInput.oninput = calculateSavings;
        currentBalanceCell.appendChild(currentBalanceInput);

        const interestRateCell = row.insertCell(3);
        const interestRateInput = document.createElement('input');
        interestRateInput.type = 'number';
        interestRateInput.placeholder = 'Enter rate';
        interestRateInput.id = `interest-rate-${i}`;
        interestRateInput.oninput = calculateSavings;
        interestRateCell.appendChild(interestRateInput);

        const maturityCell = row.insertCell(4);
        const maturityInput = document.createElement('input');
        maturityInput.type = 'number';
        maturityInput.placeholder = 'Enter years';
        maturityInput.id = `maturity-${i}`;
        maturityInput.oninput = calculateSavings;
        maturityCell.appendChild(maturityInput);

        const futureValueCell = row.insertCell(5);
        futureValueCell.id = `future-value-${i}`;

        // Add oninput event listener for the input fields
        [slider, currentBalanceInput, interestRateInput, maturityInput].forEach(input => {
            input.oninput = function() {
                updateAllocations(this);
            }
        });
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}

createTableRows();
