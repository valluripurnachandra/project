document.addEventListener('DOMContentLoaded', () => {
    const scheduleData = [
        { time: '8:00 AM', event: 'Registration & Welcome' },
        { time: '9:30 AM', event: 'Keynote: Future of AI' },
        { time: '11:00 AM', event: 'Industry Panel Discussions' },
        { time: '2:00 PM', event: 'Technology Showcase' },
        { time: '5:00 PM', event: 'Networking Reception' }
    ];

    const scheduleContainer = document.getElementById('scheduleContainer');

    // Populate schedule
    scheduleData.forEach(item => {
        const scheduleItem = document.createElement('div');
        scheduleItem.classList.add('schedule-item');
        scheduleItem.innerHTML = `
            <span class="time">${item.time}</span>
            <span class="event">${item.event}</span>
        `;
        scheduleContainer.appendChild(scheduleItem);
    });

    // Registration form handling
    const registrationForm = document.getElementById('registrationForm');
    
    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(registrationForm);
        const registrationDetails = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationDetails)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Registration Successful! \n' + 
                      `Registration ID: ${result.registrationId}\n` +
                      `Total Amount: $${result.totalAmount}`);
                registrationForm.reset();
            } else {
                alert(`Registration Failed: ${result.message}`);
            }
        } catch (error) {
            console.error('Registration Error:', error);
            alert('Registration failed. Please try again.');
        }
    });
});