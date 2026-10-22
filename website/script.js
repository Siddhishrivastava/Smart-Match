// Get HTML elements
const itemForm = document.getElementById("itemForm");
const itemList = document.getElementById("itemList");
const matchList = document.getElementById("matchList");
const searchInput = document.getElementById("search");
const filterType = document.getElementById("filterType");
const message = document.getElementById("message");

// Load saved reports or create sample data
function loadItems() {
    const savedItems = localStorage.getItem("smartMatchItems");

    if (savedItems) {
        return JSON.parse(savedItems);
    }

    return [
        {
            id: 1,
            type: "Lost",
            name: "Black Scientific Calculator",
            category: "Electronics",
            location: "Academic Block",
            date: "2026-10-20",
            description: "Black calculator with scientific functions",
            resolved: false
        },
        {
            id: 2,
            type: "Found",
            name: "Scientific Calculator",
            category: "Electronics",
            location: "Academic Block",
            date: "2026-10-20",
            description: "Black scientific calculator found in classroom",
            resolved: false
        },
        {
            id: 3,
            type: "Lost",
            name: "Blue Water Bottle",
            category: "Bottle",
            location: "Sports Ground",
            date: "2026-10-19",
            description: "Blue bottle with a black cap",
            resolved: false
        },
        {
            id: 4,
            type: "Found",
            name: "Blue Bottle",
            category: "Bottle",
            location: "Sports Ground",
            date: "2026-10-19",
            description: "Blue water bottle found near ground",
            resolved: false
        },
        {
            id: 5,
            type: "Lost",
            name: "College ID Card",
            category: "ID Card",
            location: "Library",
            date: "2026-10-18",
            description: "College identity card",
            resolved: false
        },
        {
            id: 6,
            type: "Found",
            name: "Notebook",
            category: "Books",
            location: "Library",
            date: "2026-10-18",
            description: "Notebook found on a library table",
            resolved: false
        }
    ];
}

// Store reports in this browser
let items = loadItems();

// Save updated reports
function saveItems() {
    localStorage.setItem("smartMatchItems", JSON.stringify(items));
}

// Calculate similarity score between two reports
function calculateScore(lost, found) {
    let score = 0;

    // Same category adds 40 points
    if (lost.category === found.category) {
        score += 40;
    }

    // Same location adds 30 points
    if (lost.location === found.location) {
        score += 30;
    }

    // Compare meaningful words in descriptions and names
    const text1 = (lost.name + " " + lost.description).toLowerCase();
    const text2 = (found.name + " " + found.description).toLowerCase();

    const ignoredWords = [
        "the", "and", "with", "found", "near",
        "a", "an", "in", "on", "of", "item"
    ];

    const words1 = new Set(
        text1.split(/[^a-z0-9]+/)
            .filter(word => word.length > 2 && !ignoredWords.includes(word))
    );

    const words2 = new Set(
        text2.split(/[^a-z0-9]+/)
            .filter(word => word.length > 2 && !ignoredWords.includes(word))
    );

    // Each shared keyword adds 6 points, up to 30
    let sharedWords = 0;

    words1.forEach(word => {
        if (words2.has(word)) {
            sharedWords++;
        }
    });

    score += Math.min(sharedWords * 6, 30);

    // Maximum score is 100
    return Math.min(score, 100);
}

// Find possible lost-and-found matches
function findMatches() {
    const results = [];

    const lostItems = items.filter(
        item => item.type === "Lost" && !item.resolved
    );

    const foundItems = items.filter(
        item => item.type === "Found" && !item.resolved
    );

    // Compare each lost report with each found report
    lostItems.forEach(lost => {
        foundItems.forEach(found => {
            const score = calculateScore(lost, found);

            // Show matches with score 40 or above
            if (score >= 40) {
                results.push({ lost, found, score });
            }
        });
    });

    return results.sort((a, b) => b.score - a.score);
}

// Display reports in Browse Items
function renderItems() {
    const query = searchInput.value.toLowerCase().trim();
    const selectedType = filterType.value;

    const filteredItems = items.filter(item => {
        const searchableText =
            item.name + " " + item.description + " " +
            item.category + " " + item.location;

        const matchesSearch = searchableText
            .toLowerCase().includes(query);

        const matchesType =
            selectedType === "All" || item.type === selectedType;

        return matchesSearch && matchesType;
    });

    if (filteredItems.length === 0) {
        itemList.innerHTML = "<p>No reports found.</p>";
        return;
    }

    itemList.innerHTML = filteredItems.map(item => `
        <div class="item-card">
            <span class="status">
                ${item.resolved ? "Resolved" : item.type}
            </span>

            <h3>${escapeHTML(item.name)}</h3>
            <p><strong>Category:</strong> ${escapeHTML(item.category)}</p>
            <p><strong>Location:</strong> ${escapeHTML(item.location)}</p>
            <p><strong>Date:</strong> ${escapeHTML(item.date)}</p>
            <p><strong>Description:</strong> ${escapeHTML(item.description)}</p>

            <button onclick="toggleResolved(${item.id})">
                ${item.resolved ? "Reopen Case" : "Mark Resolved"}
            </button>
        </div>
    `).join("");
}

// Escape user-entered text before displaying it as HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Display matching reports and their scores
function renderMatches() {
    const matches = findMatches();

    if (matches.length === 0) {
        matchList.innerHTML = "<p>No possible matches found yet.</p>";
        return;
    }

    matchList.innerHTML = matches.map(match => `
        <div class="item-card">
            <h3>Possible Match: ${match.score}%</h3>

            <p><strong>Lost:</strong>
                ${escapeHTML(match.lost.name)}
            </p>

            <p><strong>Found:</strong>
                ${escapeHTML(match.found.name)}
            </p>

            <p><strong>Category:</strong>
                ${escapeHTML(match.lost.category)}
            </p>

            <p><strong>Location:</strong>
                ${escapeHTML(match.lost.location)}
            </p>

            <p class="match-score">
                Similarity Score: ${match.score}%
            </p>
        </div>
    `).join("");
}

// Update dashboard numbers
function renderDashboard() {
    document.getElementById("lostCount").textContent =
        items.filter(item => item.type === "Lost" && !item.resolved).length;

    document.getElementById("foundCount").textContent =
        items.filter(item => item.type === "Found" && !item.resolved).length;

    document.getElementById("matchCount").textContent =
        findMatches().length;

    document.getElementById("resolvedCount").textContent =
        items.filter(item => item.resolved).length;
}

// Add a new lost/found report
itemForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const newItem = {
        id: Date.now(),
        type: document.getElementById("type").value,
        name: document.getElementById("name").value.trim(),
        category: document.getElementById("category").value,
        location: document.getElementById("location").value,
        date: document.getElementById("date").value,
        description: document.getElementById("description").value.trim(),
        resolved: false
    };

    items.push(newItem);

    saveItems();
    itemForm.reset();

    message.textContent = "Report submitted successfully!";
    renderAll();
});

// Mark a case as resolved or reopen it
function toggleResolved(id) {
    const item = items.find(item => item.id === id);

    if (item) {
        item.resolved = !item.resolved;
        saveItems();
        renderAll();
    }
}

// Refresh all website sections
function renderAll() {
    renderItems();
    renderMatches();
    renderDashboard();
}

// Update search results when user types
searchInput.addEventListener("input", renderItems);

// Update reports when a filter is selected
filterType.addEventListener("change", renderItems);

// Initial website display
renderAll();
