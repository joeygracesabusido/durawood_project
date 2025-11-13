// QuickBooks-Style Expense Form JavaScript

$(document).ready(function() {
    const isEditMode = window.location.pathname.includes('/edit-expense/');

    // Initialize form
    initializeForm();
    loadCategories();
    loadPayees();
    if (!isEditMode) {
        setDefaultDate();
    }
    initPayeeAutocomplete();  // Initialize payee autocomplete
    initCustomerAutocomplete();  // Initialize customer autocomplete

    // Event Listeners
    $(document).on('change', '.amount-input, .tax-input, #tax_type', function() {
        calculateTotals();
    });

    $(document).on('click', '#add_line', addExpenseLine);
    $(document).on('click', '.delete-line', deleteExpenseLine);
    $(document).on('click', '#clear_lines', clearAllLines);
    $(document).on('click', '#add_attachment', triggerFileInput);
    $(document).on('click', '.remove-attachment', removeAttachment);

            if (!isEditMode) {
                $('#expense_form').on('submit', function(e) {
                    e.preventDefault();
                    submitExpenseForm();
                });
            }
    $('#add_new_payee').on('click', function(e) {
        e.preventDefault();
        openAddPayeeModal();
    });
});

// Initialize Form
function initializeForm() {
    if (!window.location.pathname.includes('/edit-expense/')) {
        const today = new Date().toISOString().split('T')[0];
        $('#date').val(today);
    }
}

// Set Default Date to Today
function setDefaultDate() {
    if (!window.location.pathname.includes('/edit-expense/')) {
        const today = new Date().toISOString().split('T')[0];
        $('#date').val(today);
    }
}

// Load Categories
function loadCategories() {
    $.ajax({
        url: '/api-get-expense-categories/',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            const categories = response.categories || [];
            const categorySelects = document.querySelectorAll('.category-select');
            
            categorySelects.forEach(select => {
                select.innerHTML = '<option value="">Select...</option>';
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat;
                    option.textContent = cat;
                    select.appendChild(option);
                });
            });
        },
        error: function(error) {
            console.error('Error loading categories:', error);
        }
    });
}

// Load Payees
function loadPayees() {
    // Payees will be loaded via autocomplete on input
    // This function is kept for compatibility
}

// Autocomplete for Payee
function initPayeeAutocomplete() {
    const payeeInput = $('#payee');
    const suggestionsList = $('#payee-suggestions');
    let autocompleteTimeout;
    
    payeeInput.on('input', function() {
        clearTimeout(autocompleteTimeout);
        const term = $(this).val().trim();
        
        console.log('Payee input changed:', term);
        
        if (term.length === 0) {
            suggestionsList.hide();
            suggestionsList.empty();
            return;
        }
        
        // Debounce the autocomplete call
        autocompleteTimeout = setTimeout(function() {
            console.log('Fetching suggestions for:', term);
            fetchPayeeSuggestions(term);
        }, 300);
    });
    
    // Hide suggestions when input loses focus
    payeeInput.on('blur', function() {
        setTimeout(function() {
            suggestionsList.fadeOut();
        }, 200);
    });
    
    // Show suggestions on focus if there are any
    payeeInput.on('focus', function() {
        if (suggestionsList.find('li').length > 0 && $(this).val().length > 0) {
            suggestionsList.show();
        }
    });
}

// Fetch Payee Suggestions
function fetchPayeeSuggestions(term) {
    $.ajax({
        url: '/api-autocomplete-vendor-customer/?term=' + encodeURIComponent(term),
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            console.log('Raw API response:', response);
            
            // Handle both formats: {suggestions: [...]} and direct array [...]
            let suggestions = [];
            if (response.suggestions) {
                suggestions = response.suggestions;
            } else if (Array.isArray(response)) {
                suggestions = response;
            }
            
            console.log('Processed suggestions:', suggestions);
            displayPayeeSuggestions(suggestions);
        },
        error: function(error) {
            console.error('Error fetching payee suggestions:', error);
            console.log('Response status:', error.status);
            console.log('Response text:', error.responseText);
            displayPayeeSuggestions([]); // Show "No suggestions found"
        }
    });
}

