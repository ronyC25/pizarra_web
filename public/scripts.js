document.addEventListener('DOMContentLoaded', () => {
    const userNameElement = document.getElementById('userName');
    const token = localStorage.getItem('token');

    if (token) {
        const user = parseJwt(token);
        const userName = user.nombre;
        const userRole = user.rol;

        if (userNameElement) {
            userNameElement.textContent = userName || 'Usuario';
        }

        if (userRole === 'docente' && window.location.pathname !== '/docente.html') {
            window.location.href = 'docente.html';
        } else if (userRole === 'alumno' && window.location.pathname !== '/alumno.html') {
            window.location.href = 'alumno.html';
        }
    } else if (window.location.pathname !== '/login.html' && window.location.pathname !== '/register.html') {
        // Redirigir al login si no hay token y no estamos en login.html o register.html
        window.location.href = 'login.html';
    }

    // Añadir listener para el botón de logout
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('nombre');
            window.location.href = 'login.html';
        });
    }
});

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        return null;
    }
}
