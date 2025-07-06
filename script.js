// Referencias a elementos del DOM (Login)
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const passwordInput = document.getElementById('password-input');
const loginMessage = document.getElementById('login-message');
const numericKeypad = document.getElementById('numeric-keypad');
const logoutButton = document.getElementById('logout-button');

const CORRECT_PIN = "1813";
let enteredPin = "";

// Lógica de Login
function updatePasswordInput() {
    passwordInput.value = "*".repeat(enteredPin.length);
    if (enteredPin.length === 0 && !loginMessage.textContent) {
        passwordInput.placeholder = "Introduce PIN";
    } else if (loginMessage.textContent) {
        passwordInput.placeholder = "";
    }
}

function checkPin() {
    if (enteredPin === CORRECT_PIN) {
        loginContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        enteredPin = "";
        updatePasswordInput();
        loginMessage.textContent = "";
        loadWorries(); // Load worries when successfully logged in
    } else {
        loginMessage.textContent = "PIN Incorrecto";
        enteredPin = "";
        updatePasswordInput();
        setTimeout(() => {
            loginMessage.textContent = "";
            updatePasswordInput();
        }, 1500);
    }
}

// Función para cerrar la sesión
function logout() {
    appContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
    enteredPin = "";
    updatePasswordInput();
    loginMessage.textContent = "";
}

// Event listener para el teclado numérico
numericKeypad.addEventListener('click', (event) => {
    const key = event.target.textContent;

    if (key) {
        if (key === 'CLR') {
            enteredPin = "";
        } else if (key === 'ENT') {
            checkPin();
        } else if (!isNaN(key)) {
            if (enteredPin.length < 4) {
                enteredPin += key;
            }
        }
        updatePasswordInput();
    }
});

// Event Listener para el botón de logout
logoutButton.addEventListener('click', logout);


// --- Lógica de la aplicación de Preocupaciones ---

