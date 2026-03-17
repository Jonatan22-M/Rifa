// Variables Globales
const TOTAL_NUMEROS = 100;
let baseDatos = JSON.parse(localStorage.getItem('rifa_jeffery')) || {};
let numSeleccionado = null;

const grid = document.getElementById('grid');
const inputNombre = document.getElementById('fullName');
const inputPhone = document.getElementById('phone');
const inputNumDisplay = document.getElementById('selectedNum');
const winnerBox = document.getElementById('winnerBox');

function renderGrid() {
    grid.innerHTML = '';
    for (let i = 1; i <= TOTAL_NUMEROS; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        btn.className = 'num-btn' + (baseDatos[i] ? ' occupied' : '');
        
        btn.onclick = () => {
            if (baseDatos[i]) {
                alert(`Este número ya es de: ${baseDatos[i].nombre}`);
                return;
            }
            document.querySelectorAll('.num-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            numSeleccionado = i;
            inputNumDisplay.value = i;
        };
        grid.appendChild(btn);
    }
}

// Registro
document.getElementById('btnRegister').onclick = () => {
    const nombre = inputNombre.value.trim();
    const tel = inputPhone.value.trim();
    if (!nombre || !tel || !numSeleccionado) return alert("Llena todos los campos.");

    baseDatos[numSeleccionado] = { nombre, telefono: tel };
    localStorage.setItem('rifa_jeffery', JSON.stringify(baseDatos));
    
    alert(`¡Éxito! Número ${numSeleccionado} registrado.`);
    inputNombre.value = ""; inputPhone.value = ""; inputNumDisplay.value = "";
    numSeleccionado = null;
    renderGrid();
};

// --- Lógica de Sorteo de 3 Ganadores ---

// Función para obtener un ganador al azar que no haya salido antes
function obtenerGanadorAleatorio(listaParticipantes, excluidos) {
    const disponibles = listaParticipantes.filter(key => !excluidos.includes(key));
    if (disponibles.length === 0) return null;
    return disponibles[Math.floor(Math.random() * disponibles.length)];
}

document.getElementById('btnSortear').onclick = async function() {
    const vendidos = Object.keys(baseDatos);
    if (vendidos.length < 3) return alert("Necesitas al menos 3 números vendidos para este sorteo.");

    winnerBox.style.display = "block";
    winnerBox.innerHTML = "<h3>⏳ Iniciando Gran Sorteo...</h3>";
    
    const ganadoresFinales = [];
    const puestos = ["3er Lugar 🥉", "2do Lugar 🥈", "1er Lugar 🥇 (GRAN GANADOR)"];

    // Sorteamos del 3 al 1
    for (let i = 0; i < 3; i++) {
        const idGanador = obtenerGanadorAleatorio(vendidos, ganadoresFinales);
        ganadoresFinales.push(idGanador);
        
        // Efecto de espera para cada lugar
        await animarSorteo(puestos[i], baseDatos[idGanador], idGanador);
    }
};

// Función que crea la animación y espera a que termine (Promesa)
function animarSorteo(titulo, datosGanador, numero) {
    return new Promise((resolve) => {
        let count = 0;
        const interval = setInterval(() => {
            winnerBox.innerHTML = `<h3>Sorteando ${titulo}...</h3><p>🎲 Seleccionando...</p>`;
            count++;

            if (count > 15) {
                clearInterval(interval);
                // Agregamos el resultado al historial del cuadro
                const anuncio = document.createElement('div');
                anuncio.style.marginBottom = "15px";
                anuncio.innerHTML = `
                    <p style="color: #4f46e5; font-weight: bold; margin:0;">${titulo}</p>
                    <h2 style="margin:5px 0;">🎉 ${datosGanador.nombre}</h2>
                    <small>Boleto: ${numero} | Tel: ${datosGanador.telefono}</small>
                    <hr style="border: 0; border-top: 1px dashed #ccc; margin-top: 10px;">
                `;
                winnerBox.prepend(anuncio); // Ponemos el más reciente arriba
                
                // Pausa de 2 segundos antes del siguiente lugar
                setTimeout(resolve, 2000);
            }
        }, 80);
    });
}

document.getElementById('btnReset').onclick = () => {
    if(confirm("¿Borrar todo?")) {
        localStorage.removeItem('rifa_jeffery');
        baseDatos = {};
        renderGrid();
        winnerBox.style.display = "none";
        winnerBox.innerHTML = "";
    }
};

renderGrid();

document.getElementById('btnSortear').onclick = async function() {
    const vendidos = Object.keys(baseDatos);
    if (vendidos.length < 3) return alert("Necesitas al menos 3 números vendidos.");

    // Resetear podio
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.winner-info').forEach(i => i.innerText = "?");
    winnerBox.style.display = "block";
    
    const ganadoresFinales = [];
    // Orden de aparición: 3ero, luego 2do, luego 1ero
    const ordenAparicion = [3, 2, 1];

    for (let puesto of ordenAparicion) {
        document.getElementById('sorteoStatus').innerText = `Sorteando ${puesto}er Lugar...`;
        
        const idGanador = obtenerGanadorAleatorio(vendidos, ganadoresFinales);
        ganadoresFinales.push(idGanador);
        
        // Animación de espera
        await animarPuesto(puesto, baseDatos[idGanador], idGanador);
    }
    
    document.getElementById('sorteoStatus').innerText = "¡Felicidades a los ganadores! 🏆";
};

function animarPuesto(puesto, datos, numero) {
    return new Promise((resolve) => {
        let count = 0;
        const infoDiv = document.getElementById(`info-${puesto}`);
        const stepDiv = document.getElementById(`puesto-${puesto}`);

        const interval = setInterval(() => {
            infoDiv.innerText = "🎲 ...";
            count++;

            if (count > 20) {
                clearInterval(interval);
                stepDiv.classList.add('active');
                infoDiv.innerHTML = `<span style="color:#111827">${datos.nombre}</span><br><small>#${numero}</small>`;
                setTimeout(resolve, 1500); // Pausa antes del siguiente
            }
        }, 60);
    });
}

// Selección del elemento
const inputTelefono = document.getElementById('phone');

// Validación en tiempo real: Solo permite números
inputTelefono.addEventListener('input', function() {
    // Esta expresión regular elimina cualquier caracter que NO sea un número (0-9)
    this.value = this.value.replace(/[^0-9]/g, '');
});

// Validación extra al intentar registrar
// (Modifica tu función de registro para incluir esta seguridad)
function validarTelefono(tel) {
    if (tel.length !== 10) {
        alert("El número de teléfono debe tener exactamente 10 dígitos.");
        return false;
    }
    return true;
}

document.getElementById('btnRegister').onclick = () => {
    const nombre = inputNombre.value.trim();
    const tel = inputTelefono.value.trim();

    // 1. Validar campos vacíos
    if (!nombre || !tel || !numSeleccionado) {
        return alert("Por favor, completa todos los campos.");
    }

    // 2. Validar que el teléfono tenga 10 números (tu nueva regla)
    if (tel.length < 10) {
        return alert("Por favor ingresa un número de teléfono válido (10 dígitos).");
    }

    // ... (aquí sigue el resto de tu código para guardar en baseDatos)
};
