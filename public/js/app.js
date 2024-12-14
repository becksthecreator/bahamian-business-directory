const API_URL = '/businesses';
let currentPage = 1;
let totalPages = 1;

// Fetch and Display Businesses with Pagination
async function fetchBusinesses(query = '') {
    const response = await fetch(`${API_URL}?${query}&page=${currentPage}`);
    const data = await response.json();

    const { businesses, totalPages: total } = data;
    totalPages = total;

    const tableBody = document.getElementById('businessTableBody');
    tableBody.innerHTML = ''; // Clear existing table content

    businesses.forEach(business => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${business.name}</td>
            <td>${business.location}</td>
            <td>${business.category}</td>
            <td>
                <button onclick="editBusiness('${business._id}')">Edit</button>
                <button onclick="deleteBusiness('${business._id}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updatePaginationControls();
}

// Update Pagination Controls
function updatePaginationControls() {
    const paginationControls = document.getElementById('paginationControls');
    paginationControls.innerHTML = `
        <button onclick="prevPage()" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button onclick="nextPage()" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
    `;
}

// Handle Pagination
function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        refreshBusinesses();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        refreshBusinesses();
    }
}

// Refresh Businesses with Current Search and Filters
function refreshBusinesses() {
    const searchQuery = document.getElementById('searchBar').value.trim();
    const category = document.getElementById('categoryFilter').value;
    const query = `name=${searchQuery}&category=${category}`;
    fetchBusinesses(query);
}

// Add a New Business
document.getElementById('addBusinessButton').addEventListener('click', async () => {
    const name = prompt('Enter Business Name:');
    const location = prompt('Enter Business Location:');
    const categories = ['Restaurant', 'Technology', 'Retail', 'Art', 'Other'];
    const category = prompt(
        `Enter Business Category: (Choose one: ${categories.join(', ')})`
    );

    if (name && location && categories.includes(category)) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, location, category }),
        });

        if (response.ok) {
            alert('Business added successfully!');
            fetchBusinesses(); // Refresh the table
        } else {
            const error = await response.json();
            alert(`Failed to add business: ${error.error}`);
        }
    } else {
        alert(
            'Invalid input. Please make sure you enter a valid category (e.g., Restaurant, Technology).'
        );
    }
});

// Delete a Business
async function deleteBusiness(id) {
    if (confirm('Are you sure you want to delete this business?')) {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('Business deleted successfully!');
            fetchBusinesses(); // Refresh the table
        } else {
            const error = await response.json();
            alert(`Failed to delete business: ${error.error}`);
        }
    }
}

// Edit a Business
async function editBusiness(id) {
    const name = prompt('Enter New Business Name:');
    const location = prompt('Enter New Business Location:');
    const categories = ['Restaurant', 'Technology', 'Retail', 'Art', 'Other'];
    const category = prompt(
        `Enter New Business Category: (Choose one: ${categories.join(', ')})`
    );

    if (name && location && categories.includes(category)) {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, location, category }),
        });

        if (response.ok) {
            alert('Business updated successfully!');
            fetchBusinesses(); // Refresh the table
        } else {
            const error = await response.json();
            alert(`Failed to update business: ${error.error}`);
        }
    } else {
        alert(
            'Invalid input. Please make sure you enter a valid category (e.g., Restaurant, Technology).'
        );
    }
}

// Add Event Listeners for Search and Filter
document.getElementById('searchBar').addEventListener('input', refreshBusinesses);
document.getElementById('categoryFilter').addEventListener('change', refreshBusinesses);

// Fetch businesses when the page loads
fetchBusinesses();
