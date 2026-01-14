// Global variables (removed local arrays, now fetching from API)

// Login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'admin') {
        document.getElementById('login').style.display = 'none';
        document.getElementById('mainHeader').style.display = 'block';
        document.getElementById('mainContent').style.display = 'block';
        showSection('dashboard');
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
});

function logout() {
    document.getElementById('login').style.display = 'block';
    document.getElementById('mainHeader').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').style.display = 'none';
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('#mainContent .section').forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    updateDisplays();
}

// Update all displays and selects
function updateDisplays() {
    updatePatientList();
    updateAppointmentList();
    updatePaymentList();
    updateInventoryList();
    updateSelects();
    updateDashboardStats(); // Update dashboard when data changes
}

// Patient Registration
document.getElementById('patientForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('patientName').value;
    const email = document.getElementById('patientEmail').value;
    const phone = document.getElementById('patientPhone').value;
    const dob = document.getElementById('patientDOB').value;
    const address = document.getElementById('patientAddress').value;

    const patient = {
        name,
        email,
        phone,
        dob,
        address
    };

    try {
        console.log('Submitting patient data:', patient);
        const response = await fetch('/api/patients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patient)
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (response.ok) {
            const newPatient = await response.json();
            console.log('New patient created:', newPatient);
            this.reset();
            // Refresh in-memory data so selects and lists get the new patient
            if (!window.patients) {
                window.patients = [];
            }
            window.patients.push(newPatient);
            updateDisplays();
            alert('Patient registered successfully!');
        } else {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            alert('Error registering patient: ' + errorText);
        }
    } catch (error) {
        console.error('Error adding patient:', error);
        alert('Network error: ' + error.message);
    }
});

function updatePatientList() {
    const list = document.getElementById('patientList');
    list.innerHTML = '';
    if (window.patients) {
        window.patients.forEach(patient => {
            const div = document.createElement('div');
            div.className = 'patient-item';
            div.innerHTML = `
                <strong>${patient.name}</strong><br>
                Email: ${patient.email}<br>
                Phone: ${patient.phone}<br>
                DOB: ${patient.dob}<br>
                Address: ${patient.address}
            `;
            list.appendChild(div);
        });
    }
}

// Appointment Scheduling
document.getElementById('appointmentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const patientId = document.getElementById('appointmentPatient').value;
    const date = document.getElementById('appointmentDate').value;
    const doctor = document.getElementById('appointmentDoctor').value;
    const reason = document.getElementById('appointmentReason').value;

    const appointment = {
        patientId,
        date,
        doctor,
        reason
    };

    try {
        const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointment)
        });

        if (response.ok) {
            const newAppointment = await response.json();
            this.reset();
            loadData();
        }
    } catch (error) {
        console.error('Error adding appointment:', error);
    }
});

function updateAppointmentList() {
    const list = document.getElementById('appointmentList');
    list.innerHTML = '';
    if (window.appointments) {
        window.appointments.forEach(appointment => {
            const patient = window.patients ? window.patients.find(p => p._id === appointment.patientId) : null;
            const div = document.createElement('div');
            div.className = 'appointment-item';
            div.innerHTML = `
                <strong>Patient: ${patient ? patient.name : 'Unknown'}</strong><br>
                Date: ${new Date(appointment.date).toLocaleString()}<br>
                Doctor: ${appointment.doctor}<br>
                Reason: ${appointment.reason}
            `;
            list.appendChild(div);
        });
    }
}

// Electronic Health Records
document.getElementById('ehrForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const patientId = document.getElementById('ehrPatient').value;
    const notes = document.getElementById('ehrNotes').value;
    const diagnosis = document.getElementById('ehrDiagnosis').value;
    const treatment = document.getElementById('ehrTreatment').value;

    const record = {
        patientId,
        notes,
        diagnosis,
        treatment
    };

    try {
        const response = await fetch('/api/ehr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        });

        if (response.ok) {
            this.reset();
            loadEHR();
        }
    } catch (error) {
        console.error('Error saving EHR:', error);
    }
});

async function loadEHR() {
    const patientId = document.getElementById('ehrPatient').value;
    const display = document.getElementById('ehrDisplay');
    display.innerHTML = '';

    if (!patientId) return;

    try {
        const response = await fetch(`/api/ehr/${patientId}`);
        const records = await response.json();
        records.forEach(record => {
            const div = document.createElement('div');
            div.className = 'ehr-item';
            div.innerHTML = `
                <strong>Date: ${new Date(record.createdAt).toLocaleDateString()}</strong><br>
                Notes: ${record.notes}<br>
                Diagnosis: ${record.diagnosis}<br>
                Treatment: ${record.treatment}
            `;
            display.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading EHR:', error);
    }
}

// Payment Management
document.getElementById('paymentForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const patientId = document.getElementById('paymentPatient').value;
    const amount = document.getElementById('paymentAmount').value;
    const date = document.getElementById('paymentDate').value;
    const description = document.getElementById('paymentDescription').value;

    const payment = {
        patientId,
        amount: parseFloat(amount),
        date,
        description
    };

    try {
        const response = await fetch('/api/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payment)
        });

        if (response.ok) {
            const newPayment = await response.json();
            this.reset();
            loadData();
        }
    } catch (error) {
        console.error('Error adding payment:', error);
    }
});

