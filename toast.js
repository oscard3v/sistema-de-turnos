/**
 * Sistema de notificaciones toast
 * Muestra mensajes temporales en la esquina inferior derecha de la pantalla
 */

const TOAST_DURATION = 3000; // Duración en milisegundos
const TOAST_ANIMATION_DURATION = 300; // Duración de la animación en milisegundos

// Tipos de toast y sus clases CSS correspondientes
const TOAST_TYPES = {
    success: {
        bgColor: 'bg-green-500',
        textColor: 'text-white'
    },
    error: {
        bgColor: 'bg-red-500',
        textColor: 'text-white'
    },
    info: {
        bgColor: 'bg-blue-500',
        textColor: 'text-white'
    },
    warning: {
        bgColor: 'bg-yellow-500',
        textColor: 'text-white'
    }
};

/**
 * Muestra una notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de toast (success, error, info, warning)
 */
function showToast(message, type = 'info') {
    if (!message) return;

    const container = document.getElementById('toastContainer');
    if (!container) return;

    // Crear el elemento toast
    const toast = document.createElement('div');
    const toastStyles = TOAST_TYPES[type] || TOAST_TYPES.info;

    // Aplicar clases de Tailwind
    toast.className = `${toastStyles.bgColor} ${toastStyles.textColor} p-4 rounded-lg shadow-lg mb-4 transform translate-x-full transition-transform duration-300 ease-in-out flex items-center`;
    
    // Agregar el mensaje
    toast.innerHTML = `
        <div class="flex-grow">${message}</div>
        <button class="ml-4 hover:opacity-75" onclick="this.parentElement.remove()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
    `;

    // Agregar al contenedor
    container.appendChild(toast);

    // Animar entrada
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);

    // Configurar eliminación automática
    setTimeout(() => {
        // Animar salida
        toast.classList.add('translate-x-full');
        
        // Eliminar después de la animación
        setTimeout(() => {
            if (toast && toast.parentElement) {
                toast.remove();
            }
        }, TOAST_ANIMATION_DURATION);
    }, TOAST_DURATION);
}

/**
 * Variantes de la función showToast para diferentes tipos de mensajes
 */
function showSuccessToast(message) {
    showToast(message, 'success');
}

function showErrorToast(message) {
    showToast(message, 'error');
}

function showInfoToast(message) {
    showToast(message, 'info');
}

function showWarningToast(message) {
    showToast(message, 'warning');
}
