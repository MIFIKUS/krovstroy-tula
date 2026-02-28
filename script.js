// Data
const cities = [
    "Алексин",
    "Белёв",
    "Богородицк",
    "Болохово",
    "Венёв",
    "Донской",
    "Ефремов",
    "Кимовск",
    "Киреевск",
    "Липки",
    "Новомосковск",
    "Плавск",
    "Советск",
    "Суворов",
    "Узловая",
    "Чекалин",
    "Щёкино",
    "Ясногорск"
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    renderCities();
    initHeaderScroll();
    initRoofingWizard();
    initTerraceWizard();
});

// Render Cities
function renderCities() {
    const container = document.getElementById('citiesContainer');
    cities.forEach((city, index) => {
        const tag = document.createElement('div');
        tag.className = 'city-tag bg-slate-700 hover:bg-orange-600 text-slate-300 hover:text-white px-4 py-2 rounded-full text-sm cursor-pointer border border-slate-600';
        tag.textContent = city;
        tag.style.animationDelay = `${index * 0.02}s`;
        container.appendChild(tag);
    });
}

// Header Scroll Effect
function initHeaderScroll() {
    const header = document.getElementById('header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.classList.add('shadow-lg');
        } else {
            header.classList.remove('shadow-lg');
        }
        
        lastScroll = currentScroll;
    });
}

// Mobile Menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

// Smooth Scroll
function scrollToSection(id) {
    const element = document.getElementById(id);
    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
    
    // Close mobile menu if open
    document.getElementById('mobileMenu').classList.add('hidden');
}

// Service Filtering
function filterServices(category) {
    // Update tabs
    document.querySelectorAll('#serviceTabs button').forEach(btn => {
        if (btn.dataset.tab === category) {
            btn.classList.remove('tab-inactive');
            btn.classList.add('tab-active');
        } else {
            btn.classList.remove('tab-active');
            btn.classList.add('tab-inactive');
        }
    });
    
    // Filter cards
    const cards = document.querySelectorAll('#servicesGrid > div');
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, 10);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Switch between roofing and terrace services
function setServiceType(type) {
    const roofBlock = document.getElementById('roofingServicesBlock');
    const terraceBlock = document.getElementById('terraceServicesBlock');
    const typeTabs = document.querySelectorAll('#serviceTypeTabs button');

    typeTabs.forEach(btn => {
        if (btn.dataset.type === type) {
            btn.classList.remove('tab-inactive');
            btn.classList.add('tab-active');
        } else {
            btn.classList.remove('tab-active');
            btn.classList.add('tab-inactive');
        }
    });

    if (roofBlock && terraceBlock) {
        if (type === 'terrace') {
            roofBlock.classList.add('hidden');
            terraceBlock.classList.remove('hidden');
        } else {
            roofBlock.classList.remove('hidden');
            terraceBlock.classList.add('hidden');
        }
    }
}

