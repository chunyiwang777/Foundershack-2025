// Global variables
let currentStep = 1;
let totalSteps = 6;
let voteData = {
    approve: 0,
    oppose: 0,
    participation: 0
};
let communityData = {
    households: 120,
    evShare: 25,
    pvCapacity: 200,
    batteryCapacity: 500,
    tariffType: 'tou'
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeChart();
    initializeDREvents(); // Initialize DR Events
});

// Initialize application
function initializeApp() {
    showStep(1);
    updateKPIs();
}

// Setup event listeners
function setupEventListeners() {
    // Navigation bar scroll effect
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('nav');
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Mobile navigation menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav ul');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Form input listeners
    setupFormListeners();
}

// Setup step navigation
function setupStepNavigation() {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.addEventListener('click', function() {
            goToStep(index + 1);
        });
        
        // Add mouse hover effects
        step.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });
        
        step.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
        });
    });
}

// Setup form listeners
function setupFormListeners() {
    // EV ratio slider
    const evRatioSlider = document.getElementById('evRatio');
    if (evRatioSlider) {
        evRatioSlider.addEventListener('input', function() {
            document.getElementById('evRatioValue').textContent = this.value + '%';
            updateKPIs();
        });
    }

    // Participation rate slider
    const participationSlider = document.getElementById('participation');
    if (participationSlider) {
        participationSlider.addEventListener('input', function() {
            document.getElementById('participationValue').textContent = this.value + '%';
            updateKPIs();
        });
    }

    // Comfort range slider
    const comfortSlider = document.getElementById('comfortRange');
    if (comfortSlider) {
        comfortSlider.addEventListener('input', function() {
            document.getElementById('comfortRangeValue').textContent = '±' + this.value + '°C';
            updateKPIs();
        });
    }

    // Time inputs
    const evStartTime = document.getElementById('evStartTime');
    const evEndTime = document.getElementById('evEndTime');
    if (evStartTime && evEndTime) {
        evStartTime.addEventListener('change', updateKPIs);
        evEndTime.addEventListener('change', updateKPIs);
    }

    // Community profile form
    const communityForm = document.getElementById('communityForm');
    if (communityForm) {
        communityForm.addEventListener('input', updateKPIs);
    }

    // Vote settings form
    setupVoteSettingsListeners();
}

// Setup vote settings listeners
function setupVoteSettingsListeners() {
    const voteDeadline = document.getElementById('vote-deadline');
    const emailSubject = document.getElementById('email-subject');
    const voteThreshold = document.getElementById('vote-threshold');
    const minParticipation = document.getElementById('min-participation');

    if (voteDeadline) voteDeadline.addEventListener('change', updateEmailPreview);
    if (emailSubject) emailSubject.addEventListener('input', updateEmailPreview);
    if (voteThreshold) voteThreshold.addEventListener('change', updateEmailPreview);
    if (minParticipation) minParticipation.addEventListener('change', updateEmailPreview);
}

// Update email preview
function updateEmailPreview() {
    const deadline = document.getElementById('vote-deadline').value;
    const subject = document.getElementById('email-subject').value || 'Community Energy Strategy Vote';
    const threshold = document.getElementById('vote-threshold').value || '60%';
    const minPart = document.getElementById('min-participation').value || '40%';

    if (deadline) {
        const deadlineDate = new Date(deadline);
        document.getElementById('deadline-preview').textContent = deadlineDate.toLocaleString('en-US');
    }

    document.getElementById('email-subject-preview').textContent = subject;
    document.getElementById('vote-threshold-preview').textContent = threshold;
    document.getElementById('min-participation-preview').textContent = minPart;
}

// Launch vote
function launchVote() {
    const deadline = document.getElementById('vote-deadline').value;
    const subject = document.getElementById('email-subject').value;
    const threshold = document.getElementById('vote-threshold').value;
    const minParticipation = document.getElementById('min-participation').value;

    if (!deadline || !subject) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Show sending state
    showNotification('Sending vote emails...', 'info');

    setTimeout(() => {
        // Hide settings and preview
        document.querySelector('.vote-settings').style.display = 'none';
        document.querySelector('.email-preview').style.display = 'none';
        document.querySelector('.action-buttons').style.display = 'none';

        // Show vote status
        document.querySelector('.vote-status').style.display = 'block';

        showNotification('Vote launched successfully! Emails sent to residents.', 'success');
    }, 2000);
}

// Preview email
function previewEmail() {
    const emailPreview = document.querySelector('.email-preview');
    emailPreview.scrollIntoView({ behavior: 'smooth' });
    updateEmailPreview();
}

// Save draft
function saveDraft() {
    const settings = {
        deadline: document.getElementById('vote-deadline').value,
        subject: document.getElementById('email-subject').value,
        threshold: document.getElementById('vote-threshold').value,
        minParticipation: document.getElementById('min-participation').value
    };

    localStorage.setItem('voteDraft', JSON.stringify(settings));
    showNotification('Draft saved successfully!', 'success');
}

