document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const boardId = urlParams.get('id');
    const boardNameElement = document.getElementById('boardName');
    const userNameElement = document.getElementById('userName');

    const userName = localStorage.getItem('nombre');
    const userRole = localStorage.getItem('rol');

    if (userName) {
        userNameElement.textContent = userName;
    } else {
        window.location.href = 'login.html';
    }

    fetch(`http://localhost:4000/api/boards/${boardId}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                boardNameElement.textContent = data[0].nombre;
            } else {
                boardNameElement.textContent = 'Pizarra no encontrada';
            }
        })
        .catch(error => {
            console.error('Error fetching board:', error);
            boardNameElement.textContent = 'Error al cargar la pizarra';
        });

    const socket = io("http://localhost:4000");
    const canvas = document.getElementById('boardCanvas');
    const context = canvas.getContext('2d');
    
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - document.querySelector('.menu').offsetHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    fetch(`http://localhost:4000/api/boards/content/${boardId}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.contenido) {
                const img = new Image();
                img.src = data.contenido;
                img.onload = () => {
                    context.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
            }
        })
        .catch(error => console.error('Error fetching board content:', error));

    let drawing = false;
    let current = { x: 0, y: 0 };
    let color = "#007bff";
    let tool = "pencil";

    const getMousePos = (canvas, event) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    };

    const startDrawing = (e) => {
        drawing = true;
        const pos = getMousePos(canvas, e);
        current.x = pos.x;
        current.y = pos.y;
    };

    const endDrawing = (e) => {
        if (!drawing) return;
        drawing = false;
        const pos = getMousePos(canvas, e);
        drawShape(current.x, current.y, pos.x, pos.y, color, tool);
        socket.emit('drawing', { x0: current.x, y0: current.y, x1: pos.x, y1: pos.y, boardId, user: userName, color: color, tool: tool });
    };

    const draw = (e) => {
        if (!drawing || tool !== "pencil") return;
        const pos = getMousePos(canvas, e);
        context.lineWidth = 5;
        context.lineCap = 'round';
        context.strokeStyle = color;

        context.beginPath();
        context.moveTo(current.x, current.y);
        context.lineTo(pos.x, pos.y);
        context.stroke();
        context.closePath();

        socket.emit('drawing', { x0: current.x, y0: current.y, x1: pos.x, y1: pos.y, boardId, user: userName, color: color, tool: tool });

        current.x = pos.x;
        current.y = pos.y;
    };

    const drawShape = (x0, y0, x1, y1, color, tool) => {
        context.strokeStyle = color;
        context.fillStyle = color;
        if (tool === "rect") {
            context.strokeRect(x0, y0, x1 - x0, y1 - y0);
        } else if (tool === "circle") {
            context.beginPath();
            const radius = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
            context.arc(x0, y0, radius, 0, 2 * Math.PI);
            context.stroke();
            context.closePath();
        } else if (tool === "line") {
            context.beginPath();
            context.moveTo(x0, y0);
            context.lineTo(x1, y1);
            context.stroke();
            context.closePath();
        }
    };

    const showUserLabel = (data) => {
        const canvasRect = canvas.getBoundingClientRect();
        const userLabel = document.createElement('div');
        userLabel.textContent = data.user;
        userLabel.style.position = 'absolute';
        userLabel.style.left = `${canvasRect.left + data.x1}px`;
        userLabel.style.top = `${canvasRect.top + data.y1}px`;
        userLabel.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        userLabel.style.padding = '2px 5px';
        userLabel.style.border = '1px solid #007bff';
        userLabel.style.borderRadius = '5px';
        userLabel.style.fontSize = '12px';
        userLabel.style.transform = 'translate(-50%, -100%)';
        userLabel.style.pointerEvents = 'none';

        document.body.appendChild(userLabel);

        setTimeout(() => {
            userLabel.remove();
        }, 1000);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', endDrawing);
    canvas.addEventListener('mousemove', draw);

    socket.on('drawing', (data) => {
        if (data.boardId === boardId) {
            context.lineWidth = 5;
            context.lineCap = 'round';
            context.strokeStyle = data.color;

            if (data.tool === "pencil") {
                context.beginPath();
                context.moveTo(data.x0, data.y0);
                context.lineTo(data.x1, data.y1);
                context.stroke();
                context.closePath();
            } else {
                drawShape(data.x0, data.y0, data.x1, data.y1, data.color, data.tool);
            }

            showUserLabel(data);
        }
    });

    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('nombre');
        window.location.href = 'login.html';
    });

    if (userRole === 'docente') {
        const saveButton = document.createElement('button');
        saveButton.textContent = "Guardar";
        saveButton.classList.add('tool-button');
        saveButton.id = "saveButton";
        document.querySelector('.tools').appendChild(saveButton);

        saveButton.addEventListener('click', () => {
            const dataURL = canvas.toDataURL();
            fetch('http://localhost:4000/api/boards/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ id_pizarra: boardId, contenido: dataURL })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
            })
            .catch(error => console.error('Error saving board content:', error));
        });
    }

    const updateActiveTool = (selectedTool) => {
        document.querySelectorAll('.tool-button').forEach(button => {
            button.classList.remove('active');
        });
        document.getElementById(selectedTool).classList.add('active');
    };

    document.getElementById('colorPicker').addEventListener('change', (e) => {
        color = e.target.value;
        tool = "pencil";
        updateActiveTool('colorPicker');
    });

    document.getElementById('eraserButton').addEventListener('click', () => {
        color = "#ffffff";
        tool = "pencil";
        updateActiveTool('eraserButton');
    });

    document.getElementById('rectButton').addEventListener('click', () => {
        tool = "rect";
        updateActiveTool('rectButton');
    });

    document.getElementById('circleButton').addEventListener('click', () => {
        tool = "circle";
        updateActiveTool('circleButton');
    });

    document.getElementById('lineButton').addEventListener('click', () => {
        tool = "line";
        updateActiveTool('lineButton');
    });
});
