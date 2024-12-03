class TripForm {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.formData = {};
        this.tripId = this.getTripIdFromUrl();
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFormData();
        if (this.tripId) {
            this.loadTripData();
        }
    }

    getTripIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    loadTripData() {
        const trips = JSON.parse(localStorage.getItem('trips')) || [];
        const trip = trips.find(t => t.id === this.tripId);
        if (trip) {
            this.formData = trip;
            this.populateForm();
        }
    }

    populateForm() {
        document.getElementById('employee').value = this.formData.employee;
        document.getElementById('startDate').value = this.formData.startDate;
        document.getElementById('endDate').value = this.formData.endDate;
        document.getElementById('destination').value = this.formData.destination;
        document.getElementById('purpose').value = this.formData.purpose;
        // Заполнение других полей формы
    }

    bindEvents() {
        const nextBtn = document.querySelector('.btn-next');
        const prevBtn = document.querySelector('.btn-prev');

        nextBtn.addEventListener('click', () => this.nextStep());
        prevBtn.addEventListener('click', () => this.prevStep());

        // Сохранение данных при изменении полей
        document.querySelectorAll('input, select, textarea').forEach(element => {
            element.addEventListener('change', (e) => {
                this.formData[e.target.id] = e.target.value;
                this.saveFormData();
            });
        });
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateUI();
            } else {
                this.submitForm();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateUI();
        }
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.validateStep1();
            case 2:
                return this.validateStep2();
            case 3:
                return this.validateStep3();
            case 4:
                return this.validateStep4();
            default:
                return true;
        }
    }

    updateUI() {
        // Обновляем отображение шагов
        document.querySelectorAll('.step-content').forEach((content, index) => {
            content.style.display = index + 1 === this.currentStep ? 'block' : 'none';
        });

        // Обновляем индикатор шагов
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 <= this.currentStep);
        });

        // Обновляем кнопки
        document.querySelector('.btn-prev').disabled = this.currentStep === 1;
        const nextBtn = document.querySelector('.btn-next');
        nextBtn.textContent = this.currentStep === this.totalSteps ? 'Отправить' : 'Далее';

        // Если мы на шаге 4, генерируем сводку
        if (this.currentStep === 4) {
            this.generateSummary();
        }
    }

    saveFormData() {
        localStorage.setItem('tripFormData', JSON.stringify(this.formData));
    }

    loadFormData() {
        const savedData = localStorage.getItem('tripFormData');
        if (savedData) {
            this.formData = JSON.parse(savedData);
            // Заполнение полей формы сохраненными данными
            Object.entries(this.formData).forEach(([id, value]) => {
                const field = document.getElementById(id);
                if (field) field.value = value;
            });
        }
    }

    submitForm() {
        if (this.validateCurrentStep()) {
            try {
                const trips = JSON.parse(localStorage.getItem('trips')) || [];
                
                // Собираем все данные из формы
                this.formData = {
                    ...this.formData,
                    employee: document.getElementById('employee').value,
                    startDate: document.getElementById('startDate').value,
                    endDate: document.getElementById('endDate').value,
                    destination: document.getElementById('destination').value,
                    purpose: document.getElementById('purpose').value,
                    status: 'pending', // Добавляем статус по умолчанию
                    createdAt: new Date().toISOString() // Добавляем дату создания
                };

                if (this.tripId) {
                    // Обновление существующей командировки
                    const index = trips.findIndex(t => t.id === this.tripId);
                    if (index !== -1) {
                        trips[index] = {
                            ...trips[index],
                            ...this.formData,
                            updatedAt: new Date().toISOString()
                        };
                        showNotification('Командировка успешно обновлена', 'success');
                    }
                } else {
                    // Создание новой командировки
                    this.formData.id = Date.now().toString();
                    trips.push(this.formData);
                    showNotification('Командировка успешно создана', 'success');
                }

                localStorage.setItem('trips', JSON.stringify(trips));
                localStorage.removeItem('tripFormData');

                // Добавим небольшую задержку перед переходом, чтобы пользователь увидел уведомление
                setTimeout(() => {
                    window.location.href = 'trip-list.html';
                }, 1500);
            } catch (error) {
                console.error('Ошибка при сохранении командировки:', error);
                showNotification('Произошла ошибка при сохранении', 'error');
            }
        }
    }

    initializeExpenses() {
        const addButton = document.getElementById('add-expense');
        if (addButton) {
            addButton.addEventListener('click', () => this.addExpenseField());
        }

        // Инициализация калькулятора бюджета
        document.querySelectorAll('.cost-input').forEach(input => {
            input.addEventListener('input', () => this.calculateTotal());
        });
    }

    addExpenseField() {
        const container = document.getElementById('additional-expenses');
        const expenseItem = document.createElement('div');
        expenseItem.className = 'expense-item';
        expenseItem.innerHTML = `
            <input type="text" placeholder="Название расхода">
            <input type="number" placeholder="Сумма">
            <button type="button" class="remove-expense">Удалить</button>
        `;

        container.appendChild(expenseItem);

        expenseItem.querySelector('.remove-expense').addEventListener('click', () => {
            expenseItem.remove();
            this.calculateTotal();
        });
    }

    calculateTotal() {
        const transportCost = parseFloat(document.getElementById('transport-cost').value) || 0;
        const accommodationCost = parseFloat(document.getElementById('accommodation-cost').value) || 0;
        const dailyAllowance = parseFloat(document.getElementById('daily-allowance').value) || 0;
        const additionalCosts = parseFloat(document.getElementById('additional-costs').value) || 0;

        const total = transportCost + accommodationCost + dailyAllowance + additionalCosts;
        document.getElementById('total-amount').textContent = total.toLocaleString('ru-RU');
    }

    generateSummary() {
        const summary = document.getElementById('trip-summary');
        const employee = document.getElementById('employee').options[document.getElementById('employee').selectedIndex].text;
        const startDate = new Date(document.getElementById('startDate').value).toLocaleDateString('ru-RU');
        const endDate = new Date(document.getElementById('endDate').value).toLocaleDateString('ru-RU');

        summary.innerHTML = `
            <p><strong>Сотрудник:</strong> ${employee}</p>
            <p><strong>Период:</strong> ${startDate} - ${endDate}</p>
            <p><strong>Место назначения:</strong> ${document.getElementById('destination').value}</p>
            <p><strong>Цель поездки:</strong> ${document.getElementById('purpose').value}</p>
            <p><strong>Общий бюджет:</strong> ${document.getElementById('total-amount').textContent} ₽</p>
        `;
    }

    validateStep1() {
        const required = ['employee', 'startDate', 'endDate', 'destination', 'purpose'];
        const isValid = required.every(fieldId => {
            const field = document.getElementById(fieldId);
            const value = field.value.trim();
            if (!value) {
                field.classList.add('error');
                return false;
            }
            field.classList.remove('error');
            return true;
        });

        if (!isValid) {
            showNotification('Пожалуйста, заполните все обязательные поля', 'error');
        }
        return isValid;
    }

    validateStep2() {
        const transport = document.querySelector('input[name="transport"]:checked');
        return transport !== null;
    }

    validateStep3() {
        const total = parseFloat(document.getElementById('total-amount').textContent.replace(/\s/g, ''));
        return total > 0;
    }

    validateStep4() {
        return document.getElementById('confirm-data').checked;
    }
}

// Инициализация формы при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const tripForm = new TripForm();
    tripForm.initializeExpenses();
}); 