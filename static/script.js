// --- Client-side Token Management ---
function generateToken(length = 5) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function manageToken() {
    const TOKEN_KEY = 'deviceUserToken';
    let storedToken = localStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
        storedToken = generateToken();
        localStorage.setItem(TOKEN_KEY, storedToken);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');

    if (urlToken !== storedToken) {
        // Redirect to the URL with the correct token from localStorage
        // This syncs the server-side render with the client's token
        window.location.href = `/?token=${storedToken}`;
    }
}

// --- Modal Logic ---
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const modalFooter = document.getElementById('modal-footer');

function openModal() {
    modal.classList.add('visible');
}

function closeModal() {
    modal.classList.remove('visible');
}

// Close modal on overlay click
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

// --- Modal Content Generators ---

function showImportModal() {
    modalTitle.textContent = 'Import Device ID';
    modalBody.innerHTML = `
        <p>Enter the 5-character ID from another device to sync your notes.</p>
        <input type="text" id="import-token-input" placeholder="e.g. aB1cD" maxlength="5">
    `;
    modalFooter.innerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="handleImport()">Import</button>
    `;
    openModal();
}

function showDeleteConfirm(noteId) {
    modalTitle.textContent = 'Delete Note';
    modalBody.innerHTML = `<p>Are you sure you want to permanently delete this note?</p>`;
    modalFooter.innerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-danger" onclick="handleDelete('${noteId}')">Delete</button>
    `;
    openModal();
}

function showEditModal(noteId, buttonElement) {
    const noteItem = buttonElement.closest('.note-item');
    const currentContent = noteItem.dataset.noteContent;

    modalTitle.textContent = 'Edit Note';
    modalBody.innerHTML = `
        <textarea id="edit-content-input" rows="5">${currentContent}</textarea>
    `;
    modalFooter.innerHTML = `
        <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="handleUpdate('${noteId}')">Save Changes</button>
    `;
    openModal();
    document.getElementById('edit-content-input').focus();
}


// --- Modal Action Handlers ---

function handleImport() {
    const input = document.getElementById('import-token-input');
    const newToken = input.value.trim();
    if (newToken && newToken.length === 5) {
        localStorage.setItem('deviceUserToken', newToken);
        window.location.href = `/?token=${newToken}`;
    } else {
        alert("Invalid ID. Please enter a 5-character ID."); // Simple alert is ok for validation error here
    }
}

function handleDelete(noteId) {
    const noteItem = document.querySelector(`.note-item[data-note-id='${noteId}']`);
    if (noteItem) {
        const form = noteItem.querySelector('.delete-form-hidden');
        form.submit();
    }
    closeModal();
}

function handleUpdate(noteId) {
    const newContent = document.getElementById('edit-content-input').value;
    const noteItem = document.querySelector(`.note-item[data-note-id='${noteId}']`);
    if (noteItem) {
        const form = noteItem.querySelector('.update-form-hidden');
        form.querySelector('input[name="content"]').value = newContent;
        form.submit();
    }
    closeModal();
}

// --- Copy to Clipboard ---
const copyTokenBtn = document.getElementById('copy-token-btn');
copyTokenBtn.addEventListener('click', () => {
    const token = copyTokenBtn.querySelector('strong').textContent;
    navigator.clipboard.writeText(token).then(() => {
        const originalText = copyTokenBtn.innerHTML;
        copyTokenBtn.innerHTML = 'Copied!';
        setTimeout(() => {
            copyTokenBtn.innerHTML = originalText;
        }, 1500);
    });
});

// --- Run on page load ---
document.addEventListener('DOMContentLoaded', manageToken);