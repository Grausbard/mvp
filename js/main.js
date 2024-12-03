// Пример структуры навигации
const navigation = {
    dashboard: {
        path: '/',
        title: 'Дашборд'
    },
    trips: {
        path: '/trips',
        title: 'Командировки',
        submenu: ['Создать', 'Список', 'Архив']
    },
    // ...
};

// Валидация формы командировки
function validateForm() {
    // Логика валидации
    console.log("Валидация формы");
}

// Сохранение данных командировки
function saveTrip(formData) {
    const trips = JSON.parse(localStorage.getItem('trips')) || [];
    if (formData.id) {
        // Обновление существующей командировки
        const index = trips.findIndex(t => t.id === formData.id);
        if (index !== -1) {
            trips[index] = formData;
        }
    } else {
        // Создание новой командировки
        formData.id = Date.now().toString();
        trips.push(formData);
    }
    localStorage.setItem('trips', JSON.stringify(trips));
    console.log("Данные командировки сохранены");
}

document.addEventListener('DOMContentLoaded', function() {
    // Загрузка данных при старте
    loadDashboardData();
});

function loadDashboardData() {
    // Загрузка данных из localStorage
    const trips = JSON.parse(localStorage.getItem('trips')) || [];
    
    updateActiveTrips(trips);
    updatePendingTrips(trips);
    updateRecentActions();
}

function updateActiveTrips(trips) {
    const activeTrips = trips.filter(trip => 
        new Date(trip.startDate) <= new Date() && 
        new Date(trip.endDate) >= new Date()
    );

    const container = document.getElementById('activeTrips');
    if (activeTrips.length === 0) {
        container.innerHTML = '<p>Нет активных командировок</p>';
        return;
    }

    container.innerHTML = activeTrips.map(trip => `
        <div class="trip-item">
            <p><strong>${trip.destination}</strong></p>
            <p>Сотрудник: ${trip.employee}</p>
            <p>Даты: ${new Date(trip.startDate).toLocaleDateString()} - 
                    ${new Date(trip.endDate).toLocaleDateString()}</p>
        </div>
    `).join('');
}

function updatePendingTrips(trips) {
    const pendingTrips = trips.filter(trip => trip.status === 'pending');
    const container = document.getElementById('pendingTrips');
    
    if (pendingTrips.length === 0) {
        container.innerHTML = '<p>Нет командировок на согласовании</p>';
        return;
    }

    container.innerHTML = pendingTrips.map(trip => `
        <div class="trip-item">
            <p><strong>${trip.destination}</strong></p>
            <p>Сотрудник: ${trip.employee}</p>
            <p>Даты: ${new Date(trip.startDate).toLocaleDateString()} - 
                    ${new Date(trip.endDate).toLocaleDateString()}</p>
        </div>
    `).join('');
}

function updateRecentActions() {
    const actions = JSON.parse(localStorage.getItem('recentActions')) || [];
    const container = document.getElementById('recentActions');
    
    if (actions.length === 0) {
        container.innerHTML = '<p>Нет последних действий</p>';
        return;
    }

    container.innerHTML = actions.map(action => `
        <div class="action-item">
            <p>${action.description}</p>
            <small>${new Date(action.date).toLocaleString()}</small>
        </div>
    `).join('');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Показать уведомление
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Удалить уведомление через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}
