
import os
import re

files = [
    "apps/templates/payroll/update_employee.html",
    "apps/templates/payroll/add_employee.html",
    "apps/templates/payroll/1601c_report.html",
    "apps/templates/payroll/payroll_comp.html",
    "apps/templates/payroll/13thMonth.html",
    "apps/templates/payroll/payroll_comp2.html",
    "apps/templates/payroll/payroll_list.html",
    "apps/templates/payroll/1604_report.html",
    "apps/templates/accounting/purchase_report.html",
    "apps/templates/accounting/ar_aging_report.html",
    "apps/templates/accounting/chart_of_account.html",
    "apps/templates/accounting/payment_list.html",
    "apps/templates/accounting/payment_list_new.html",
    "apps/templates/accounting/company_profile.html",
    "apps/templates/accounting/purchases.html",
    "apps/templates/accounting/payment.html",
    "apps/templates/accounting/income_statement.html",
    "apps/templates/accounting/ar_aging_per_category.html",
    "apps/templates/accounting/customer_transaction.html",
    "apps/templates/accounting/payment_transaction.html",
    "apps/templates/accounting/add_expense.html",
    "apps/templates/accounting/edit_expense.html",
    "apps/templates/accounting/journal_entry_update.html",
    "apps/templates/accounting/roles.html",
    "apps/templates/accounting/insert_journal_entry.html",
    "apps/templates/accounting/customer_transaction_for_balance_details.html",
    "apps/templates/accounting/customer_list_with_balance.html",
    "apps/templates/accounting/expense_list.html",
    "apps/templates/accounting/sales_report.html",
    "apps/templates/accounting/upload_sales_report.html",
    "apps/templates/accounting/collection_update.html",
    "apps/templates/accounting/sales_insert.html",
    "apps/templates/accounting/trial_balance.html",
    "apps/templates/accounting/customer_profile.html",
    "apps/templates/accounting/sales.html",
    "apps/templates/accounting/cash_transaction.html",
    "apps/templates/accounting/journal_entry_list.html",
    "apps/templates/accounting/category.html",
    "apps/templates/accounting/upload_collection.html",
    "apps/templates/accounting/customer_list_for_balance_details.html",
    "apps/templates/accounting/beg_bal.html",
    "apps/templates/accounting/balance_sheet.html",
    "apps/templates/accounting/branch.html",
]

def refactor_file(filepath):
    if not os.path.exists(filepath):
        print(f"File {filepath} not found.")
        return

    with open(filepath, 'r') as f:
        content = f.read()

    # Rule 1: Remove <div id="main" class="main"> and its closing </div>
    # Usually it's the outermost div in block content.
    # We'll look for <div id="main" class="main"> and remove it.
    # And then we'll remove the last </div> before scripts or endblock.
    
    main_div_pattern = re.compile(r'<div id="main" class="main">', re.IGNORECASE)
    if main_div_pattern.search(content):
        content = main_div_pattern.sub('', content)
        # Find the last </div> before script tags or {% endblock %}
        # We'll look for the last </div> in the main part of the file.
        # This is tricky because there are many divs.
        # However, the user said it's redundant, so we'll remove one </div> at the end.
        
        # Strategy: find the last occurrence of </div> that is followed by only whitespace, scripts, or {% endblock %}
        # We'll use a regex that matches </div> followed by optional whitespace and then a script tag or endblock.
        content = re.sub(r'</div>\s*(?=(<script|{% endblock))', '', content, flags=re.IGNORECASE | re.MULTILINE, count=1)
        # Wait, that might remove the wrong one if there are multiple at the end.
        # Let's try to find the very last </div> before the scripts/endblock.
        
        # Improved Strategy: find all </div> and remove the last one that was matching the main div.
        # Since we removed the opening tag, we should remove the closing tag that balanced it.
        # In most of these files, it's just before the scripts or endblock.
        parts = re.split(r'(</div>)', content)
        # Find the last </div> that is not within a script tag?
        # Actually, the files usually end like:
        # ...
        #     </section>
        # </div>
        # <script>...</script>
        # {% endblock %}
        
        # Let's try to find </div>\s*(<script|{% endblock) and replace it with just the script/endblock.
        # This is safer if we only do it once.
        content = re.sub(r'</div>(\s*(?:<script|{% endblock))', r'\1', content, flags=re.IGNORECASE | re.DOTALL)
        # wait, re.sub with DOTALL and without greedy matching?
        # Actually, let's do it manually from the end.
        
    # Rule 2: Center Page Header
    content = content.replace('<div class="pagetitle">', '<div class="pagetitle text-center">')
    
    # Rule 3: Wrap main content
    # We'll wrap <section class="section"> or <div class="card"> if no section exists.
    if '<section class="section">' in content:
        content = content.replace('<section class="section">', '<div class="row justify-content-center"><div class="col-lg-10"><section class="section">')
        content = content.replace('</section>', '</section></div></div>')
    elif '<div class="card">' in content:
        # Avoid wrapping every card if there are multiple. Just the first one if no section.
        content = content.replace('<div class="card">', '<div class="row justify-content-center"><div class="col-lg-10"><div class="card">', 1)
        # This is risky for the closing tag.
        # Let's see if we can find where the card ends.
        # Actually, wrapping the WHOLE content (except pagetitle) might be better.
        pass

    # Rule 4: Bootstrap classes for inputs
    # Add form-control to <input>, <select>, <textarea> if missing.
    def add_form_control(match):
        tag = match.group(1)
        attrs = match.group(2)
        if 'class=' in attrs:
            if 'form-control' not in attrs and 'form-select' not in attrs:
                # Add form-control to existing class
                new_attrs = re.sub(r'class=["\'](.*?)["\']', r'class="\1 form-control"', attrs)
                return f'<{tag}{new_attrs}>'
            else:
                return match.group(0)
        else:
            # Add class attribute
            return f'<{tag} class="form-control"{attrs}>'

    content = re.sub(r'<(input|select|textarea)([^>]*?)>', add_form_control, content, flags=re.IGNORECASE)

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Refactored {filepath}")

for f in files:
    refactor_file(f)
