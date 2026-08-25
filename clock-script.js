// Zona horaria local por defecto
const DEFAULT_TIMEZONE = 'America/New_York';

// Objeto para almacenar los relojes activos
const activeClocks = new Map();

// DOM Elements
const timezoneSelect = document.getElementById('timezone-select');
const addTimezoneBtn = document.getElementById('add-timezone-btn');
const clocksContainer = document.getElementById('clocks-container');

// Event Listeners
addTimezoneBtn.addEventListener('click', addClock);
timezoneSelect.addEventListener('change', handleSelectChange);
timezoneSelect.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && timezoneSelect.value) {
        addClock();
    }
});

// Cargar zona horaria local al iniciar
window.addEventListener('load', () => {
    try {
        const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        addClockToMap(localTimezone, true);
        updateAllClocks();
        setInterval(updateAllClocks, 1000);
    } catch (error) {
        console.error('Error getting local timezone:', error);
        addClockToMap(DEFAULT_TIMEZONE, true);
        updateAllClocks();
        setInterval(updateAllClocks, 1000);
    }
});

// Obtener información de la zona horaria y mostrar reloj
function addClock() {
    const timezone = timezoneSelect.value;
    
    if (!timezone) {
        alert('Por favor selecciona una zona horaria');
        return;
    }

    if (activeClocks.has(timezone)) {
        alert('Esta zona horaria ya está siendo mostrada');
        return;
    }

    addClockToMap(timezone);
    timezoneSelect.value = '';
    updateAllClocks();
}

// Agregar reloj al mapa
function addClockToMap(timezone, isLocal = false) {
    activeClocks.set(timezone, {
        isLocal: isLocal,
        element: null
    });
}

// Actualizar todos los relojes
function updateAllClocks() {
    // Si no hay relojes activos, mostrar mensaje vacío
    if (activeClocks.size === 0) {
        clocksContainer.innerHTML = `
            <div class="empty-state">
                <h2>📭 No hay zonas horarias</h2>
                <p>Selecciona una zona horaria para ver la hora actual</p>
            </div>
        `;
        return;
    }

    // Actualizar cada reloj
    activeClocks.forEach((clock, timezone) => {
        const timeData = getTimeInTimezone(timezone);

        if (!clock.element) {
            // Crear elemento si no existe
            clock.element = createClockElement(timezone, timeData);
            clocksContainer.appendChild(clock.element);
        } else {
            // Actualizar elemento existente
            updateClockElement(clock.element, timeData);
        }
    });
}

// Crear elemento del reloj
function createClockElement(timezone, timeData) {
    const div = document.createElement('div');
    div.className = 'clock-card';
    div.dataset.timezone = timezone;

    const localLabel = activeClocks.get(timezone).isLocal ? ' (Hora Local)' : '';

    div.innerHTML = `
        <div class="clock-title">${timezone.split('/')[1] || timezone}${localLabel}</div>
        <div class="clock-timezone">${timezone}</div>
        <div class="digital-display">${timeData.time}</div>
        <div class="time-details">
            <div class="detail-item">
                <div class="detail-label">Fecha</div>
                <div class="detail-value">${timeData.date}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Día</div>
                <div class="detail-value">${timeData.day}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Zona Horaria</div>
                <div class="detail-value">${timeData.abbreviation}</div>
            </div>
            <div class="detail-item">
                <div class="detail-label">UTC Offset</div>
                <div class="detail-value">${timeData.offset}</div>
            </div>
        </div>
        <button class="btn btn-remove" data-timezone="${timezone}">🗑️ Eliminar</button>
    `;

    // Event listener para eliminar
    div.querySelector('.btn-remove').addEventListener('click', () => {
        removeClock(timezone);
    });

    return div;
}

// Actualizar elemento del reloj
function updateClockElement(element, timeData) {
    element.querySelector('.digital-display').textContent = timeData.time;
    
    const details = element.querySelectorAll('.detail-value');
    details[0].textContent = timeData.date;
    details[1].textContent = timeData.day;
    details[2].textContent = timeData.abbreviation;
    details[3].textContent = timeData.offset;
}

// Obtener hora en una zona horaria específica
function getTimeInTimezone(timezone) {
    const now = new Date();

    // Obtener la hora en la zona horaria especificada
    const formatter = new Intl.DateTimeFormat('es-ES', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        weekday: 'long'
    });

    const parts = formatter.formatToParts(now);
    const partMap = {};

    parts.forEach(part => {
        partMap[part.type] = part.value;
    });

    // Formatear hora digital
    const time = `${padZero(partMap.hour)}:${padZero(partMap.minute)}:${padZero(partMap.second)}`;

    // Formatear fecha
    const date = `${padZero(partMap.day)}/${padZero(partMap.month)}/${partMap.year}`;

    // Día de la semana
    const day = partMap.weekday.charAt(0).toUpperCase() + partMap.weekday.slice(1);

    // Obtener abreviatura de zona horaria y offset
    const tzInfo = getTZInfo(timezone, now);

    return {
        time,
        date,
        day,
        abbreviation: tzInfo.abbreviation,
        offset: tzInfo.offset
    };
}

// Obtener información de la zona horaria
function getTZInfo(timezone, date) {
    try {
        // Crear dos formatos: uno con y otro sin especificar zona horaria
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'short'
        });

        const parts = formatter.formatToParts(date);
        const tzPart = parts.find(p => p.type === 'timeZoneName');
        const abbreviation = tzPart ? tzPart.value : 'UTC';

        // Calcular offset
        const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
        const offset = (utcDate - tzDate) / (1000 * 60 * 60);
        
        const sign = offset > 0 ? '-' : '+';
        const hours = Math.abs(Math.floor(offset));
        const minutes = Math.abs((offset % 1) * 60);

        const offsetStr = `UTC${sign}${padZero(hours)}:${padZero(minutes)}`;

        return {
            abbreviation,
            offset: offsetStr
        };
    } catch (error) {
        return {
            abbreviation: 'TZ',
            offset: 'UTC±00:00'
        };
    }
}

// Eliminar un reloj
function removeClock(timezone) {
    activeClocks.delete(timezone);
    const element = document.querySelector(`[data-timezone="${timezone}"]`);
    if (element) {
        element.style.animation = 'popOut 0.3s ease-out';
        setTimeout(() => {
            element.remove();
            updateAllClocks();
        }, 300);
    }
}

// Manejar cambio de selección
function handleSelectChange() {
    // Este evento se maneja en addClock()
}

// Función auxiliar para agregar ceros
function padZero(num) {
    return String(num).padStart(2, '0');
}

// Animación de salida
const style = document.createElement('style');
style.textContent = `
    @keyframes popOut {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.9);
        }
    }
`;
document.head.appendChild(style);
