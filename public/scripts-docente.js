document.addEventListener('DOMContentLoaded', () => {
    const socket = io("http://localhost:4000");
    const userNameElement = document.getElementById('userName');
    const userName = localStorage.getItem('nombre');
    if (userName) {
        userNameElement.textContent = userName;
    } else {
        window.location.href = 'login.html';
    }

    const token = localStorage.getItem('token');
    const userId = parseJwt(token).id;
    const boardList = document.getElementById('boardList');
    let formSubmitting = false;

    const fetchBoards = async () => {
        const response = await fetch('http://localhost:4000/api/boards');
        const boards = await response.json();
        boardList.innerHTML = '';
        boards.forEach(board => {
            if (board.id_docente === userId) {
                const boardCard = document.createElement('div');
                boardCard.classList.add('board-card');
                boardCard.innerHTML = `
                    <h4>${board.nombre}</h4>
                    <a href="pizarra.html?id=${board.id}" class="btn-open"><i class="fas fa-chalkboard"></i> Abrir Pizarra</a>
                    <button class="btn-delete" onclick="deleteBoard(${board.id})"><i class="fas fa-trash-alt"></i> Eliminar</button>
                `;
                boardCard.dataset.id = board.id;
                boardList.appendChild(boardCard);
            }
        });
    };

    const createBoardForm = document.getElementById('createBoardForm');
    createBoardForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (formSubmitting) return;
        formSubmitting = true;

        const boardName = document.getElementById('boardName').value;
        const response = await fetch('http://localhost:4000/api/boards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nombre: boardName, id_docente: userId })
        });

        const data = await response.json();
        if (response.ok) {
            socket.emit('createBoard', { nombre: boardName, id_docente: userId, id: data.id });
        } else {
            alert(data.message);
        }

        formSubmitting = false;
    });

    window.deleteBoard = async (boardId) => {
        const response = await fetch(`http://localhost:4000/api/boards/${boardId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            socket.emit('deleteBoard', boardId);
        } else {
            alert(data.message);
        }
    };

    socket.on('boardCreated', (board) => {
        if (board.id_docente === userId) {
            const boardCard = document.createElement('div');
            boardCard.classList.add('board-card');
            boardCard.innerHTML = `
                <h4>${board.nombre}</h4>
                <a href="pizarra.html?id=${board.id}" class="btn-open"><i class="fas fa-chalkboard"></i> Abrir Pizarra</a>
                <button class="btn-delete" onclick="deleteBoard(${board.id})"><i class="fas fa-trash-alt"></i> Eliminar</button>
            `;
            boardCard.dataset.id = board.id;
            boardList.appendChild(boardCard);
        }
    });

    socket.on('boardDeleted', (boardId) => {
        const boardCard = document.querySelector(`.board-card[data-id='${boardId}']`);
        if (boardCard) {
            boardCard.remove();
        }
    });

    fetchBoards();
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
