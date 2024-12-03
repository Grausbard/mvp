class TripList {
    constructor() {
        this.trips = [];
        this.filteredTrips = [];
        this.init();
    }

    init() {
        this.loadTrips();
        this.bindEvents();
        this.renderTrips();
    }

    loadTrips() {
        // Загрузка данных из localStorage
        this.trips = JSON.parse(localStorage.getItem('trips')) || [];
        this.filteredTrips = [...this.trips];
    }

    bindEvents() {
        // Поиск
        document.getElementById('searchTrips').addEventListener('input', (e) => {
            this.filterTrips(e.target.value);
        });

        // Фильтр по статусу
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filterByStatus(e.target.value);
        });

        // Закрытие модального окна
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('tripModal').style.display = 'none';
        });
    }

    filterTrips(searchText) {
        this.filteredTrips = this.trips.filter(trip => 
            trip.employee.toLowerCase().includes(searchText.toLowerCase()) ||
            trip.destination.toLowerCase().includes(searchText.toLowerCase())
        );
        this.renderTrips();
    }

    filterByStatus(status) {
        if (status) {
            this.filteredTrips = this.trips.filter(trip => trip.status === status);
        } else {
            this.filteredTrips = [...this.trips];
        }
        this.renderTrips();
    }

    renderTrips() {
        const tbody = document.getElementById('tripsTableBody');
        tbody.innerHTML = '';

        this.filteredTrips.forEach(trip => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${trip.employee}</td>
                <td>${trip.destination}</td>
                <td>${new Date(trip.startDate).toLocaleDateString()} - 
                    ${new Date(trip.endDate).toLocaleDateString()}</td>
                <td><span class="status-badge status-${trip.status}">${this.getStatusText(trip.status)}</span></td>
                <td>${trip.budget ? trip.budget.toLocaleString() + ' ₽' : 'Не указан'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-view" onclick="tripList.viewTrip('${trip.id}')">
                            Просмотр
                        </button>
                        <button class="btn-edit" onclick="tripList.editTrip('${trip.id}')">
                            Изменить
                        </button>
                        <button class="btn-delete" onclick="tripList.deleteTrip('${trip.id}')">
                            Удалить
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    getStatusText(status) {
        const statusMap = {
            pending: 'На согласовании',
            approved: 'Утверждено',
            completed: 'Завершено',
            cancelled: 'Отменено'
        };
        return statusMap[status] || status;
    }

    viewTrip(tripId) {
        const trip = this.trips.find(t => t.id === tripId);
        if (!trip) return;

        const modal = document.getElementById('tripModal');
        const details = document.getElementById('tripDetails');
        
        details.innerHTML = `
            <div class="trip-details">
                <p><strong>Сотрудник:</strong> ${trip.employee}</p>
                <p><strong>Направление:</strong> ${trip.destination}</p>
                <p><strong>Даты:</strong> ${new Date(trip.startDate).toLocaleDateString()} - 
                    ${new Date(trip.endDate).toLocaleDateString()}</p>
                <p><strong>Статус:</strong> ${this.getStatusText(trip.status)}</p>
                <p><strong>Цель поездки:</strong> ${trip.purpose}</p>
                <p><strong>Бюджет:</strong> ${trip.budget ? trip.budget.toLocaleString() + ' ₽' : 'Не указан'}</p>
            </div>
        `;

        modal.style.display = 'block';
    }

    editTrip(tripId) {
        // Перенаправление на страницу редактирования
        window.location.href = `trips.html?id=${tripId}`;
    }

    deleteTrip(tripId) {
        if (confirm('Вы уверены, что хотите удалить эту командировку?')) {
            this.trips = this.trips.filter(t => t.id !== tripId);
            localStorage.setItem('trips', JSON.stringify(this.trips));
            this.filteredTrips = this.filteredTrips.filter(t => t.id !== tripId);
            this.renderTrips();
            showNotification('Командировка успешно удалена', 'success');
        }
    }
}

// Инициализация при загрузке страницы
let tripList;
document.addEventListener('DOMContentLoaded', () => {
    tripList = new TripList();
}); 