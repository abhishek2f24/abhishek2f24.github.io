// Paste the Google Apps Script Web App URL here
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxWa9pR0mppi3nXN9fsz9oBvhDvHo_EeU6ar4wYI-nfeoxH0PW412SeqOhqdgir5myG/exec';

const form = document.getElementById('uploadForm');
const fileInput = document.getElementById('fileInput');
const submitButton = document.getElementById('submitButton');
const statusDiv = document.getElementById('status');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const files = fileInput.files;
    if (files.length === 0) {
        statusDiv.textContent = 'Please select at least one file.';
        return;
    }

    submitButton.disabled = true;
    statusDiv.innerHTML = 'Uploading...';

    for (const file of files) {
        statusDiv.innerHTML += `<br>Uploading ${file.name}...`;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        await new Promise((resolve, reject) => {
            reader.onload = async (event) => {
                const fileData = event.target.result.split(',')[1]; // Get Base64 part

                try {
                    const response = await fetch(SCRIPT_URL, {
                        method: 'POST',
                        body: JSON.stringify({
                            fileName: file.name,
                            mimeType: file.type,
                            fileData: fileData
                        })
                    });

                    const result = await response.json();

                    if (result.status === 'success') {
                        statusDiv.innerHTML += `<br>✅ ${result.fileName} uploaded successfully!`;
                    } else {
                        statusDiv.innerHTML += `<br>❌ Error uploading ${file.name}: ${result.message}`;
                    }
                } catch (error) {
                     statusDiv.innerHTML += `<br>❌ Network error during upload of ${file.name}.`;
                } finally {
                    resolve(); // Resolve the promise to continue to the next file
                }
            };
            reader.onerror = reject;
        });
    }
    submitButton.disabled = false;
    form.reset(); // Clear the file input
});