// Display Payee Suggestions
function displayPayeeSuggestions(suggestions) {
    const suggestionsList = $('#payee-suggestions');
    suggestionsList.empty();
    
    console.log('Displaying suggestions:', suggestions);
    console.log('Suggestions count:', suggestions ? suggestions.length : 0);
    
    if (!suggestions || suggestions.length === 0) {
        console.log('No suggestions, showing "No suggestions found"');
        suggestionsList.append('<li class="no-results">No suggestions found</li>');
        suggestionsList.show();
    } else {
        suggestions.forEach(function(suggestion, index) {
            // Handle both string suggestions and object suggestions
            let displayText = suggestion;
            let selectValue = suggestion;
            
            // If suggestion is an object with 'value' field
            if (typeof suggestion === 'object' && suggestion.value) {
                displayText = suggestion.value;
                selectValue = suggestion.value;
                console.log(`Item ${index}: ${displayText}`);
            } else {
                console.log(`Item ${index}: ${suggestion}`);
            }
            
            const li = $('<li></li>')
                .text(displayText)
                .on('click', function() {
                    console.log('Selected payee:', selectValue);
                    $('#payee').val(selectValue);
                    suggestionsList.hide();
                });
            suggestionsList.append(li);
        });
        
        console.log('Showing suggestions list with', suggestions.length, 'items');
        suggestionsList.show();
    }
}
// Autocomplete for Customer (dynamically added fields)
function initCustomerAutocomplete() {
    $(document).on('input', '.customer-input', function() {
        const customerInput = $(this);
        const suggestionsList = customerInput.next('.customer-suggestions');
        let autocompleteTimeout;
        
        clearTimeout(autocompleteTimeout);
        const term = customerInput.val().trim();
        
        console.log('Customer input changed:', term);
        
        if (term.length === 0) {
            suggestionsList.css('display', 'none');
            suggestionsList.empty();
            return;
        }
        
        // Debounce the autocomplete call
        autocompleteTimeout = setTimeout(function() {
            console.log('Fetching customer suggestions for:', term);
            fetchCustomerSuggestions(term, suggestionsList);
        }, 300);
    });
    
    // Hide suggestions when input loses focus
    $(document).on('blur', '.customer-input', function() {
        const customerInput = $(this);
        const suggestionsList = customerInput.next('.customer-suggestions');
        setTimeout(function() {
            suggestionsList.css('display', 'none');
        }, 200);
    });
    
    // Show suggestions on focus if there are any
    $(document).on('focus', '.customer-input', function() {
        const customerInput = $(this);
        const suggestionsList = customerInput.next('.customer-suggestions');
        if (suggestionsList.find('li').length > 0 && customerInput.val().length > 0) {
            suggestionsList.css('display', 'block');
        }
    });
}

// Fetch Customer Suggestions
function fetchCustomerSuggestions(term, suggestionsList) {
    $.ajax({
        url: '/api-autocomplete-vendor-customer/?term=' + encodeURIComponent(term),
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            console.log('Raw customer API response:', response);
            
            // Handle both formats: {suggestions: [...]} and direct array [...]
            let suggestions = [];
            if (response.suggestions) {
                suggestions = response.suggestions;
            } else if (Array.isArray(response)) {
                suggestions = response;
            }
            
            console.log('Processed customer suggestions:', suggestions);
            displayCustomerSuggestions(suggestions, suggestionsList);
        },
        error: function(error) {
            console.error('Error fetching customer suggestions:', error);
            console.log('Response status:', error.status);
            console.log('Response text:', error.responseText);
            displayCustomerSuggestions([], suggestionsList); // Show "No suggestions found"
        }
    });
}

// Display Customer Suggestions
function displayCustomerSuggestions(suggestions, suggestionsList) {
    suggestionsList.empty();
    
    console.log('Displaying customer suggestions:', suggestions);
    console.log('Customer suggestions count:', suggestions ? suggestions.length : 0);
    
    if (!suggestions || suggestions.length === 0) {
        console.log('No customer suggestions, showing "No suggestions found"');
        suggestionsList.append('<li class="no-results">No suggestions found</li>');
    } else {
        suggestions.forEach(function(suggestion, index) {
            // Handle both string suggestions and object suggestions
            let displayText = suggestion;
            let selectValue = suggestion;
            
            // If suggestion is an object with 'value' field
            if (typeof suggestion === 'object' && suggestion.value) {
                displayText = suggestion.value + " (" + suggestion.category + ")";
                selectValue = suggestion.value;
                console.log(`Customer Item ${index}: ${displayText}`);
            } else {
                console.log(`Customer Item ${index}: ${suggestion}`);
            }
            
            const li = $('<li></li>')
                .text(displayText)
                .on('click', function() {
                    console.log('Selected customer:', selectValue);
                    suggestionsList.prev('.customer-input').val(selectValue);
                    suggestionsList.css('display', 'none');
                });
            suggestionsList.append(li);
        });
        
        console.log('Showing customer suggestions list with', suggestions.length, 'items');
    }
    
    // Show the dropdown
    suggestionsList.css('display', 'block');
}

