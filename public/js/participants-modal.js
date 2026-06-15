async function openParticipantsModal(sessionId) {
    const modal = document.getElementById("participantsModal");
    const list = document.getElementById("participantsList");

    modal.classList.remove("hidden");
    list.innerHTML = "<p class='muted'>Loading...</p>";

    try {
        const res = await fetch(`/organiser/sessions/${sessionId}/participants`);
        const data = await res.json();

        if (!data.participants || data.participants.length === 0) {
            list.innerHTML = "<p>No participants booked yet.</p>";
            return;
        }

        list.innerHTML = `
    <ul>
        ${data.participants
                .map(
                    (p) => `
                    <li>
                        ${p.name} (${p.email})
                        <button
                            class="btn"
                            type="button"
                            onclick="removeBooking('${p.bookingId}', '${sessionId}')">
                            Remove booking
                        </button>
                    </li>
                `
                )
                .join("")}
    </ul>
`;
    } catch (err) {
        list.innerHTML = "<p>Failed to load participants.</p>";
    }
}

function closeParticipantsModal() {
    document.getElementById("participantsModal").classList.add("hidden");
}

async function removeBooking(bookingId, sessionId) {
    try {
        const res = await fetch(`/organiser/bookings/${bookingId}/remove`, {
            method: "POST",
        });

        if (!res.ok) {
            throw new Error("Failed to remove booking");
        }

        await openParticipantsModal(sessionId);
    } catch (err) {
        alert("Failed to remove booking.");
    }
}