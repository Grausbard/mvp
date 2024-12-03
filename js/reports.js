class ReportsManager {
    constructor() {
        this.trips = [];
        this.charts = {};
        this.init();
    }

    init() {
        this.loadTrips();
        this.bindEvents();
        this.updateReports();
    }

    loadTrips() {
        this.trips = JSON.parse(localStorage.getItem('trips')) || [];
    }

    bindEvents() {
        document.getElementById('updateReports').addEventListener('click', () => {
            this.updateReports();
        });

        document.getElementById('periodFilter').addEventListener('change', () => {
            this.updateReports();
        });
    }

    updateReports() {
        this.updateMetrics();
        this.updateCharts();
        this.updateTopDestinations();
    }

    updateMetrics() {
        const filteredTrips = this.getFilteredTrips();
        
        // Общее количество командировок
        document.getElementById('totalTrips').textContent = filteredTrips.length;

        // Общий бюджет
        const totalBudget = filteredTrips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
        document.getElementById('totalBudget').textContent = totalBudget.toLocaleString() + ' ₽';

        // Средняя длительность
        const avgDuration = this.calculateAverageDuration(filteredTrips);
        document.getElementById('avgDuration').textContent = avgDuration + ' дней';

        // Количество командировок на согласовании
        const pendingTrips = filteredTrips.filter(trip => trip.status === 'pending').length;
        document.getElementById('pendingTrips').textContent = pendingTrips;
    }

    updateCharts() {
        this.updateTripsChart();
        this.updateBudgetChart();
    }

    updateTripsChart() {
        const ctx = document.getElementById('tripsChart').getContext('2d');
        const monthlyData = this.getMonthlyTripsData();

        if (this.charts.tripsChart) {
            this.charts.tripsChart.destroy();
        }

        this.charts.tripsChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Количество командировок',
                    data: monthlyData.data,
                    backgroundColor: '#007bff'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    updateBudgetChart() {
        const ctx = document.getElementById('budgetChart').getContext('2d');
        const budgetData = this.getBudgetDistributionData();

        if (this.charts.budgetChart) {
            this.charts.budgetChart.destroy();
        }

        this.charts.budgetChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: budgetData.labels,
                datasets: [{
                    data: budgetData.data,
                    backgroundColor: [
                        '#007bff',
                        '#28a745',
                        '#ffc107',
                        '#dc3545'
                    ]
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    updateTopDestinations() {
        const destinations = this.calculateTopDestinations();
        const tbody = document.getElementById('topDestinationsBody');
        tbody.innerHTML = '';

        destinations.forEach(dest => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dest.destination}</td>
                <td>${dest.count}</td>
                <td>${dest.totalBudget.toLocaleString()} ₽</td>
            `;
            tbody.appendChild(tr);
        });
    }

    getFilteredTrips() {
        const period = document.getElementById('periodFilter').value;
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }

        return this.trips.filter(trip => new Date(trip.startDate) >= startDate);
    }

    calculateAverageDuration(trips) {
        if (trips.length === 0) return 0;
        
        const totalDays = trips.reduce((sum, trip) => {
            const start = new Date(trip.startDate);
            const end = new Date(trip.endDate);
            const days = (end - start) / (1000 * 60 * 60 * 24);
            return sum + days;
        }, 0);

        return Math.round(totalDays / trips.length);
    }

    getMonthlyTripsData() {
        const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 
                       'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        const data = new Array(12).fill(0);

        this.getFilteredTrips().forEach(trip => {
            const month = new Date(trip.startDate).getMonth();
            data[month]++;
        });

        return {
            labels: months,
            data: data
        };
    }

    getBudgetDistributionData() {
        const categories = {
            transport: 'Транспорт',
            accommodation: 'Проживание',
            daily: 'Суточные',
            other: 'Прочее'
        };

        const data = Object.keys(categories).map(cat => 0);
        
        this.getFilteredTrips().forEach(trip => {
            if (trip.budget) {
                // Здесь можно добавить более точное распределение бюджета
                data[0] += trip.budget * 0.4; // Транспорт
                data[1] += trip.budget * 0.3; // Проживание
                data[2] += trip.budget * 0.2; // Суточные
                data[3] += trip.budget * 0.1; // Прочее
            }
        });

        return {
            labels: Object.values(categories),
            data: data
        };
    }

    calculateTopDestinations() {
        const destinations = {};
        
        this.getFilteredTrips().forEach(trip => {
            if (!destinations[trip.destination]) {
                destinations[trip.destination] = {
                    count: 0,
                    totalBudget: 0
                };
            }
            destinations[trip.destination].count++;
            destinations[trip.destination].totalBudget += trip.budget || 0;
        });

        return Object.entries(destinations)
            .map(([destination, data]) => ({
                destination,
                count: data.count,
                totalBudget: data.totalBudget
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new ReportsManager();
}); 