// Referencias a elementos del DOM (Preocupaciones)
const worryInput = document.getElementById('worryInput');
const worstCaseInput = document.getElementById('worstCaseInput');
const solutionInput = document.getElementById('solutionInput');
const controlYesBtn = document.getElementById('controlYesBtn'); // Add this
const controlNoBtn = document.getElementById('controlNoBtn');   // Add this
const controlInput = document.getElementById('controlInput');   // Add this
const addWorryBtn = document.getElementById('addWorryBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const worriesList = document.getElementById('worriesList');
const noWorriesMessage = document.getElementById('noWorriesMessage');

let worries = [];
let editingIndex = -1; // -1 means no item is being edited

// Function to save worries to Local Storage
function saveWorries() {
    localStorage.setItem('worries', JSON.stringify(worries));
}

// Function to load worries from Local Storage
function loadWorries() {
    const storedWorries = localStorage.getItem('worries');
    if (storedWorries) {
        worries = JSON.parse(storedWorries);
    }
    renderWorries();
}

// Function to render/display worries
function renderWorries() {
    worriesList.innerHTML = ''; // Clear current list
    if (worries.length === 0) {
        noWorriesMessage.classList.remove('hidden');
    } else {
        noWorriesMessage.classList.add('hidden');
        worries.forEach((worry, index) => {
            const worryItem = document.createElement('div');
            worryItem.classList.add('worry-item');

            // Determine the class for the control text based on the stored value
            const controlClass = worry.control === 'Sí' ? 'worry-item-control-yes' : 'worry-item-control-no';
            const controlText = worry.control ? `<div class="worry-item-text"><strong>¿Lo controlas tú?:</strong> <span class="${controlClass}">${worry.control}</span></div>` : '';

            worryItem.innerHTML = `
                <div class="worry-item-header">${worry.worryText}</div>
                <div class="worry-item-text"><strong>Peor escenario:</strong> ${worry.worstCaseText}</div>
                <div class="worry-item-text"><strong>Solución:</strong> ${worry.solutionText}</div>
                ${controlText}
                <div class="worry-item-actions">
                    <button class="edit-button action-button" data-index="${index}">Editar</button>
                    <button class="delete-button action-button" data-index="${index}">Eliminar</button>
                </div>
            `;
            worriesList.appendChild(worryItem);
        });
    }
}

// Function to add or update a worry
function addOrUpdateWorry() {
    const worryText = worryInput.value.trim();
    const worstCaseText = worstCaseInput.value.trim();
    const solutionText = solutionInput.value.trim();
    const control = controlInput.value; // Get the value from the hidden input

    if (worryText === '') {
        alert('Por favor, escribe tu preocupación.');
        return;
    }

    if (editingIndex === -1) {
        // Add new worry
        worries.push({ worryText, worstCaseText, solutionText, control }); // Include control
    } else {
        // Update existing worry
        worries[editingIndex] = { worryText, worstCaseText, solutionText, control }; // Include control
        editingIndex = -1; // Reset editing state
        addWorryBtn.textContent = 'Añadir Preocupación';
        cancelEditBtn.classList.add('hidden');
    }

    saveWorries();
    renderWorries();
    clearForm();
}

// Function to clear input fields and button selections
function clearForm() {
    worryInput.value = '';
    worstCaseInput.value = '';
    solutionInput.value = '';
    controlInput.value = ''; // Clear the hidden input
    controlYesBtn.classList.remove('selected'); // Deselect buttons
    controlNoBtn.classList.remove('selected');   // Deselect buttons
}

// Function to handle edit button click
function editWorry(index) {
    const worryToEdit = worries[index];
    worryInput.value = worryToEdit.worryText;
    worstCaseInput.value = worryToEdit.worstCaseText;
    solutionInput.value = worryToEdit.solutionText;
    controlInput.value = worryToEdit.control || ''; // Set control value

    // Visually select the correct control button
    controlYesBtn.classList.remove('selected');
    controlNoBtn.classList.remove('selected');
    if (worryToEdit.control === 'Sí') {
        controlYesBtn.classList.add('selected');
    } else if (worryToEdit.control === 'No') {
        controlNoBtn.classList.add('selected');
    }

    editingIndex = index;
    addWorryBtn.textContent = 'Guardar Edición';
    cancelEditBtn.classList.remove('hidden');
}

// Function to handle delete button click
function deleteWorry(index) {
    if (confirm('¿Estás seguro de que quieres eliminar esta preocupación?')) {
        worries.splice(index, 1);
        saveWorries();
        renderWorries();
    }
}

// Event listener for adding/updating a worry
addWorryBtn.addEventListener('click', addOrUpdateWorry);

// Event listener for canceling edit
cancelEditBtn.addEventListener('click', () => {
    editingIndex = -1;
    addWorryBtn.textContent = 'Añadir Preocupación';
    cancelEditBtn.classList.add('hidden');
    clearForm(); // This will now also clear the control selection
});

// Event listeners for the new control buttons
controlYesBtn.addEventListener('click', () => {
    controlInput.value = 'Sí';
    controlYesBtn.classList.add('selected');
    controlNoBtn.classList.remove('selected');
});

controlNoBtn.addEventListener('click', () => {
    controlInput.value = 'No';
    controlNoBtn.classList.add('selected');
    controlYesBtn.classList.remove('selected');
});

// Event delegation for edit and delete buttons
worriesList.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('edit-button')) {
        const index = parseInt(target.dataset.index);
        editWorry(index);
    } else if (target.classList.contains('delete-button')) {
        const index = parseInt(target.dataset.index);
        deleteWorry(index);
    }
});

// Al cargar la página, aseguramos que la pantalla de login esté visible
// y la app principal oculta inicialmente.
window.onload = () => {
    loginContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
    updatePasswordInput();
    // Worries are loaded only after successful login, so no need to load here on initial page load
};