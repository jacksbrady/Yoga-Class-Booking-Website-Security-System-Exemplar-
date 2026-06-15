function openDeleteUserModal(userId, userName) {
    document.getElementById("deleteUserMessage").textContent =
        `Are you sure you want to delete ${userName}?`;

    document.getElementById("deleteUserForm").action =
        `/organiser/users/${userId}/delete`;

    document.getElementById("deleteUserModal").classList.remove("hidden");
}

function closeDeleteUserModal() {
    document.getElementById("deleteUserModal").classList.add("hidden");
}