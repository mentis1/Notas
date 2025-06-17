document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const toggleFormButton = document.getElementById('toggleFormButton');
    const noteFormContainer = document.getElementById('noteFormContainer');
    const noteInput = document.getElementById('noteInput');
    const saveNoteButton = document.getElementById('saveNoteButton');
    const cancelNoteButton = document.getElementById('cancelNoteButton');
    const noteList = document.getElementById('noteList');
    const messageBox = document.getElementById('messageBox');
    const fullNoteView = document.getElementById('fullNoteView');
    const fullNoteText = document.getElementById('fullNoteText');
    const closeFullNoteButton = document.getElementById('closeFullNoteButton');
    const deleteFullNoteButton = document.getElementById('deleteFullNoteButton');
    const editFullNoteButton = document.getElementById('editFullNoteButton'); // Nuevo botón de edición
    const saveEditButton = document.getElementById('saveEditButton'); // Nuevo botón para guardar edición

    // Referencias a elementos del modal de confirmación
    const confirmationModal = document.getElementById('confirmationModal');
    const modalMessage = document.getElementById('modalMessage');
    const modalConfirmButton = document.getElementById('modalConfirmButton');
    const modalCancelButton = document.getElementById('modalCancelButton');

    // Array para almacenar las notas
    let notes = [];
    // Variable para almacenar el ID de la nota que se está viendo en pantalla completa
    let currentNoteId = null;

    // Variable global para resolver la promesa del modal de confirmación
    let resolveModalPromise;

    /**
     * Muestra un mensaje temporal en la pantalla (como un "toast").
     * @param {string} message - El mensaje a mostrar.
     */
    function showMessage(message) {
        messageBox.textContent = message;
        messageBox.classList.add('show');
        setTimeout(() => {
            messageBox.classList.remove('show');
        }, 2000); // El mensaje desaparece después de 2 segundos
    }

    /**
     * Muestra un modal de confirmación personalizado.
     * @param {string} message - El mensaje a mostrar en el modal.
     * @returns {Promise<boolean>} - Una promesa que resuelve a true si el usuario confirma, false en caso contrario.
     */
    function showConfirmationModal(message) {
        return new Promise(resolve => {
            modalMessage.textContent = message;
            confirmationModal.classList.remove('hidden');
            resolveModalPromise = resolve; // Almacena la función resolve globalmente

            // Configura los event listeners para los botones del modal
            // Se limpian después de cada uso para evitar múltiples llamadas si el modal se reutiliza rápidamente
            modalConfirmButton.onclick = () => {
                confirmationModal.classList.add('hidden');
                resolveModalPromise(true);
                modalConfirmButton.onclick = null; // Limpiar handler
                modalCancelButton.onclick = null; // Limpiar handler
            };
            modalCancelButton.onclick = () => {
                confirmationModal.classList.add('hidden');
                resolveModalPromise(false);
                modalConfirmButton.onclick = null; // Limpiar handler
                modalCancelButton.onclick = null; // Limpiar handler
            };
        });
    }

    /**
     * Carga las notas del almacenamiento local y las renderiza en la UI.
     */
    function loadNotes() {
        const storedNotes = localStorage.getItem('notesAppNotes');
        if (storedNotes) {
            notes = JSON.parse(storedNotes);
        }
        renderNotes();
    }

    /**
     * Guarda las notas en el almacenamiento local del navegador.
     */
    function saveNotes() {
        localStorage.setItem('notesAppNotes', JSON.stringify(notes));
    }

    /**
     * Renderiza todas las notas en el contenedor de la lista de notas.
     * Limpia el contenedor y crea una miniatura para cada nota.
     */
    function renderNotes() {
        noteList.innerHTML = ''; // Limpia la lista existente
        if (notes.length === 0) {
            noteList.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); margin-top: 50px;">No tienes notas aún. <br> ¡Crea una!</p>';
            return;
        }

        notes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.classList.add('note-card');
            noteCard.dataset.id = note.id; // Guarda el ID de la nota en el elemento DOM

            // Divide el contenido en título y cuerpo (primera línea como título, resto como contenido)
            const noteContentLines = note.content.split('\n');
            const title = noteContentLines[0] || 'Nota sin título';
            // El cuerpo es el resto del contenido, uniendo las líneas con saltos de línea
            const body = noteContentLines.slice(1).join('\n').trim();

            noteCard.innerHTML = `
                <h3 class="note-card-title">${title}</h3>
                <p class="note-card-content">${body}</p>
            `;

            // Abre la vista de nota completa al hacer clic en la miniatura
            noteCard.addEventListener('click', () => openFullNoteView(note.id));
            noteList.appendChild(noteCard);
        });
    }

    /**
     * Abre la vista de nota en pantalla completa con el contenido de la nota seleccionada.
     * @param {string} id - El ID de la nota a mostrar.
     */
    function openFullNoteView(id) {
        currentNoteId = id;
        const note = notes.find(n => n.id === id);
        if (note) {
            fullNoteText.value = note.content; // Muestra el contenido completo de la nota
            fullNoteText.setAttribute('readonly', 'true'); // Asegura que el texto sea de solo lectura inicialmente
            fullNoteView.classList.remove('hidden'); // Muestra la vista completa
            editFullNoteButton.classList.remove('hidden'); // Muestra el botón de editar
            saveEditButton.classList.add('hidden'); // Oculta el botón de guardar cambios
        }
    }

    /**
     * Cierra la vista de nota en pantalla completa.
     */
    function closeFullNoteView() {
        fullNoteView.classList.add('hidden'); // Oculta la vista completa
        currentNoteId = null; // Resetea el ID de la nota actual
        fullNoteText.value = ''; // Limpia el contenido del textarea
        fullNoteText.setAttribute('readonly', 'true'); // Asegura que vuelva a ser de solo lectura
        editFullNoteButton.classList.remove('hidden'); // Asegura que el botón de editar esté visible para la próxima vez
        saveEditButton.classList.add('hidden'); // Asegura que el botón de guardar esté oculto
    }

    /**
     * Agrega una nueva nota al array y al almacenamiento local, luego actualiza la UI.
     */
    function addNote() {
        const noteContent = noteInput.value.trim();
        if (noteContent) {
            const newNote = {
                id: Date.now().toString(), // ID único basado en la marca de tiempo
                content: noteContent
            };
            notes.unshift(newNote); // Añade la nueva nota al principio del array
            saveNotes();
            renderNotes();
            noteInput.value = ''; // Limpia el campo de entrada
            noteFormContainer.classList.add('hidden-form'); // Oculta el formulario
            showMessage('Nota guardada correctamente.');
        } else {
            showMessage('La nota no puede estar vacía.');
        }
    }

    /**
     * Habilita la edición de la nota en la vista de pantalla completa.
     */
    function enableEditMode() {
        fullNoteText.removeAttribute('readonly'); // Permite la edición del textarea
        fullNoteText.focus(); // Enfoca el textarea
        fullNoteText.select(); // Selecciona todo el texto para facilitar la edición
        editFullNoteButton.classList.add('hidden'); // Oculta el botón de editar
        saveEditButton.classList.remove('hidden'); // Muestra el botón de guardar cambios
    }

    /**
     * Guarda los cambios realizados en la nota en la vista de pantalla completa.
     */
    function saveEditedNote() {
        if (currentNoteId) {
            const updatedContent = fullNoteText.value.trim();
            if (updatedContent) {
                const noteIndex = notes.findIndex(n => n.id === currentNoteId);
                if (noteIndex !== -1) {
                    notes[noteIndex].content = updatedContent;
                    saveNotes();
                    renderNotes(); // Vuelve a renderizar las miniaturas para actualizar los cambios
                    showMessage('Nota actualizada correctamente.');
                    fullNoteText.setAttribute('readonly', 'true'); // Vuelve a poner el textarea en solo lectura
                    editFullNoteButton.classList.remove('hidden'); // Vuelve a mostrar el botón de editar
                    saveEditButton.classList.add('hidden'); // Oculta el botón de guardar cambios
                }
            } else {
                showMessage('La nota no puede estar vacía.');
            }
        }
    }

    /**
     * Elimina una nota del array y del almacenamiento local, luego actualiza la UI.
     * Utiliza un modal de confirmación personalizado.
     * @param {string} id - El ID de la nota a eliminar.
     */
    async function deleteNote(id) {
        const userConfirmed = await showConfirmationModal("¿Estás seguro de que quieres eliminar esta nota?");
        if (userConfirmed) {
            notes = notes.filter(note => note.id !== id);
            saveNotes();
            renderNotes();
            closeFullNoteView(); // Cierra la vista completa si se eliminó desde allí
            showMessage('Nota eliminada.');
        }
    }

    // Event Listeners

    // Muestra/oculta el formulario al hacer clic en el botón "Añadir Nota"
    toggleFormButton.addEventListener('click', () => {
        noteFormContainer.classList.toggle('hidden-form');
        if (!noteFormContainer.classList.contains('hidden-form')) {
            noteInput.focus(); // Enfoca el textarea cuando el formulario es visible
        }
    });

    // Guarda la nota al hacer clic en el botón "Guardar Nota"
    saveNoteButton.addEventListener('click', addNote);

    // Cancela la creación de la nota y oculta el formulario
    cancelNoteButton.addEventListener('click', () => {
        noteInput.value = ''; // Limpia el contenido
        noteFormContainer.classList.add('hidden-form');
    });

    // Cierra la vista de nota completa
    closeFullNoteButton.addEventListener('click', closeFullNoteView);

    // Habilita el modo de edición en la vista de nota completa
    editFullNoteButton.addEventListener('click', enableEditMode);

    // Guarda los cambios de la nota editada
    saveEditButton.addEventListener('click', saveEditedNote);

    // Elimina la nota actual desde la vista de pantalla completa
    deleteFullNoteButton.addEventListener('click', () => {
        if (currentNoteId) {
            deleteNote(currentNoteId);
        }
    });

    // Carga las notas al iniciar la aplicación
    loadNotes();
});