// Add Expense Line
function addExpenseLine(e) {
    e.preventDefault();
    
    const tableBody = $('#expense_lines_table');
    const lineCount = tableBody.find('tr').length + 1;
    
    const newLine = `
        <tr data-line-id="${lineCount}">
            <td class="line-number">${lineCount}</td>
            <td>
                <select class="form-control form-control-sm category-select" name="category">
                    <option value="">Select...</option>
                </select>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm description-input" name="description" placeholder="Description">
            </td>
            <td>
                <input type="number" class="form-control form-control-sm amount-input text-end" name="amount" placeholder="0.00" step="0.01" value="0.00">
            </td>
            <td>
                <input type="number" class="form-control form-control-sm tax-input text-end" name="tax" placeholder="0.00" step="0.01" value="0.00">
            </td>
            <td>
                <div class="autocomplete-wrapper">
                    <input type="text" class="form-control form-control-sm customer-input" name="customer" placeholder="Customer">
                    <ul class="customer-suggestions dropdown-menu"></ul>
                </div>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm" name="class" placeholder="Class">
            </td>
            <td>
                <button type="button" class="btn btn-sm btn-link delete-line" title="Delete line">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `;
    
    tableBody.append(newLine);
    
    // Load categories for new select
    loadCategoryForNewSelect(lineCount);
    
    // Attach change handlers
    tableBody.find(`tr[data-line-id="${lineCount}"] .amount-input, tr[data-line-id="${lineCount}"] .tax-input`).on('change', function() {
        calculateTotals();
    });
    
    calculateTotals();
}

// Load Category for New Select
function loadCategoryForNewSelect(lineId) {
    $.ajax({
        url: '/api-get-expense-categories/',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            const categories = response.categories || [];
            const select = $(`tr[data-line-id="${lineId}"] .category-select`);
            
            select.html('<option value="">Select...</option>');
            categories.forEach(cat => {
                select.append(`<option value="${cat}">${cat}</option>`);
            });
        }
    });
}

// Delete Expense Line
function deleteExpenseLine(e) {
    e.preventDefault();
    
    const lineCount = $('#expense_lines_table tr').length;
    if (lineCount <= 1) {
        alert('You must have at least one expense line');
        return;
    }
    
    $(this).closest('tr').remove();
    updateLineNumbers();
    calculateTotals();
}

// Update Line Numbers
function updateLineNumbers() {
    $('#expense_lines_table tr').each(function(index) {
        $(this).find('.line-number').text(index + 1);
        $(this).attr('data-line-id', index + 1);
    });
}

// Clear All Lines
function clearAllLines(e) {
    e.preventDefault();
    
    if (confirm('Are you sure you want to clear all expense lines?')) {
        $('#expense_lines_table').html(`
            <tr data-line-id="1">
                <td class="line-number">1</td>
                <td>
                    <select class="form-control form-control-sm category-select" name="category" required>
                        <option value="">Select...</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="form-control form-control-sm description-input" name="description" placeholder="Description">
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm amount-input text-end" name="amount" placeholder="0.00" step="0.01" value="0.00">
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm tax-input text-end" name="tax" placeholder="0.00" step="0.01" value="0.00">
                </td>
                <td>
                    <div class="autocomplete-wrapper">
                        <input type="text" class="form-control form-control-sm customer-input" name="customer" placeholder="Customer">
                        <ul class="customer-suggestions dropdown-menu"></ul>
                    </div>
                </td>
                <td>
                    <input type="text" class="form-control form-control-sm" name="class" placeholder="Class">
                </td>
                <td>
                    <button type="button" class="btn btn-sm btn-link delete-line" title="Delete line">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `);
        
        loadCategories();
        calculateTotals();
    }
}