// Copy vote link
function copyLink() {
    const voteLink = 'https://colab.example.com/vote/abc123';
    navigator.clipboard.writeText(voteLink).then(() => {
        showNotification('Vote link copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy link', 'error');
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Navigation functions
function nextStep() {
    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
        if (currentStep === 4) {
            setTimeout(() => ensureChartDisplay(), 300);
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
        if (currentStep === 4) {
            setTimeout(() => ensureChartDisplay(), 300);
        }
    }
}

function goToStep(step) {
    if (step >= 1 && step <= totalSteps) {
        currentStep = step;
        showStep(currentStep);
        if (currentStep === 4) {
            setTimeout(() => ensureChartDisplay(), 300);
        }
    }
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.step-content').forEach(content => {
        content.style.display = 'none';
    });

    // Show current step
    const currentStepContent = document.getElementById(`step-${step}`);
    if (currentStepContent) {
        currentStepContent.style.display = 'block';
    }

    // Update step indicators
    document.querySelectorAll('.step').forEach((stepEl, index) => {
        if (index + 1 <= step) {
            stepEl.classList.add('active');
        } else {
            stepEl.classList.remove('active');
        }
    });

    // Update navigation buttons
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const prevBtn = document.querySelector('.step-navigation .btn-secondary');
    const nextBtn = document.querySelector('.step-navigation .btn-primary');

    if (prevBtn) prevBtn.disabled = currentStep === 1;
    if (nextBtn) nextBtn.style.display = currentStep === totalSteps ? 'none' : 'inline-block';
}

// Update KPIs based on form inputs
function updateKPIs() {
    const evRatio = parseInt(document.getElementById('evRatio')?.value || 25);
    const participation = parseInt(document.getElementById('participation')?.value || 30);
    const comfortRange = parseInt(document.getElementById('comfortRange')?.value || 2);

    // Calculate KPIs (simplified calculations)
    const baselineCost = 100;
    const baselinePeak = 300;
    const baselineEmissions = 100;

    // Strategy A (default playbook)
    const strategyACost = baselineCost * (1 - (participation * 0.003));
    const strategyAPeak = baselinePeak * (1 - (participation * 0.005));
    const strategyAEmissions = baselineEmissions * (1 - (participation * 0.004));

    // Strategy B (customized)
    const strategyBCost = baselineCost * (1 - (participation * 0.004));
    const strategyBPeak = baselinePeak * (1 - (participation * 0.007));
    const strategyBEmissions = baselineEmissions * (1 - (participation * 0.006));

    // Update display
    updateKPIDisplay('baseline', baselineCost, baselinePeak, baselineEmissions, 1.0);
    updateKPIDisplay('strategyA', strategyACost, strategyAPeak, strategyAEmissions, 0.95);
    updateKPIDisplay('strategyB', strategyBCost, strategyBPeak, strategyBEmissions, 0.82);
}

function updateKPIDisplay(strategy, cost, peak, emissions, comfort) {
    const costEl = document.getElementById(`${strategy}Cost`);
    const peakEl = document.getElementById(`${strategy}Peak`);
    const emissionsEl = document.getElementById(`${strategy}Emissions`);
    const comfortEl = document.getElementById(`${strategy}Comfort`);

    if (costEl) costEl.textContent = cost.toFixed(0);
    if (peakEl) peakEl.textContent = peak.toFixed(0);
    if (emissionsEl) emissionsEl.textContent = emissions.toFixed(0);
    if (comfortEl) comfortEl.textContent = comfort.toFixed(2);
}

// Ensure chart displays correctly when step 4 is active
function ensureChartDisplay() {
    if (currentStep === 4) {
        const chartContainer = document.getElementById('comparisonChart');
        if (chartContainer && !window.comparisonChart) {
            // If chart container exists but no chart instance, re-initialize
            setTimeout(() => {
                initializeChart();
                // Add loaded class to hide loading message
                if (chartContainer.parentElement) {
                    chartContainer.parentElement.classList.add('loaded');
                }
            }, 300);
        } else if (window.comparisonChart) {
            // If chart instance exists, update display
            updateChart();
            // Ensure loaded class exists
            if (chartContainer.parentElement) {
                chartContainer.parentElement.classList.add('loaded');
            }
        }
    }
}

// Initialize chart
function initializeChart() {
    const ctx = document.getElementById('comparisonChart');
    if (!ctx) return;

    // Generate sample data
    const hours = Array.from({length: 24}, (_, i) => i);
    const baselineData = hours.map(h => 200 + Math.sin(h * Math.PI / 12) * 100 + Math.random() * 20);
    const strategyAData = hours.map(h => baselineData[h] * 0.8 + Math.random() * 15);
    const strategyBData = hours.map(h => baselineData[h] * 0.75 + Math.random() * 15);

    // Create chart
    window.comparisonChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours.map(h => `${h}:00`),
            datasets: [
                {
                    label: 'Baseline',
                    data: baselineData,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4,
                    borderWidth: 3
                },
                {
                    label: 'Strategy A',
                    data: strategyAData,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    borderWidth: 3
                },
                {
                    label: 'Strategy B',
                    data: strategyBData,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    tension: 0.4,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: '24-hour Load Curve Comparison',
                    font: { size: 18, weight: 'bold' },
                    color: '#2c3e50'
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 14 }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#3498db',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (Hours)',
                        font: { size: 14, weight: 'bold' },
                        color: '#2c3e50'
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    ticks: { color: '#7f8c8d' }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Load (kW)',
                        font: { size: 14, weight: 'bold' },
                        color: '#2c3e50'
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    ticks: { color: '#7f8c8d' },
                    beginAtZero: false
                }
            },
            interaction: { intersect: false, mode: 'index' },
            elements: {
                point: { radius: 4, hoverRadius: 6 }
            }
        }
    });
}

