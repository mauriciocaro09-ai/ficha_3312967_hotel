// ============================================
// SISTEMA DE NOTIFICACIONES
// ============================================

// Contenedor de notificaciones
let notificationContainer = null;

// Inicializar el contenedor de notificaciones
function initNotifications() {
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        // Agregar estilos si no existen
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-width: 400px;
                }
                
                .notification {
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    animation: slideIn 0.3s ease-out;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                
                .notification.success {
                    background-color: #d4edda;
                    border-left: 4px solid #28a745;
                    color: #155724;
                }
                
                .notification.error {
                    background-color: #f8d7da;
                    border-left: 4px solid #dc3545;
                    color: #721c24;
                }
                
                .notification.warning {
                    background-color: #fff3cd;
                    border-left: 4px solid #ffc107;
                    color: #856404;
                }
                
                .notification.info {
                    background-color: #d1ecf1;
                    border-left: 4px solid #17a2b8;
                    color: #0c5460;
                }
                
                .notification-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }
                
                .notification-content {
                    flex-grow: 1;
                }
                
                .notification-title {
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                
                .notification-message {
                    font-size: 14px;
                    opacity: 0.9;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    opacity: 0.5;
                    transition: opacity 0.2s;
                    padding: 0;
                    line-height: 1;
                }
                
                .notification-close:hover {
                    opacity: 1;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }
}

// Mostrar notificación
function showNotification(options) {
    initNotifications();
    
    const {
        type = 'info',
        title = '',
        message = '',
        duration = 5000,
        closable = true
    } = options;
    
    // Iconos según el tipo
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
        <span class="notification-icon">${icons[type]}</span>
        <div class="notification-content">
            ${title ? `<div class="notification-title">${title}</div>` : ''}
            ${message ? `<div class="notification-message">${message}</div>` : ''}
        </div>
        ${closable ? '<button class="notification-close">&times;</button>' : ''}
    `;
    
    // Agregar al contenedor
    notificationContainer.appendChild(notification);
    
    // Configurar cierre
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeNotification(notification));
    }
    
    // Auto-cerrar después del tiempo especificado
    if (duration > 0) {
        setTimeout(() => closeNotification(notification), duration);
    }
    
    return notification;
}

// Cerrar notificación
function closeNotification(notification) {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Notificación de éxito
function showSuccess(message, title = 'Éxito') {
    return showNotification({
        type: 'success',
        title: title,
        message: message
    });
}

// Notificación de error
function showError(message, title = 'Error') {
    return showNotification({
        type: 'error',
        title: title,
        message: message,
        duration: 7000
    });
}

// Notificación de advertencia
function showWarning(message, title = 'Advertencia') {
    return showNotification({
        type: 'warning',
        title: title,
        message: message
    });
}

// Notificación informativa
function showInfo(message, title = 'Información') {
    return showNotification({
        type: 'info',
        title: title,
        message: message
    });
}

// Confirmación con callback
function showConfirm(message, onConfirm, onCancel, title = 'Confirmar') {
    initNotifications();
    
    const notification = document.createElement('div');
    notification.className = 'notification warning';
    
    notification.innerHTML = `
        <span class="notification-icon">?</span>
        <div class="notification-content">
            ${title ? `<div class="notification-title">${title}</div>` : ''}
            <div class="notification-message">${message}</div>
            <div style="margin-top: 10px; display: flex; gap: 10px;">
                <button class="confirm-btn" style="padding: 5px 15px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Confirmar</button>
                <button class="cancel-btn" style="padding: 5px 15px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancelar</button>
            </div>
        </div>
    `;
    
    notificationContainer.appendChild(notification);
    
    const confirmBtn = notification.querySelector('.confirm-btn');
    const cancelBtn = notification.querySelector('.cancel-btn');
    
    confirmBtn.addEventListener('click', () => {
        closeNotification(notification);
        if (onConfirm) onConfirm();
    });
    
    cancelBtn.addEventListener('click', () => {
        closeNotification(notification);
        if (onCancel) onCancel();
    });
    
    return notification;
}

// Limpiar todas las notificaciones
function clearAllNotifications() {
    if (notificationContainer) {
        notificationContainer.innerHTML = '';
    }
}

function confirmarAccion(mensaje, titulo = '¿Confirmar acción?') {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:20000;display:flex;align-items:center;justify-content:center;';
        const card = document.createElement('div');
        card.style.cssText = 'background:#1e2229;color:#f1f5f9;border-radius:14px;padding:28px 28px 22px;max-width:380px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.5);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;';
        card.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                <span style="width:36px;height:36px;border-radius:50%;background:#f59e0b;display:inline-flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#fff;flex-shrink:0;">!</span>
                <span style="font-weight:700;font-size:15px;color:#f8fafc;">${titulo}</span>
            </div>
            <p style="margin:0 0 22px 48px;font-size:14px;color:#94a3b8;line-height:1.5;">${mensaje}</p>
            <div style="display:flex;gap:10px;justify-content:flex-end;">
                <button id="_confirm-cancel" style="padding:9px 20px;border-radius:8px;border:1px solid #334155;background:transparent;color:#94a3b8;font-size:14px;font-weight:600;cursor:pointer;">Cancelar</button>
                <button id="_confirm-ok" style="padding:9px 20px;border-radius:8px;border:none;background:#ef4444;color:#fff;font-size:14px;font-weight:600;cursor:pointer;">Confirmar</button>
            </div>`;
        overlay.appendChild(card);
        document.body.appendChild(overlay);
        const close = (result) => { document.body.removeChild(overlay); resolve(result); };
        card.querySelector('#_confirm-ok').addEventListener('click', () => close(true));
        card.querySelector('#_confirm-cancel').addEventListener('click', () => close(false));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
    });
}

// Exportar funciones
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initNotifications,
        showNotification,
        closeNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
        clearAllNotifications
    };
}
