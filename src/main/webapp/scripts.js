// Tutor Catalog Filtering
function filterTutors() {
    const searchInput = document.getElementById('searchInput');
    const subjectFilter = document.getElementById('subjectFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (!searchInput || !subjectFilter || !statusFilter) return;

    const search = searchInput.value.toLowerCase();
    const subject = subjectFilter.value.toLowerCase();
    const status = statusFilter.value.toLowerCase();
    const items = document.querySelectorAll('.tutor-item');

    items.forEach(item => {
        const matchName = item.dataset.name.includes(search) || item.dataset.subject.includes(search);
        const matchSubject = !subject || item.dataset.subject.includes(subject);
        const matchStatus = !status || item.dataset.status === status;
        const show = matchName && matchSubject && matchStatus;
        item.classList.toggle('d-none', !show);
    });
}

// Tutor Details Edit
function saveEdit() {
    const editModalEl = document.getElementById('editModal');
    if (editModalEl) {
        bootstrap.Modal.getInstance(editModalEl).hide();
        showToast('Listing updated successfully!');
    }
}

// Tutor Details Delete
function deleteListing() {
    const deleteModalEl = document.getElementById('deleteModal');
    if (deleteModalEl) {
        bootstrap.Modal.getInstance(deleteModalEl).hide();
        setTimeout(() => window.location.href = 'listTutors', 600);
    }
}

// Toast Notification
function showToast(msg) {
    const t = document.getElementById('successToast');
    const msgEl = document.getElementById('toastMsg');
    if (t && msgEl) {
        msgEl.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 3500);
    }
}
