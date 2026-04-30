document.addEventListener('DOMContentLoaded', () => {
    const API = 'http://localhost:8080/api/reviews';
    const FEEDBACK_API = 'http://localhost:8080/api/feedback';

    const tableBody = document.getElementById('adminTableBody');
    const totalCount = document.getElementById('adminTotal');

    function showToast(msg, isError = false) {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.className = 'toast' + (isError ? ' error' : '');
        toast.classList.remove('hidden');
        setTimeout(() => { toast.classList.add('hidden'); }, 3000);
    }

    async function fetchData() {
        try {
            const [reviewsRes, feedbackRes] = await Promise.all([
                fetch(API),
                fetch(FEEDBACK_API) // Standard feedback endpoint if available, but we'll fetch per review if not
            ]);

            const reviews = await reviewsRes.json();
            totalCount.textContent = reviews.length;
            
            renderTable(reviews);
        } catch (e) {
            showToast('Failed to connect to backend.', true);
        }
    }

    async function renderTable(reviews) {
        tableBody.innerHTML = '';
        
        for (const r of reviews) {
            let replies = [];
            try {
                const res = await fetch(`${FEEDBACK_API}/review/${r.id}`);
                replies = res.ok ? await res.json() : [];
            } catch {}

            const row = document.createElement('tr');
            const hasReply = replies.length > 0;
            
            row.innerHTML = `
                <td>
                    <div style="font-weight: 700;">${r.userName}</div>
                    <div style="font-size: 0.8rem; color: var(--accent);">${r.houseName}</div>
                </td>
                <td>
                    <div style="color: #fbbf24; margin-bottom: 0.5rem;">${'★'.repeat(r.rating)}</div>
                    <p style="font-size: 0.9rem; max-width: 400px;">${r.comment}</p>
                </td>
                <td>
                    ${hasReply ? `
                        <div class="status-badge status-replied">Replied</div>
                        <p style="font-size: 0.8rem; margin-top: 0.5rem; color: var(--gray2);">${replies[0].replyText}</p>
                    ` : `
                        <div class="status-badge status-pending">Pending</div>
                        <div class="reply-box">
                            <input type="text" class="reply-input" placeholder="Enter response..." id="reply-${r.id}">
                            <button class="btn-reply" onclick="postReply(${r.id})">Post</button>
                        </div>
                    `}
                </td>
                <td>
                    <button class="btn-delete" onclick="deleteReview(${r.id})">Terminate</button>
                </td>
            `;
            tableBody.appendChild(row);
        }
    }

    window.deleteReview = async (id) => {
        if (!confirm('Are you sure you want to delete this review? This action is irreversible.')) return;
        try {
            const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
            if (res.ok) {
                showToast('Review successfully terminated.');
                fetchData();
            }
        } catch { showToast('Deletions restricted by system.', true); }
    };

    window.postReply = async (reviewId) => {
        const input = document.getElementById(`reply-${reviewId}`);
        const text = input.value.trim();
        if (!text) return;

        try {
            const res = await fetch(FEEDBACK_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reviewId, replyText: text })
            });
            if (res.ok) {
                showToast('Response successfully published.');
                fetchData();
            }
        } catch { showToast('Communication failure.', true); }
    };

    fetchData();
});