// Modal
function openModal(serviceName = '') {
    const modal = document.getElementById('modal');
    const modalText = document.getElementById('modalText');
    
    if (serviceName) {
        modalText.textContent = `Оставьте заявку на услугу "${serviceName}" — мы рассчитаем стоимость`;
    } else {
        modalText.textContent = 'Оставьте телефон — мы перезвоним в течение 15 минут';
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Re-init icons in modal
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Roofing Quiz Modal
function openRoofingModal() {
    const modal = document.getElementById('roofingModal');
    const form = modal.querySelector('form');

    if (form) {
        form.reset();
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Reset quiz wizard to step 1 on open
    if (typeof window.__roofingWizardReset === 'function') {
        window.__roofingWizardReset();
    }
}

// Terrace Quiz Modal
function openTerraceModal() {
    const modal = document.getElementById('terraceModal');
    const form = modal.querySelector('form');

    if (form) {
        form.reset();
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    if (typeof window.__terraceWizardReset === 'function') {
        window.__terraceWizardReset();
    }
}

function closeTerraceModal() {
    const modal = document.getElementById('terraceModal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function closeRoofingModal() {
    const modal = document.getElementById('roofingModal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Form Submission
async function sendFormData(data) {
    const url = '/api/send-form';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
    });

    let json = null;
    try {
        json = await response.json();
    } catch (e) {
        // игнорируем, если тело не JSON
    }

    if (!response.ok || !json || json.status !== 'ok') {
        throw new Error('Ошибка ответа сервера');
    }
}

function submitForm(form) {
    const button = form.querySelector('button[type="submit"]');
    const originalText = button ? button.textContent : '';

    const nameInput = form.querySelector('input[type="text"]');
    const phoneInput = form.querySelector('input[type="tel"]');

    if (phoneInput) {
        const digits = phoneInput.value.replace(/\D/g, '');
        if (digits.length < 10) {
            phoneInput.classList.add('ring-4', 'ring-red-300');
            setTimeout(() => phoneInput.classList.remove('ring-4', 'ring-red-300'), 1000);
            return;
        }
    }

    const data = { source: 'callback-modal' };
    if (nameInput && nameInput.value.trim()) {
        data.name = nameInput.value.trim();
    }
    if (phoneInput && phoneInput.value.trim()) {
        data.phone = phoneInput.value.trim();
    }

    const modalTextEl = document.getElementById('modalText');
    if (modalTextEl && modalTextEl.textContent) {
        data.context = modalTextEl.textContent.trim();
    }

    // Отправляем в фоне, пользователю сразу показываем успех
    sendFormData(data).catch((e) => {
        console.error('Ошибка отправки callback-modal:', e);
    });

    if (button) {
        button.disabled = true;
        button.textContent = 'Отправка...';
    }

    setTimeout(() => {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
        closeModal();
        showNotification();
        form.reset();
    }, 500);
}

function submitRoofingForm(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const phoneInput = form.querySelector('input[name="phone"]');

    if (!phoneInput) return;

    const digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length < 10) {
        phoneInput.classList.add('ring-4', 'ring-red-300');
        setTimeout(() => phoneInput.classList.remove('ring-4', 'ring-red-300'), 1000);
        return;
    }

    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Отправка...';

    const formData = new FormData(form);
    const data = { source: 'roofing-quiz' };
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Отправляем в фоне, без ожидания
    sendFormData(data).catch((e) => {
        console.error('Ошибка отправки roofing-quiz:', e);
    });

    setTimeout(() => {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        closeRoofingModal();
        showNotification();
        form.reset();
    }, 500);
}

function submitTerraceForm(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const phoneInput = form.querySelector('input[name="phone"]');

    if (!phoneInput) return;

    const digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length < 10) {
        phoneInput.classList.add('ring-4', 'ring-red-300');
        setTimeout(() => phoneInput.classList.remove('ring-4', 'ring-red-300'), 1000);
        return;
    }

    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Отправка...';

    const formData = new FormData(form);
    const data = { source: 'terrace-quiz' };
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Отправляем в фоне, без ожидания
    sendFormData(data).catch((e) => {
        console.error('Ошибка отправки terrace-quiz:', e);
    });

    setTimeout(() => {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        closeTerraceModal();
        showNotification();
        form.reset();
    }, 500);
}

// Roofing Quiz Wizard (step-by-step)
function initRoofingWizard() {
    const modal = document.getElementById('roofingModal');
    if (!modal) return;

    const form = modal.querySelector('#roofingQuizForm');
    if (!form) return;

    const steps = Array.from(form.querySelectorAll('.roofing-step'));
    const backBtn = form.querySelector('#roofingBackBtn');
    const nextBtn = form.querySelector('#roofingNextBtn');
    const stepText = form.querySelector('#roofingStepText');
    const progressBar = form.querySelector('#roofingProgressBar');

    if (!steps.length || !backBtn || !nextBtn || !stepText || !progressBar) return;

    const totalSteps = steps.length;
    let currentStep = 1;

    const getStepEl = (n) => steps.find(s => Number(s.dataset.step) === Number(n));

    const getDigits = (value) => String(value || '').replace(/\D/g, '');

    function isStepComplete(stepEl) {
        if (!stepEl) return false;

        // Special case: phone validation on last step
        const phone = stepEl.querySelector('input[name="phone"]');
        if (phone) {
            return getDigits(phone.value).length >= 10;
        }

        // Validate required inputs inside this step
        const required = Array.from(stepEl.querySelectorAll('input[required], select[required], textarea[required]'));
        if (!required.length) return true;

        const radioNames = new Set();
        for (const el of required) {
            if (el.tagName === 'INPUT' && el.type === 'radio') {
                radioNames.add(el.name);
                continue;
            }
            if (el.tagName === 'INPUT' && el.type === 'checkbox') {
                if (!el.checked) return false;
                continue;
            }
            if (!String(el.value || '').trim()) return false;
        }

        for (const name of radioNames) {
            const radios = Array.from(form.querySelectorAll('input[type="radio"]')).filter(r => r.name === name);
            if (!radios.some(r => r.checked)) return false;
        }

        return true;
    }

    function setNextEnabled(enabled) {
        nextBtn.disabled = !enabled;
        nextBtn.classList.toggle('opacity-50', !enabled);
        nextBtn.classList.toggle('cursor-not-allowed', !enabled);
    }

    function showStep(n) {
        currentStep = Math.min(Math.max(1, Number(n)), totalSteps);

        for (const stepEl of steps) {
            const stepNum = Number(stepEl.dataset.step);
            stepEl.classList.toggle('hidden', stepNum !== currentStep);
        }

        // Buttons
        backBtn.disabled = currentStep === 1;
        nextBtn.classList.toggle('hidden', currentStep === totalSteps);
        backBtn.classList.toggle('hidden', false);

        // Progress
        stepText.textContent = `Вопрос ${currentStep} из ${totalSteps}`;
        const percent = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${percent}%`;

        // Enable/disable next based on current step completion
        setNextEnabled(isStepComplete(getStepEl(currentStep)));

        // Focus first input for better UX
        const activeStep = getStepEl(currentStep);
        const firstInput = activeStep && activeStep.querySelector('input, select, textarea, button');
        if (firstInput && typeof firstInput.focus === 'function') {
            setTimeout(() => firstInput.focus(), 0);
        }
    }

    function goNext() {
        const active = getStepEl(currentStep);
        if (!isStepComplete(active)) {
            setNextEnabled(false);
            return;
        }
        showStep(currentStep + 1);
    }

    function goBack() {
        showStep(currentStep - 1);
    }

    backBtn.addEventListener('click', goBack);
    nextBtn.addEventListener('click', goNext);

    // Update "Далее" availability when user selects an option / types phone
    form.addEventListener('change', () => {
        setNextEnabled(isStepComplete(getStepEl(currentStep)));
    });
    form.addEventListener('input', () => {
        setNextEnabled(isStepComplete(getStepEl(currentStep)));
    });

    // Prevent accidental submit on intermediate steps
    form.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        if (currentStep >= totalSteps) return;
        e.preventDefault();
        if (isStepComplete(getStepEl(currentStep))) {
            goNext();
        }
    });

    // Expose reset hook for openRoofingModal()
    window.__roofingWizardReset = () => {
        showStep(1);
    };

    // Initial state
    showStep(1);
}

// Terrace Quiz Wizard (step-by-step)
function initTerraceWizard() {
    const modal = document.getElementById('terraceModal');
    if (!modal) return;

    const form = modal.querySelector('#terraceQuizForm');
    if (!form) return;

    const steps = Array.from(form.querySelectorAll('.terrace-step'));
    const backBtn = form.querySelector('#terraceBackBtn');
    const nextBtn = form.querySelector('#terraceNextBtn');
    const stepText = form.querySelector('#terraceStepText');
    const progressBar = form.querySelector('#terraceProgressBar');

    if (!steps.length || !backBtn || !nextBtn || !stepText || !progressBar) return;

    const totalSteps = steps.length;
    let currentStep = 1;

    const getStepEl = (n) => steps.find(s => Number(s.dataset.step) === Number(n));

    const getDigits = (value) => String(value || '').replace(/\D/g, '');

    function isStepComplete(stepEl) {
        if (!stepEl) return false;

        // Special case: phone validation on last step
        const phone = stepEl.querySelector('input[name="phone"]');
        if (phone) {
            return getDigits(phone.value).length >= 10;
        }

        // Validate required inputs inside this step
        const required = Array.from(stepEl.querySelectorAll('input[required], select[required], textarea[required]'));
        if (!required.length) return true;

        const radioNames = new Set();
        for (const el of required) {
            if (el.tagName === 'INPUT' && el.type === 'radio') {
                radioNames.add(el.name);
                continue;
            }
            if (el.tagName === 'INPUT' && el.type === 'checkbox') {
                if (!el.checked) return false;
                continue;
            }
            if (!String(el.value || '').trim()) return false;
        }

        for (const name of radioNames) {
            const radios = Array.from(form.querySelectorAll('input[type="radio"]')).filter(r => r.name === name);
            if (!radios.some(r => r.checked)) return false;
        }

        return true;
    }

    function setNextEnabled(enabled) {
        nextBtn.disabled = !enabled;
        nextBtn.classList.toggle('opacity-50', !enabled);
        nextBtn.classList.toggle('cursor-not-allowed', !enabled);
    }

    function showStep(n) {
        currentStep = Math.min(Math.max(1, Number(n)), totalSteps);

        for (const stepEl of steps) {
            const stepNum = Number(stepEl.dataset.step);
            stepEl.classList.toggle('hidden', stepNum !== currentStep);
        }

        // Buttons
        backBtn.disabled = currentStep === 1;
        nextBtn.classList.toggle('hidden', currentStep === totalSteps);
        backBtn.classList.toggle('hidden', false);

        // Progress
        stepText.textContent = `Вопрос ${currentStep} из ${totalSteps}`;
        const percent = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${percent}%`;

        // Enable/disable next based on current step completion
        setNextEnabled(isStepComplete(getStepEl(currentStep)));

        // Focus first input for better UX
        const activeStep = getStepEl(currentStep);
        const firstInput = activeStep && activeStep.querySelector('input, select, textarea, button');
        if (firstInput && typeof firstInput.focus === 'function') {
            setTimeout(() => firstInput.focus(), 0);
        }
    }

    function goNext() {
        const active = getStepEl(currentStep);
        if (!isStepComplete(active)) {
            setNextEnabled(false);
            return;
        }
        showStep(currentStep + 1);
    }

    function goBack() {
        showStep(currentStep - 1);
    }

    backBtn.addEventListener('click', goBack);
    nextBtn.addEventListener('click', goNext);

    // Update "Далее" availability when user selects an option / types phone
    form.addEventListener('change', () => {
        setNextEnabled(isStepComplete(getStepEl(currentStep)));
    });
    form.addEventListener('input', () => {
        setNextEnabled(isStepComplete(getStepEl(currentStep)));
    });

    // Prevent accidental submit on intermediate steps
    form.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        if (currentStep >= totalSteps) return;
        e.preventDefault();
        if (isStepComplete(getStepEl(currentStep))) {
            goNext();
        }
    });

    // Expose reset hook for openTerraceModal()
    window.__terraceWizardReset = () => {
        showStep(1);
    };

    // Initial state
    showStep(1);
}

function submitPhone(button) {
    const input = button.previousElementSibling;
    if (input.value.length < 10) {
        input.classList.add('ring-4', 'ring-red-300');
        setTimeout(() => input.classList.remove('ring-4', 'ring-red-300'), 1000);
        return;
    }

    const data = {
        source: 'cta-phone',
        phone: input.value.trim(),
    };

    // Отправляем в фоне, без ожидания
    sendFormData(data).catch((e) => {
        console.error('Ошибка отправки cta-phone:', e);
    });

    button.textContent = 'Отправка...';
    setTimeout(() => {
        button.textContent = 'Отправить';
        input.value = '';
        showNotification();
    }, 500);
}

// Notification
function showNotification() {
    const notification = document.getElementById('notification');
    notification.classList.remove('translate-y-20', 'opacity-0');
    
    setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// Lightbox functions
function openLightbox(element) {
    const img = element.querySelector('img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.add('hidden');
    document.body.style.overflow = '';
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeRoofingModal();
        closeTerraceModal();
        closeLightbox();
    }
});