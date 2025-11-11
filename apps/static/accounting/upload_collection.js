document.addEventListener('DOMContentLoaded', function () {
    const dragAndDropArea = document.querySelector('.drag-and-drop-area');
    const fileUpload = document.getElementById('file-upload');
    const uploadBtn = document.querySelector('.upload-btn');
    const nextBtn = document.querySelector('.next-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const uploadStep = document.getElementById('upload-step');
    const mappingStep = document.getElementById('mapping-step');
    const progressSteps = document.querySelectorAll('.step');
    
    let uploadedFile = null;

    // Trigger file input when upload button is clicked
    uploadBtn.addEventListener('click', () => {
        fileUpload.click();
    });

    // Handle file selection
    fileUpload.addEventListener('change', async (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            uploadedFile = files[0];
            handleFiles(files);
        }
    });

    // Drag and drop functionality
    dragAndDropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        dragAndDropArea.classList.add('border-blue-500');
    });

    dragAndDropArea.addEventListener('dragleave', () => {
        dragAndDropArea.classList.remove('border-blue-500');
    });

    dragAndDropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        dragAndDropArea.classList.remove('border-blue-500');
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            uploadedFile = files[0];
            handleFiles(files);
        }
    });

    async function handleFiles(files) {
        const formData = new FormData();
        formData.append('file', files[0]);

        try {
            const response = await fetch('/upload-collection/', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin',
                headers: {
                }
            });
            
            const contentType = response.headers.get("content-type");
            if (!response.ok) {
                let errorMessage = 'Upload failed';
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    errorMessage = errorData.detail || errorMessage;
                } else {
                    errorMessage = await response.text();
                }
                throw new Error(errorMessage);
            }
            
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error('Invalid server response format');
            }
            
            const data = await response.json();
            console.log('Upload response:', data);
            
            // Enable next button after successful upload
            nextBtn.disabled = false;
            
            // Show success indicator
            dragAndDropArea.classList.remove('border-red-500');
            dragAndDropArea.classList.add('border-green-500');
            dragAndDropArea.querySelector('p').textContent = 'File uploaded successfully: ' + files[0].name;
            
            // Store the uploaded file information
            uploadedFile = files[0];
            
            return data;
        } catch (error) {
            console.error('Upload error:', error);
            dragAndDropArea.classList.remove('border-green-500');
            dragAndDropArea.classList.add('border-red-500');
            dragAndDropArea.querySelector('p').textContent = 'Upload failed: ' + (error.message || 'Please try again');
            throw error;
        }
    }

    // Handle next button click
    nextBtn.addEventListener('click', async () => {
        if (uploadedFile) {
            if (mappingStep.classList.contains('hidden')) {
                // First click - Show mapping step
                uploadStep.classList.add('hidden');
                mappingStep.classList.remove('hidden');
                progressSteps[0].classList.remove('active');
                progressSteps[1].classList.add('active');
                nextBtn.textContent = 'Import';
                cancelBtn.textContent = 'Back';
                await populateColumnHeaders();
            } else {
                // Second click - Perform import
                try {
                    // Collect mapping data
                    const mapping = {};
                    const requiredFields = ['date', 'customer', 'customer_id', 'invoice_no', 'cash_amount'];
                    const selects = mappingStep.querySelectorAll('.mapping-select');
                    
                    selects.forEach(select => {
                        if (select.value) {
                            mapping[select.value] = select.getAttribute('name');
                        }
                    });

                    console.log('Mapping data:', mapping);

                    // Check for missing required fields
                    const mappedFields = Object.values(mapping);
                    const missingFields = requiredFields.filter(field => !mappedFields.includes(field));

                    if (missingFields.length > 0) {
                        throw new Error(`Missing required fields: ${missingFields.join(', ')}. Please map all required fields marked with *`);
                    }

                    // Prepare form data
                    const formData = new FormData();
                    formData.append('file', uploadedFile);
                    formData.append('column_mapping', JSON.stringify(mapping));

                    // Send import request
                    const response = await fetch('/import-collection-data/', {
                        method: 'POST',
                        body: formData,
                        credentials: 'same-origin'
                    });

                    if (!response.ok) {
                        const error = await response.json();
                        if (error.detail && typeof error.detail === 'object') {
                            throw error.detail;
                        } else {
                            throw new Error(error.detail || 'Import failed');
                        }
                    }

                    const result = await response.json();
                    showSuccess(result.message);
                    
                    // Move to final step
                    progressSteps[1].classList.remove('active');
                    progressSteps[2].classList.add('active');
                    nextBtn.style.display = 'none';
                    cancelBtn.textContent = 'Finish';

                } catch (error) {
                    showError(error.message);
                }
            }
        }
    });

    // Handle back/cancel button click
    cancelBtn.addEventListener('click', () => {
        if (mappingStep.classList.contains('hidden')) {
            // We're on the first step - return to previous page
            window.history.back();
        } else {
            // We're on the mapping step - go back to upload
            mappingStep.classList.add('hidden');
            uploadStep.classList.remove('hidden');
            progressSteps[1].classList.remove('active');
            progressSteps[0].classList.add('active');
            nextBtn.textContent = 'Next';
            cancelBtn.textContent = 'Cancel';
            nextBtn.style.display = 'block';
        }
    });

    // Handle collection.xlsx download (template without data)
    const downloadCollectionBtn = document.getElementById('download-collection');
    if (downloadCollectionBtn) {
        downloadCollectionBtn.addEventListener('click', () => {
            window.location.href = '/download-collection-template/';
        });
    }

    // Function to show error message
    function showError(error) {
        const errorDiv = document.getElementById('error-message');
        let errorContent = '';

        if (typeof error === 'object' && error.existing_collections) {
            errorContent = `<p class="font-bold mb-2">${error.message}</p>`;
            errorContent += '<div class="mt-2 text-sm">';
            error.existing_collections.forEach(collection => {
                errorContent += `
                    <div class="border-b border-red-200 py-2">
                        <p><strong>CR No:</strong> ${collection.cr_no}</p>
                        <p><strong>Invoice No:</strong> ${collection.invoice_no}</p>
                        <p><strong>Customer:</strong> ${collection.customer}</p>
                        <p><strong>Amount:</strong> ${collection.cash_amount}</p>
                        <p><strong>Created By:</strong> ${collection.existing_user}</p>
                        <p><strong>Created On:</strong> ${collection.date_created}</p>
                    </div>
                `;
            });
            errorContent += '</div>';
            errorContent += '<p class="mt-2 font-semibold">Please remove these collections from your import file and try again.</p>';
        } else {
            errorContent = `<p>${error.toString()}</p>`;
        }

        errorDiv.querySelector('span').innerHTML = errorContent;
        errorDiv.classList.remove('hidden');
        document.getElementById('success-message').classList.add('hidden');
    }

    // Function to show success message
    function showSuccess(message) {
        const successDiv = document.getElementById('success-message');
        successDiv.querySelector('span').textContent = message;
        successDiv.classList.remove('hidden');
        document.getElementById('error-message').classList.add('hidden');
    }

    // Function to populate column headers in mapping dropdowns
    async function populateColumnHeaders() {
        if (!uploadedFile) return;
        
        try {
            const formData = new FormData();
            formData.append('file', uploadedFile);
            
            const response = await fetch('/upload-collection/', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to get columns');
            }
            
            const data = await response.json();
            if (!data.data || !data.data.columns) {
                throw new Error('Invalid response format from server');
            }
            
            const headers = data.data.columns;
            console.log('Available columns:', headers);
            
            // Get all select elements for mapping
            const selects = mappingStep.querySelectorAll('.mapping-select');
            selects.forEach(select => {
                // Clear existing options
                select.innerHTML = '<option value="">Select column...</option>';
                
                // Add all available columns as options
                headers.forEach(header => {
                    const option = document.createElement('option');
                    option.value = header;
                    option.textContent = header;
                    select.appendChild(option);
                });
                
                // Set default selection if column name matches
                const fieldName = select.getAttribute('name');
                const matchingHeader = headers.find(h => h.toLowerCase() === fieldName.toLowerCase());
                if (matchingHeader) {
                    select.value = matchingHeader;
                }
            });
            
            console.log('Mapping UI updated successfully');
        } catch (error) {
            console.error('Error populating headers:', error);
            showError(error.message);
        }
    }
});
