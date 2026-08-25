// Configuración de WhatsApp - Guardar número en localStorage
const WHATSAPP_STORAGE_KEY = 'tiendaropa_whatsapp_number';
const DEFAULT_WHATSAPP = '+573001234567'; // Cambia esto con tu número

// DOM Elements
const orderForm = document.getElementById('order-form');
const configModal = document.getElementById('config-modal');
const configBtn = document.getElementById('config-btn');
const closeModalBtn = document.querySelector('.close-modal');
const whatsappNumberInput = document.getElementById('whatsapp-number');
const saveConfigBtn = document.getElementById('save-config');
const displayPhoneBtn = document.getElementById('display-phone');
const directWhatsappBtn = document.getElementById('direct-whatsapp');

// Inicializar
window.addEventListener('load', () => {
    loadWhatsappNumber();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    configBtn.addEventListener('click', openConfigModal);
    closeModalBtn.addEventListener('click', closeConfigModal);
    saveConfigBtn.addEventListener('click', saveWhatsappNumber);
    orderForm.addEventListener('submit', handleFormSubmit);
    directWhatsappBtn.addEventListener('click', openDirectWhatsapp);

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === configModal) {
            closeConfigModal();
        }
    });
}

// Cargar número de WhatsApp guardado
function loadWhatsappNumber() {
    const savedNumber = localStorage.getItem(WHATSAPP_STORAGE_KEY);
    const whatsappNumber = savedNumber || DEFAULT_WHATSAPP;
    
    displayPhoneBtn.textContent = whatsappNumber;
    whatsappNumberInput.value = whatsappNumber;
    
    updateWhatsappLinks(whatsappNumber);
}

// Guardar número de WhatsApp
function saveWhatsappNumber() {
    const number = whatsappNumberInput.value.trim();

    if (!number) {
        alert('Por favor ingresa un número de WhatsApp');
        return;
    }

    if (!isValidWhatsappNumber(number)) {
        alert('Formato inválido. Usa: +[código][número]\nEjemplo: +573001234567');
        return;
    }

    localStorage.setItem(WHATSAPP_STORAGE_KEY, number);
    displayPhoneBtn.textContent = number;
    updateWhatsappLinks(number);
    closeConfigModal();
    alert('✅ Número de WhatsApp actualizado correctamente');
}

// Validar formato del número
function isValidWhatsappNumber(number) {
    // Validar que empiece con + y tenga entre 10-15 dígitos
    return /^\+\d{10,15}$/.test(number);
}

// Abrir modal de configuración
function openConfigModal() {
    configModal.style.display = 'block';
    whatsappNumberInput.focus();
}

// Cerrar modal de configuración
function closeConfigModal() {
    configModal.style.display = 'none';
}

// Actualizar links de WhatsApp
function updateWhatsappLinks(whatsappNumber) {
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}`;
    directWhatsappBtn.href = whatsappUrl;
}

// Abrir WhatsApp directo
function openDirectWhatsapp(e) {
    e.preventDefault();
    const message = encodeURIComponent('¡Hola! Me gustaría saber más sobre sus productos. 👕👔');
    const whatsappNumber = displayPhoneBtn.textContent;
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
}

// Manejar envío del formulario
function handleFormSubmit(e) {
    e.preventDefault();

    // Recopilar datos del formulario
    const formData = {
        name: document.getElementById('customer-name').value.trim(),
        phone: document.getElementById('customer-phone').value.trim(),
        email: document.getElementById('customer-email').value.trim(),
        productType: document.getElementById('product-type').value,
        description: document.getElementById('product-description').value.trim(),
        size: document.getElementById('size').value || 'No especificada',
        quantity: document.getElementById('quantity').value,
        deliveryType: document.getElementById('delivery-type').value,
        address: document.getElementById('delivery-address').value.trim(),
        specialRequests: document.getElementById('special-requests').value.trim()
    };

    // Validar datos
    if (!validateFormData(formData)) {
        return;
    }

    // Crear mensaje de WhatsApp
    const whatsappMessage = generateWhatsappMessage(formData);

    // Abrir WhatsApp
    sendOrderToWhatsapp(whatsappMessage);

    // Resetear formulario
    orderForm.reset();
}

// Validar datos del formulario
function validateFormData(data) {
    if (!data.name || data.name.length < 3) {
        alert('❌ El nombre debe tener al menos 3 caracteres');
        return false;
    }

    if (!data.phone || !isValidPhone(data.phone)) {
        alert('❌ Número de teléfono inválido. Usa formato: +573001234567');
        return false;
    }

    if (!data.email || !isValidEmail(data.email)) {
        alert('❌ Correo electrónico inválido');
        return false;
    }

    if (!data.productType) {
        alert('❌ Selecciona un tipo de prenda');
        return false;
    }

    if (!data.description || data.description.length < 5) {
        alert('❌ La descripción debe tener al menos 5 caracteres');
        return false;
    }

    if (!data.quantity || data.quantity < 1) {
        alert('❌ La cantidad debe ser mayor a 0');
        return false;
    }

    if (!data.deliveryType) {
        alert('❌ Selecciona un tipo de entrega');
        return false;
    }

    return true;
}

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validar teléfono
function isValidPhone(phone) {
    return /^\+\d{10,15}$/.test(phone);
}

// Generar mensaje para WhatsApp
function generateWhatsappMessage(data) {
    const timestamp = new Date().toLocaleString('es-ES');
    
    let message = `
🛍️ *NUEVO PEDIDO RECIBIDO*

👤 *DATOS PERSONALES*
Nombre: ${data.name}
Teléfono: ${data.phone}
Email: ${data.email}

👕 *DETALLES DEL PEDIDO*
Tipo de Prenda: ${data.productType}
Descripción: ${data.description}
Talla: ${data.size}
Cantidad: ${data.quantity}

🚚 *ENTREGA*
Tipo: ${data.deliveryType}
Dirección: ${data.address || 'No especificada'}

📝 *SOLICITUDES ESPECIALES*
${data.specialRequests || 'Ninguna'}

⏰ Fecha/Hora: ${timestamp}

---
¿Puedo proceder con este pedido?
`;

    return message.trim();
}

// Enviar pedido por WhatsApp
function sendOrderToWhatsapp(message) {
    const whatsappNumber = displayPhoneBtn.textContent;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodedMessage}`;

    // Mostrar confirmación
    const confirmSend = confirm(
        '✅ Se abrirá WhatsApp con el resumen de tu pedido.\n\n¿Deseas continuar?'
    );

    if (confirmSend) {
        window.open(whatsappUrl, '_blank');
    }
}

// Event listener para Enter en el input del modal
whatsappNumberInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveWhatsappNumber();
    }
});

// Permitir solo números y + en el input de teléfono
document.getElementById('customer-phone').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9+]/g, '');
});

// Permitir solo números en cantidad
document.getElementById('quantity').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

// Permitir solo números y + en input de WhatsApp del modal
whatsappNumberInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9+]/g, '');
});

console.log('✅ Sistema de pedidos por WhatsApp cargado correctamente');
console.log(`📞 Número actual: ${displayPhoneBtn.textContent}`);