// Format Number with Thousands Separator and 2 Decimal Places
function formatNumberWithThousandsSeparator(number) {
    return parseFloat(number).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Calculate Totals
function calculateTotals() {
    const taxType = $('#tax_type').val();
    let subtotal = 0;
    let totalTax = 0;

    $('#expense_lines_table tr').each(function() {
        const row = $(this);
        const amountInput = row.find('.amount-input');
        const taxInput = row.find('.tax-input');
        
        const amount = parseFloat(amountInput.val()) || 0;
        let calculatedTax = 0;
        let lineSubtotal = amount;

        if (taxType === 'inclusive') {
            // When inclusive, the amount entered is the total for the line.
            // The line's subtotal (net amount) is amount / 1.12
            lineSubtotal = amount / 1.12;
            calculatedTax = lineSubtotal * 0.12;
        } else { // 'exclusive'
            // When exclusive, the amount entered is the subtotal for the line.
            calculatedTax = amount * 0.12;
        }

        taxInput.val(calculatedTax.toFixed(2));

        subtotal += lineSubtotal;
        totalTax += calculatedTax;
    });

    const total = subtotal + totalTax;

    // Update display
    $('#subtotal').text(formatNumberWithThousandsSeparator(subtotal));
    $('#total_amount').text(formatNumberWithThousandsSeparator(total));
    $('#total_display').text(formatNumberWithThousandsSeparator(total));
}

// File Input Triggers
function triggerFileInput(e) {
    e.preventDefault();
    $('#attachments').click();
}

// Handle File Selection
$('#attachments').on('change', function() {
    const files = this.files;
    const attachmentList = $('#attachment_list');

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileSize = (file.size / (1024 * 1024)).toFixed(2); // Convert to MB

        if (fileSize > 20) {
            alert(`File "${file.name}" exceeds 20 MB limit`);
            continue;
        }

        const attachmentItem = document.createElement('div');
        attachmentItem.className = 'attachment-item';
        attachmentItem.innerHTML = `
            <div>
                <i class="bi bi-paperclip"></i>
                <span>${file.name}</span>
                <small class="text-muted">(${fileSize} MB)</small>
            </div>
            <button type="button" class="remove-attachment" data-file-name="${file.name}">
                <i class="bi bi-x"></i>
            </button>
        `;

        attachmentList.append(attachmentItem);
    }

    // Reset file input
    this.value = '';
});

// Remove Attachment
function removeAttachment(e) {
    e.preventDefault();
    $(this).closest('.attachment-item').remove();
}

// Submit Expense Form
function submitExpenseForm() {
    const formData = {
        date: $('#date').val(),
        payee: $('#payee').val() || 'General Expense',
        payment_account: $('#payment_account').val(),
        status: 'Approved',
        remarks: $('#remarks').val(),
        tax_type: $('#tax_type').val(),
        lines: []
    };

    // Collect expense lines
    $('#expense_lines_table tr').each(function() {
        const line = {
            category: $(this).find('.category-select').val(),
            description: $(this).find('.description-input').val(),
            amount: parseFloat($(this).find('.amount-input').val()) || 0,
            tax: parseFloat($(this).find('.tax-input').val()) || 0,
            customer: $(this).find('input[name="customer"]').val(),
            class: $(this).find('input[name="class"]').val()
        };

        if (line.category && line.amount > 0) {
            formData.lines.push(line);
        }
    });

    // Validate
    if (!formData.date) {
        alert('Date is required');
        return;
    }

    if (!formData.payment_account) {
        alert('Payment account is required');
        return;
    }

    if (formData.lines.length === 0) {
        alert('Please add at least one expense line with category and amount');
        return;
    }

    // Convert lines into individual expenses or save as one record
    // Depending on your backend, you might save the whole form or individual lines
    
    $.ajax({
        url: '/api-add-expense/',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            date: formData.date,
            category: formData.lines[0].category, // Primary category from first line
            vendor: formData.payee,
            description: formData.lines.map(l => l.description).join('; '),
            amount: formData.lines.reduce((sum, l) => sum + l.amount, 0),
            payment_method: 'Payment Account',
            reference_no: formData.payment_account,
            remarks: formData.remarks,
            status: formData.status,
            tax_type: formData.tax_type
        }),
        success: function(response) {
            alert('✅ Expense saved successfully!');
            window.location.href = '/expense-list/';
        },
        error: function(error) {
            console.error('Error saving expense:', error);
            alert('Error saving expense: ' + (error.responseJSON?.detail || error.statusText));
        }
    });
}

// Add Payee Modal (Optional - if you want to add new payees)
function openAddPayeeModal() {
    const payeeName = prompt('Enter new payee name:');
    if (payeeName) {
        // Add to dropdown and select it
        const option = document.createElement('option');
        option.value = payeeName;
        option.textContent = payeeName;
        option.selected = true;
        $('#payee').append(option);
    }
}

// Format Currency Display
function formatCurrency(value) {
    return parseFloat(value).toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP'
    });
}

// Document Ready Functions
$(document).ready(function() {
    // Add keyboard shortcuts
    $(document).on('keydown', function(e) {
        // Alt + Shift + S to submit
        if (e.altKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            submitExpenseForm();
        }
    });

    // Format totals on load
    calculateTotals();
});