// Update chart
function updateChart() {
    if (window.comparisonChart) {
        window.comparisonChart.update();
    }
}

// Error handling
window.addEventListener('unhandledrejection', function(e) {
    handleError(e.reason, 'Unhandled Promise Rejection');
});

// DR Events functionality
function previewDREvent() {
    const eventName = document.getElementById('dr-event-name').value;
    const eventType = document.getElementById('dr-event-type').value;
    const startTime = document.getElementById('dr-start-time').value;
    const duration = document.getElementById('dr-duration').value;
    const targetReduction = document.getElementById('dr-target-reduction').value;
    const rewardPrice = document.getElementById('dr-reward-price').value;
    const description = document.getElementById('dr-description').value;

    if (!eventName || !startTime || !targetReduction || !rewardPrice) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Calculate expected revenue
    const expectedRevenue = (targetReduction * duration * rewardPrice).toFixed(2);
    
    const previewMessage = `
        DR Event Preview:
        - Name: ${eventName}
        - Type: ${eventType}
        - Duration: ${duration} hours
        - Target Reduction: ${targetReduction} kW
        - Expected Revenue: $${expectedRevenue}
        - Description: ${description}
    `;
    
    showNotification('DR Event preview generated successfully', 'success');
    console.log(previewMessage);
}

function createDREvent() {
    const eventName = document.getElementById('dr-event-name').value;
    const eventType = document.getElementById('dr-event-type').value;
    const startTime = document.getElementById('dr-start-time').value;
    const duration = document.getElementById('dr-duration').value;
    const targetReduction = document.getElementById('dr-target-reduction').value;
    const rewardPrice = document.getElementById('dr-reward-price').value;
    const description = document.getElementById('dr-description').value;

    if (!eventName || !startTime || !targetReduction || !rewardPrice) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Simulate creating DR event
    showNotification('Creating DR Event...', 'info');
    
    setTimeout(() => {
        // Clear form
        document.getElementById('dr-event-name').value = '';
        document.getElementById('dr-start-time').value = '';
        document.getElementById('dr-target-reduction').value = '';
        document.getElementById('dr-reward-price').value = '';
        document.getElementById('dr-description').value = '';
        
        showNotification('DR Event created successfully!', 'success');
        
        // Here you can add logic to add event to event list
        // Or refresh page to show new event
    }, 2000);
}

function viewEventDetails(eventId) {
    showNotification(`Viewing details for DR Event ${eventId}`, 'info');
    // Here you can implement logic to view event details
    // For example, open modal to display detailed information
}

function manageEvent(eventId) {
    showNotification(`Managing DR Event ${eventId}`, 'info');
    // Here you can implement logic to manage events
    // For example, edit, pause, cancel operations
}

function editEvent(eventId) {
    showNotification(`Editing DR Event ${eventId}`, 'info');
    // Here you can implement logic to edit events
    // For example, pre-fill form or open edit mode
}

function viewSettlement(settlementId) {
    showNotification(`Viewing settlement ${settlementId}`, 'info');
    // Here you can implement logic to view settlement details
    // For example, display detailed settlement report
}

// Initialize DR Events page
function initializeDREvents() {
    // Set default time (current time + 1 hour)
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    now.setSeconds(0);
    
    const startTimeInput = document.getElementById('dr-start-time');
    if (startTimeInput) {
        startTimeInput.value = now.toISOString().slice(0, 16);
    }
    
    // Add form validation
    const formInputs = document.querySelectorAll('.dr-form input, .dr-form select, .dr-form textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value) {
                this.style.borderColor = 'var(--danger-color)';
            } else {
                this.style.borderColor = 'var(--bg-light)';
            }
        });
    });
} 