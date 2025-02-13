// // $(document).ready(function () {
// //     $('#btn_upload_file').on('click', function () {
// //         console.log("Insert button clicked"); // Debugging button click

// //         const fileInput = $('#file_upload')[0].files[0]; // Get the file
// //         if (!fileInput) {
// //             alert("Please select a file first.");
// //             console.log("No file selected."); // Debugging no file selected
// //             return;
// //         }

// //         const reader = new FileReader();

// //         reader.onload = function (e) {
// //             console.log("File reading started."); // Debugging file reading
// //             const data = new Uint8Array(e.target.result);
// //             const workbook = XLSX.read(data, { type: 'array' });

// //             // Get the first sheet
// //             const firstSheetName = workbook.SheetNames[0];
// //             const worksheet = workbook.Sheets[firstSheetName];

// //             // Convert the sheet data to JSON (array format)
// //             const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
// //             console.log("Parsed JSON data:", jsonData); // Debug parsed data

// //             if (jsonData.length === 0) {
// //                 alert("No data found in the file.");
// //                 console.log("File is empty."); // Debugging empty file
// //                 return;
// //             }

// //             let completedRows = 0;
// //             const totalRows = jsonData.length;

// //             // Insert the data into the database
// //             const apiUrl = '/api-insert-journal-entrimport2/';

// //             jsonData.forEach((row, index) => {
// //                 if (index === 0) return; // Skip the header row
// //                 console.log("Processing row:", row); // Debugging current row

// //                 const payload = {
// //                     transdate: row[0], // Assuming the transdate is in the first column
// //                     journal_type: String(row[1] || 'Unknown'),
// //                     reference: String(row[2] || 'N/A'),
// //                     chart_of_account: String(row[3] || ''),
// //                     chart_of_account_code: String(row[4] || ''),
// //                     account_code_id: parseInt(row[5] || 0),
// //                     debit: parseFloat(row[6] || 0),
// //                     credit: parseFloat(row[7] || 0),
// //                     branch_id: parseInt(row[8] || 0),
// //                     description: row[9] || 'No description provided',
// //                 };

// //                 console.log("Payload to be sent:", payload); // Debugging payload

// //                 // Make an AJAX POST request
// //                 $.ajax({
// //                     url: apiUrl,
// //                     type: 'POST',
// //                     contentType: 'application/json',
// //                     data: JSON.stringify(payload),
// //                     success: function () {
// //                         completedRows++;
// //                         updateProgress(completedRows, totalRows);
// //                         console.log(`Row ${index} inserted successfully.`); // Debug success

// //                         if (completedRows === totalRows) {
// //                             alert("All data inserted successfully!");
// //                         }
// //                     },
// //                     error: function (xhr) {
// //                         console.error(`Error inserting row ${index}:`, xhr.responseText);
// //                         completedRows++;
// //                         updateProgress(completedRows, totalRows);
// //                     }
// //                 });
// //             });
// //         };

// //         reader.onerror = function (error) {
// //             console.error("Error reading file:", error);
// //             alert("Failed to read the file. Please try again.");
// //         };

// //         // Read the file as a binary string
// //         reader.readAsArrayBuffer(fileInput);

// //         function updateProgress(completed, total) {
// //             const percentage = ((completed / total) * 100).toFixed(2);
// //             $('#progress_status').text(`Progress: ${percentage}% (${completed}/${total} rows)`);
// //         }
// //     });
// // });


// // 

// $(document).ready(function () {
//     $('#btn_upload_file').on('click', function () {
//         const fileInput = $('#file_upload')[0].files[0]; // Get the file

//         if (!fileInput) {
//             alert("Please select a file first.");
//             return;
//         }

//         const reader = new FileReader();

//         reader.onload = function (e) {
//             const data = new Uint8Array(e.target.result);
//             const workbook = XLSX.read(data, { type: 'array' });

//             // Get the first sheet
//             const firstSheetName = workbook.SheetNames[0];
//             const worksheet = workbook.Sheets[firstSheetName];

//             // Convert the sheet data to JSON (array format)
//             const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
//             console.log(jsonData)
//             // Get the total rows for progress calculation
//             const totalRows = jsonData.length - 1; // Exclude header row
//             if (totalRows <= 0) {
//                 alert("No data found in the file.");
//                 return;
//             }

//             let completedRows = 0;

//             // Insert the data into the database
//             const apiUrl = '/api-insert-journal-entry-import2/';

