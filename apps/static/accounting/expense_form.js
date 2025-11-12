$(document).ready(function () {
    const isEditMode = window.location.pathname.includes('/edit-expense/');
    const expenseId = $('#expense_id').val();

    // ====== LOAD CATEGORIES ======
    function loadCategories() {
        $.ajax({
            url: '/api-get-expense-categories/',
            type: "GET",
            cache: false,
            dataType: "json",
            success: function (categories) {
                let select = $("#category");
                categories.forEach(cat => {
                    select.append(`<option value="${cat}">${cat}</option>`);
                });

                // Set selected category if in edit mode
                if (isEditMode && categories.length > 0) {
                    setTimeout(() => {
                        // Category should already be set by template
                    }, 100);
                }
            },
            error: function (xhr) {
                console.error("Error loading categories:", xhr);
                alert("Failed to load expense categories");
            }
        });
    }

    // ====== SET DEFAULT DATE ======
    function setDefaultDate() {
        if (!isEditMode) {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            $('#date').val(formattedDate);
        }
    }

    // ====== FORM SUBMISSION ======
    $("#expense_form").on("submit", function (e) {
        e.preventDefault();

        // Validate form
        if (!this.checkValidity()) {
            e.stopPropagation();
            $(this).addClass('was-validated');
            return false;
        }

        const formData = {
            date: new Date($('#date').val()),
            category: $('#category').val(),
            vendor: $('#vendor').val(),
            description: $('#description').val(),
            amount: parseFloat($('#amount').val()),
            payment_method: $('#payment_method').val(),
            reference_no: $('#reference_no').val() || null,
            status: $('#status').val(),
            remarks: $('#remarks').val() || null
        };

        console.log("📝 Form Data:", formData);

        if (isEditMode) {
            updateExpense(expenseId, formData);
        } else {
            addExpense(formData);
        }
    });

    // ====== ADD EXPENSE ======
    function addExpense(formData) {
        $.ajax({
            url: '/api-add-expense/',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                console.log("✅ Expense added:", response);
                alert("✅ Expense added successfully!");
                window.location.href = '/expense-list/';
            },
            error: function (xhr) {
                console.error("❌ Error adding expense:", xhr);
                const errorMsg = xhr.responseJSON?.detail || "Failed to add expense";
                alert("❌ Error: " + errorMsg);
            }
        });
    }

    // ====== UPDATE EXPENSE ======
    function updateExpense(id, formData) {
        $.ajax({
            url: `/api-update-expense/${id}`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {
                console.log("✅ Expense updated:", response);
                alert("✅ Expense updated successfully!");
                window.location.href = '/expense-list/';
            },
            error: function (xhr) {
                console.error("❌ Error updating expense:", xhr);
                const errorMsg = xhr.responseJSON?.detail || "Failed to update expense";
                alert("❌ Error: " + errorMsg);
            }
        });
    }

    // ====== DELETE EXPENSE ======
    $("#btn_delete").on("click", function () {
        if (!confirm("Are you sure you want to delete this expense? This action cannot be undone.")) {
            return;
        }

        $.ajax({
            url: `/api-delete-expense/${expenseId}`,
            type: 'DELETE',
            success: function (response) {
                console.log("✅ Expense deleted:", response);
                alert("✅ Expense deleted successfully!");
                window.location.href = '/expense-list/';
            },
            error: function (xhr) {
                console.error("❌ Error deleting expense:", xhr);
                const errorMsg = xhr.responseJSON?.detail || "Failed to delete expense";
                alert("❌ Error: " + errorMsg);
            }
        });
    });

    // ====== INITIALIZE ======
    loadCategories();
    if (!isEditMode) {
        setDefaultDate();
    }
});
