// ===========================
// GLOBAL STATE
// ===========================
let allCars = [];
let allDrivers = [];
let allChampions = [];
let currentSection = 'cars';

// ===========================
// DOM ELEMENTS
// ===========================
const navButtons = document.querySelectorAll('.nav-btn');
const searchInput = document.getElementById('searchInput');
const filterYear = document.getElementById('filterYear');
const filterTeam = document.getElementById('filterTeam');

// ===========================
// INITIALIZE APP
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
});

// ===========================
// LOAD JSON DATA
// ===========================
async function loadData() {
    try {
        // Load all JSON files
        const [carsResponse, driversResponse, championsResponse] = await Promise.all([
            fetch('data/cars.json'),
            fetch('data/drivers.json'),
            fetch('data/champions.json')
        ]);

        allCars = await carsResponse.json();
        allDrivers = await driversResponse.json();
        allChampions = await championsResponse.json();

        // Populate filters
        populateFilters();

        // Render initial section
        renderCars(allCars);
    } catch (error) {
        console.error('Error loading data:', error);
        showError();
    }
}

// ===========================
// POPULATE FILTER OPTIONS
// ===========================
function populateFilters() {
    // Get unique years
    const years = [...new Set([
        ...allCars.map(c => c.year),
        ...allChampions.map(c => c.year)
    ])].sort((a, b) => b - a);

    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        filterYear.appendChild(option);
    });

    // Get unique teams
    const teams = [...new Set([
        ...allCars.map(c => c.team),
        ...allDrivers.flatMap(d => d.teams),
        ...allChampions.map(c => c.team)
    ])].sort();

    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        filterTeam.appendChild(option);
    });
}

// ===========================
// EVENT LISTENERS
// ===========================
function setupEventListeners() {
    // Navigation buttons
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchSection(btn.dataset.section);
        });
    });

    // Search and filters
    searchInput.addEventListener('input', applyFilters);
    filterYear.addEventListener('change', applyFilters);
    filterTeam.addEventListener('change', applyFilters);
}

// ===========================
// SWITCH SECTIONS
// ===========================
function switchSection(section) {
    currentSection = section;

    // Update active nav button
    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === section);
    });

    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });

    // Show selected section
    document.getElementById(`${section}-section`).classList.add('active');

    // Reset filters
    searchInput.value = '';
    filterYear.value = '';
    filterTeam.value = '';

    // Render appropriate content
    applyFilters();
}

// ===========================
// APPLY FILTERS
// ===========================
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedYear = filterYear.value;
    const selectedTeam = filterTeam.value;

    if (currentSection === 'cars') {
        let filtered = allCars.filter(car => {
            const matchesSearch = 
                car.name.toLowerCase().includes(searchTerm) ||
                car.team.toLowerCase().includes(searchTerm) ||
                car.year.toString().includes(searchTerm);
            const matchesYear = !selectedYear || car.year.toString() === selectedYear;
            const matchesTeam = !selectedTeam || car.team === selectedTeam;
            return matchesSearch && matchesYear && matchesTeam;
        });
        renderCars(filtered);
    } else if (currentSection === 'drivers') {
        let filtered = allDrivers.filter(driver => {
            const matchesSearch = 
                driver.name.toLowerCase().includes(searchTerm) ||
                driver.nationality.toLowerCase().includes(searchTerm) ||
                driver.teams.some(t => t.toLowerCase().includes(searchTerm));
            const matchesTeam = !selectedTeam || driver.teams.includes(selectedTeam);
            return matchesSearch && matchesTeam;
        });
        renderDrivers(filtered);
    } else if (currentSection === 'champions') {
        let filtered = allChampions.filter(champion => {
            const matchesSearch = 
                champion.driver.toLowerCase().includes(searchTerm) ||
                champion.team.toLowerCase().includes(searchTerm) ||
                champion.year.toString().includes(searchTerm);
            const matchesYear = !selectedYear || champion.year.toString() === selectedYear;
            const matchesTeam = !selectedTeam || champion.team === selectedTeam;
            return matchesSearch && matchesYear && matchesTeam;
        });
        renderChampions(filtered);
    }
}

// ===========================
// RENDER CARS
// ===========================
function renderCars(cars) {
    const grid = document.getElementById('cars-grid');
    
    if (cars.length === 0) {
        grid.innerHTML = '<div class="no-results">No cars found</div>';
        return;
    }

    grid.innerHTML = cars.map(car => `
        <div class="card">
            <img src="${car.image}" alt="${car.name}" class="card-image" 
                 onerror="this.src='https://via.placeholder.com/400x200/0a0a0a/e10600?text=F1+Car'">
            <div class="card-content">
                <h3 class="card-title">${car.name}</h3>
                <p class="card-subtitle">${car.year}</p>
                <div class="card-info">
                    <div class="card-detail">
                        <strong>Team:</strong> ${car.team}
                    </div>
                    <div class="card-detail">
                        <strong>Engine:</strong> ${car.engine}
                    </div>
                    ${car.constructor ? `
                        <div class="card-detail">
                            <strong>Constructor:</strong> ${car.constructor}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// ===========================
// RENDER DRIVERS
// ===========================
function renderDrivers(drivers) {
    const grid = document.getElementById('drivers-grid');
    
    if (drivers.length === 0) {
        grid.innerHTML = '<div class="no-results">No drivers found</div>';
        return;
    }

    grid.innerHTML = drivers.map(driver => `
        <div class="card">
            <img src="${driver.image}" alt="${driver.name}" class="card-image"
                 onerror="this.src='https://via.placeholder.com/400x200/0a0a0a/e10600?text=Driver'">
            <div class="card-content">
                <h3 class="card-title">${driver.name}</h3>
                <p class="card-subtitle">${driver.nationality}</p>
                <div class="card-info">
                    <div class="card-detail">
                        <strong>Active:</strong> ${driver.years}
                    </div>
                    <div class="card-detail">
                        <strong>Teams:</strong> ${driver.teams.join(', ')}
                    </div>
                    ${driver.championships ? `
                        <div class="card-detail">
                            <strong>Titles:</strong> ${driver.championships}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// ===========================
// RENDER CHAMPIONS
// ===========================
function renderChampions(champions) {
    const grid = document.getElementById('champions-grid');
    
    if (champions.length === 0) {
        grid.innerHTML = '<div class="no-results">No champions found</div>';
        return;
    }

    grid.innerHTML = champions.map(champion => `
        <div class="card">
            <img src="${champion.image}" alt="${champion.year} Champion" class="card-image"
                 onerror="this.src='https://via.placeholder.com/400x200/0a0a0a/e10600?text=Champion'">
            <div class="card-content">
                <h3 class="card-title">${champion.year} Champion</h3>
                <p class="card-subtitle">${champion.driver}</p>
                <div class="card-info">
                    <div class="card-detail">
                        <strong>Team:</strong> ${champion.team}
                    </div>
                    <div class="card-detail">
                        <strong>Car:</strong> ${champion.car}
                    </div>
                    ${champion.points ? `
                        <div class="card-detail">
                            <strong>Points:</strong> ${champion.points}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// ===========================
// ERROR HANDLING
// ===========================
function showError() {
    document.querySelectorAll('.grid').forEach(grid => {
        grid.innerHTML = '<div class="no-results">Error loading data. Please check your JSON files.</div>';
    });
}