//             jsonData.forEach((row, index) => {
//                 // Skip the header row
//                 if (index === 0) return;

//                 // Map the row to match your BaseModel fields
//                 const payload = {
//                     transdate: row[0], // Assuming the transdate is in the first column
//                     journal_type: String(row[1] || 'Unknown'),
//                     reference: String(row[2] || 'N/A'),
//                     chart_of_account: String(row[3] || ''),
//                     chart_of_account_code: String(row[4] || ''),
//                     account_code_id: parseInt(row[5] || 0),
//                     debit: parseFloat(row[6] || 0),
//                     credit: parseFloat(row[7] || 0),
//                     branch_id: parseInt(row[8] || 0),
//                     description: row[9] || 'No description provided',
//                 };
                

//                 // Make an AJAX POST request
//                 $.ajax({
//                     url: apiUrl,
//                     type: 'POST',
//                     contentType: 'application/json',
//                     data: JSON.stringify(payload),
//                     success: function () {
//                         completedRows++;
//                         updateProgress(completedRows, totalRows);

//                         if (completedRows === totalRows) {
//                             alert("All data inserted successfully!");
//                         }
//                     },
//                     error: function (xhr) {
//                         console.error(`Error inserting row ${index}:`, xhr.responseText);
//                         completedRows++;
//                         updateProgress(completedRows, totalRows);
//                     }
//                 });
//             });
//         };

//         reader.onerror = function (error) {
//             console.error("Error reading file:", error);
//             alert("Failed to read the file. Please try again.");
//         };

//         // Read the file as a binary string
//         reader.readAsArrayBuffer(fileInput);

//         // Function to update progress
//         function updateProgress(completed, total) {
//             const percentage = ((completed / total) * 100).toFixed(2);
//             $('#progress_status').text(`Progress: ${percentage}% (${completed}/${total} rows)`);
//         }
//     });
// });


// $(document).ready(function () {
//     $('#btn_upload_file').on('click', function () {
//         const fileInput = $('#file_upload')[0].files[0]; // Get the file

//         if (!fileInput) {
//             alert("Please select a file first.");
//             return;
//         }

//         const reader = new FileReader();

//         reader.onload = function (e) {
//             const data = new Uint8Array(e.target.result);
//             const workbook = XLSX.read(data, { type: 'array' });

//             // Get the first sheet
//             const firstSheetName = workbook.SheetNames[0];
//             const worksheet = workbook.Sheets[firstSheetName];

//             // Convert the sheet data to JSON (array format)
//             const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
//             console.log(jsonData);

//             // Get the total rows for progress calculation
//             const totalRows = jsonData.length - 1; // Exclude header row
//             if (totalRows <= 0) {
//                 alert("No data found in the file.");
//                 return;
//             }

//             let completedRows = 0;

//             // Insert the data into the database
//             const apiUrl = '/api-insert-journal-entry-import2/';

//             jsonData.forEach((row, index) => {
//                 // Skip the header row
//                 if (index === 0) return;

//                 // Parse and format the date if needed
//                 const rawDate = row[0]; // Assuming the transdate is in the first column
//                 console.log(rawDate)
//                 let transdate;

//                 try {
//                     const date = new Date(rawDate);
//                     if (isNaN(date.getTime())) {
//                         throw new Error("Invalid date");
//                     }
//                     // Convert to YYYY-MM-DD format
//                     transdate = date.toISOString().split('T')[0];
//                 } catch (error) {
//                     console.error(`Invalid date format for row ${index}:`, rawDate);
//                     // Set a default or placeholder date if invalid
//                     // transdate = "1970-01-01"; // Default to a valid placeholder date
//                 }

//                 // Map the row to match your BaseModel fields
//                 const payload = {
//                     transdate, // Use the formatted or default date
//                     journal_type: String(row[1] || 'Unknown'),
//                     reference: String(row[2] || 'N/A'),
//                     chart_of_account: String(row[3] || ''),
//                     chart_of_account_code: String(row[4] || ''),
//                     account_code_id: parseInt(row[5] || 0),
//                     debit: parseFloat(row[6] || 0),
//                     credit: parseFloat(row[7] || 0),
//                     branch_id: parseInt(row[8] || 0),
//                     description: row[9] || 'No description provided',
//                 };

//                 console.log("Payload to be sent:", payload); // Debugging payload

