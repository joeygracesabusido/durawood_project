$(document).ready(function () {
  // Format helpers
  function formatNumber(value) {
    if (value === null || value === undefined) return '';
    return parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function formatDateOnly(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('/');
  }

  function formatDateTime(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    const month = d.toLocaleString('en-US', { month: 'short' });
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    const time = d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${month}/${day}/${year} ${time}`;
  }

  // Fetch and render header customer info
  async function populateCustomerHeader(customerName) {
    $('#customerName').text(customerName || '');
    try {
      const res = await fetch('/api-get-customer-profiles/');
      if (!res.ok) return; // silently ignore if not available
      const list = await res.json();
      const match = list.find((c) => (c.bussiness_name || '').toLowerCase() === (customerName || '').toLowerCase());
      if (match) {
        $('#customerAddress').text(match.address || '');
        const tel = match.contact_no ? `Tel: ${match.contact_no}` : '';
        $('#customerContact').text(tel);
      }
    } catch (e) {
      // ignore errors; header defaults remain
    }
  }

  // Render transactions table to desired format
  function fetchTransactionHistory(customer) {
    $.ajax({
      url: `/api-get-transaction-history?customer=${encodeURIComponent(customer)}`,
      type: 'GET',
      success: function (data) {
        let rows = '';
        let cumulative = 0;
        let totalDebit = 0;
        let totalCredit = 0;
        let minDate = null;
        let maxDate = null;

        if (Array.isArray(data) && data.length) {
          data.forEach((item) => {
            const isSales = item.type === 'Sales';
            const debit = isSales ? item.sales_amount || 0 : 0;
            const credit = !isSales ? item.payment_amount || 0 : 0;
            cumulative += debit - credit;
            totalDebit += debit;
            totalCredit += credit;

            const dateObj = item.date ? new Date(item.date) : null;
            if (dateObj) {
              if (!minDate || dateObj < minDate) minDate = dateObj;
              if (!maxDate || dateObj > maxDate) maxDate = dateObj;
            }

            // Reference cell content
            let referenceHtml = '';
            if (isSales) {
              referenceHtml = `
                <div class="text-sky-600"><a href="#">${item.invoice_no || ''}</a></div>
                <div class="text-gray-400 text-sm">Sales-Invoice-Transaction</div>
              `;
            } else {
              const parts = [];
              if (item.invoice_no) parts.push(`${item.invoice_no}`);
              if (item.cr_no) parts.push(`Ref ${item.cr_no}`);
              if (item.payment_method) parts.push(item.payment_method);
              const dOnly = formatDateOnly(item.date);
              if (dOnly) parts.push(dOnly);
              referenceHtml = `
                <div class="text-gray-400">Payment: ${parts.join(' / ')}</div>
              `;
            }

            rows += `
              <tr>
                <td class="border px-3 py-2">${formatDateTime(item.date)}</td>
                <td class="border px-3 py-2">${referenceHtml}</td>
                <td class="border px-3 py-2 text-right">${debit ? formatNumber(debit) : '0.00'}</td>
                <td class="border px-3 py-2 text-right">${credit ? formatNumber(credit) : '0.00'}</td>
                <td class="border px-3 py-2 text-right">${formatNumber(cumulative)}</td>
              </tr>
            `;
          });
        } else {
          rows = `
            <tr>
              <td colspan="5" class="border px-3 py-2 text-center">No data available</td>
            </tr>
          `;
        }

        $('#table_sales tbody').html(rows);
        $('#totalDebit').text(formatNumber(totalDebit));
        $('#totalCredit').text(formatNumber(totalCredit));
        $('#remainingBalance').text(formatNumber(totalDebit - totalCredit));

        if (minDate && maxDate) {
          const range = `${formatDateOnly(minDate)} - ${formatDateOnly(maxDate)}`;
          $('#dateRangeDisplay').text(range);
        }
      },
      error: function (xhr) {
        console.error('Error fetching data:', xhr.responseText);
        alert('Failed to load data.');
      },
    });
  }

  // Read customer from query and render
  const customer = new URLSearchParams(window.location.search).get('customer');
  if (customer) {
    populateCustomerHeader(customer);
    fetchTransactionHistory(customer);
  }

  // Export to Excel
  $('#exportExcel').on('click', function () {
    const table = document.getElementById('table_sales');
    const workbook = XLSX.utils.table_to_book(table, { sheet: 'Transaction History' });
    XLSX.writeFile(workbook, 'transaction_history.xlsx');
  });

  // Print the report area (header + table + totals)
  $('#printPDF').on('click', function () {
    const reportHtml = document.querySelector('.card-body').innerHTML;
    const printWindow = window.open('', '', 'width=900,height=700');
    printWindow.document.write(`
      <html>
        <head>
          <title>Customer Transaction History</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 16px; }
            table { border-collapse: collapse; width: 100%; }
            table, th, td { border: 1px solid #ccc; }
            th, td { padding: 6px 8px; }
            thead th { background: #f3f4f6; }
            button { display: none; }
          </style>
        </head>
        <body>${reportHtml}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  });
});