function updatePaymentList() {
    const list = document.getElementById('paymentList');
    list.innerHTML = '';
    if (window.payments) {
        window.payments.forEach(payment => {
            const patient = window.patients ? window.patients.find(p => p._id === payment.patientId) : null;
            const div = document.createElement('div');
            div.className = 'payment-item';
            div.innerHTML = `
                <strong>Patient: ${patient ? patient.name : 'Unknown'}</strong><br>
                Amount: $${payment.amount.toFixed(2)}<br>
                Date: ${payment.date}<br>
                Description: ${payment.description}
            `;
            list.appendChild(div);
        });
    }
}

// Inventory Management
document.getElementById('inventoryForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const name = document.getElementById('itemName').value;
    const quantity = document.getElementById('itemQuantity').value;
    const price = document.getElementById('itemPrice').value;

    const item = {
        name,
        quantity: parseInt(quantity),
        price: parseFloat(price)
    };

    try {
        const response = await fetch('/api/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });

        if (response.ok) {
            const newItem = await response.json();
            this.reset();
            loadData();
        }
    } catch (error) {
        console.error('Error adding inventory item:', error);
    }
});

function updateInventoryList() {
    const list = document.getElementById('inventoryList');
    list.innerHTML = '';
    if (window.inventory) {
        window.inventory.forEach(item => {
            const div = document.createElement('div');
            div.className = 'inventory-item';
            div.innerHTML = `
                <strong>${item.name}</strong><br>
                Quantity: ${item.quantity}<br>
                Price per Unit: $${item.price.toFixed(2)}<br>
                Total Value: $${(item.quantity * item.price).toFixed(2)}
            `;
            list.appendChild(div);
        });
    }
}

// Update select options
function updateSelects() {
    const patientSelects = ['appointmentPatient', 'ehrPatient', 'paymentPatient'];
    patientSelects.forEach(id => {
        const select = document.getElementById(id);
        select.innerHTML = '<option value="">Select Patient</option>';
        if (window.patients) {
            window.patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient._id;
                option.textContent = patient.name;
                select.appendChild(option);
            });
        }
    });
}

// Load data from server
async function loadData() {
    try {
        const [patientsRes, appointmentsRes, paymentsRes, inventoryRes] = await Promise.all([
            fetch('/api/patients'),
            fetch('/api/appointments'),
            fetch('/api/payments'),
            fetch('/api/inventory')
        ]);

        window.patients = await patientsRes.json();
        window.appointments = await appointmentsRes.json();
        window.payments = await paymentsRes.json();
        window.inventory = await inventoryRes.json();

        updateDisplays();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Dashboard Statistics and Charts
let patientsChart = null;
let revenueChart = null;

function updateDashboardStats() {
    if (!window.patients || !window.appointments || !window.payments || !window.inventory) {
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's Patients
    const todayPatients = window.patients.filter(p => {
        const patientDate = new Date(p.createdAt);
        patientDate.setHours(0, 0, 0, 0);
        return patientDate.getTime() === today.getTime();
    }).length;
    document.getElementById('todayPatients').textContent = todayPatients;

    // Today's Appointments
    const todayAppointments = window.appointments.filter(a => {
        const aptDate = new Date(a.date);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
    }).length;
    document.getElementById('todayAppointments').textContent = todayAppointments;

    // Pending Bills (assuming unpaid if no payment record exists)
    // For simplicity, showing total payments as pending (you can modify logic)
    const totalPayments = window.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    document.getElementById('pendingBills').textContent = `₹${totalPayments.toFixed(2)}`;

    // Low Stock Items (quantity < 10)
    const lowStock = window.inventory.filter(item => (item.quantity || 0) < 10).length;
    document.getElementById('lowStockItems').textContent = lowStock;

    // Update Charts
    updatePatientsChart();
    updateRevenueChart();
}

function updatePatientsChart() {
    if (!window.patients) return;

    const ctx = document.getElementById('patientsChart');
    if (!ctx) return;

    // Get last 7 days data
    const days = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        days.push(dayName);
        
        const count = window.patients.filter(p => {
            const patientDate = new Date(p.createdAt);
            patientDate.setHours(0, 0, 0, 0);
            return patientDate.getTime() === date.getTime();
        }).length;
        counts.push(count);
    }

    if (patientsChart) {
        patientsChart.destroy();
    }

    patientsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Patients',
                data: counts,
                borderColor: 'rgb(74, 144, 226)',
                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function updateRevenueChart() {
    if (!window.payments) return;

    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    // Get last 6 months data
    const months = [];
    const revenues = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        date.setDate(1);
        
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        months.push(monthName);
        
        const monthPayments = window.payments.filter(p => {
            const paymentDate = new Date(p.date);
            return paymentDate.getMonth() === date.getMonth() && 
                   paymentDate.getFullYear() === date.getFullYear();
        });
        
        const revenue = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        revenues.push(revenue);
    }

    if (revenueChart) {
        revenueChart.destroy();
    }

    revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Revenue (₹)',
                data: revenues,
                backgroundColor: 'rgba(40, 167, 69, 0.6)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });
}

// Update navigation to refresh dashboard when switching to it
const originalShowSection = showSection;
showSection = function(sectionId) {
    originalShowSection(sectionId);
    if (sectionId === 'dashboard') {
        updateDashboardStats();
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    showSection('dashboard');
});