//                 // Make an AJAX POST request
//                 $.ajax({
//                     url: apiUrl,
//                     type: 'POST',
//                     contentType: 'application/json',
//                     data: JSON.stringify(payload),
//                     success: function () {
//                         completedRows++;
//                         updateProgress(completedRows, totalRows);

//                         if (completedRows === totalRows) {
//                             alert("All data inserted successfully!");
//                         }
//                     },
//                     error: function (xhr) {
//                         console.error(`Error inserting row ${index}:`, xhr.responseText);
//                         completedRows++;
//                         updateProgress(completedRows, totalRows);
//                     }
//                 });
//             });
//         };

//         reader.onerror = function (error) {
//             console.error("Error reading file:", error);
//             alert("Failed to read the file. Please try again.");
//         };

//         // Read the file as an array buffer
//         reader.readAsArrayBuffer(fileInput);

//         // Function to update progress
//         function updateProgress(completed, total) {
//             const percentage = ((completed / total) * 100).toFixed(2);
//             $('#progress_status').text(`Progress: ${percentage}% (${completed}/${total} rows)`);
//         }
//     });
// });


$(document).ready(function () {
    $('#btn_upload_file').on('click', function () {
        const fileInput = $('#file_upload')[0].files[0]; // Get the selected file

        if (!fileInput) {
            alert("Please select a file first.");
            return;
        }

        const reader = new FileReader();

        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Get the first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert the sheet data to JSON (array format)
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            console.log("Extracted Data:", jsonData);

            // Get the total number of rows (excluding the header)
            const totalRows = jsonData.length - 1;
            if (totalRows <= 0) {
                alert("No data found in the file.");
                return;
            }

            let completedRows = 0;

            // API endpoint URL
            const apiUrl = '/api-insert-journal-entry-import2/';

            // Process each row
            jsonData.forEach((row, index) => {
                // Skip the header row
                if (index === 0) return;

                // Parse and handle the transdate
                const rawDate = row[0]; // Assuming the transdate is in the first column
                let transdate;

                try {
                    transdate = excelSerialDateToISO(rawDate);
                } catch (error) {
                    console.error(`Invalid date format for row ${index}:`, rawDate);
                    transdate = "1970-01-01"; // Default placeholder date for invalid formats
                }

                // Map the row to your payload fields
                const payload = {
                    transdate,
                    journal_type: String(row[1] || 'Unknown'),
                    reference: String(row[2] || 'N/A'),
                    chart_of_account: String(row[3] || ''),
                    chart_of_account_code: String(row[4] || ''),
                    account_code_id: parseInt(row[5] || 0),
                    debit: parseFloat(row[6] || 0),
                    credit: parseFloat(row[7] || 0),
                    branch_id: parseInt(row[8] || 0),
                    description: row[9] || 'No description provided',
                };

                console.log("Payload to be sent:", payload);

                // Send the data via AJAX
                $.ajax({
                    url: apiUrl,
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(payload),
                    success: function () {
                        completedRows++;
                        updateProgress(completedRows, totalRows);

                        if (completedRows === totalRows) {
                            alert("All data inserted successfully!");
                        }
                    },
                    error: function (xhr) {
                        console.error(`Error inserting row ${index}:`, xhr.responseText);
                        completedRows++;
                        updateProgress(completedRows, totalRows);
                    }
                });
            });
        };

        reader.onerror = function (error) {
            console.error("Error reading file:", error);
            alert("Failed to read the file. Please try again.");
        };

        // Read the file as an array buffer
        reader.readAsArrayBuffer(fileInput);

        // Update progress
        function updateProgress(completed, total) {
            const percentage = ((completed / total) * 100).toFixed(2);
            $('#progress_status').text(`Progress: ${percentage}% (${completed}/${total} rows)`);
        }

        // Convert Excel serial date to ISO format (YYYY-MM-DD)
        function excelSerialDateToISO(serialDate) {
            if (typeof serialDate === 'number') {
                const excelStartDate = new Date(1900, 0, 1); // Excel starts on 1900-01-01
                const adjustedDate = new Date(excelStartDate.getTime() + (serialDate - 1) * 86400 * 1000);
                return adjustedDate.toISOString().split('T')[0];
            } else if (typeof serialDate === 'string') {
                // Try to parse the string as a date
                const date = new Date(serialDate);
                if (!isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0];
                }
            }
            throw new Error("Invalid date format");
        }
    });
});

