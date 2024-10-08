const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

let productos = [];
let cantidadMostrados = 9;

fetch("./js/productos.json")
    .then(response => response.json())
    .then(data => {
        productos = data;
        mostrarProductos(productos.slice(0, cantidadMostrados));
    })

const divisa = '€';
const contenedorProductos = document.querySelector("#productos");
const carritoVacio = document.querySelector("#carrito-vacio");
const carritoProductos = document.querySelector("#carrito-productos");
const carritoTotal = document.querySelector("#carrito-total");
const vaciarCarrito = document.querySelector("#vaciar-carrito");
const irAlCarrito = document.querySelector("#ir-al-carrito");
const botonMostrarMas = document.createElement("button");
botonMostrarMas.innerText = "Mostrar más";
botonMostrarMas.classList.add("producto-btn");

document.querySelector("#contenedor-boton").append(botonMostrarMas);

botonMostrarMas.addEventListener("click", () => {
    const siguienteLote = productos.slice(cantidadMostrados, cantidadMostrados + 3);
    mostrarProductos(siguienteLote);
    cantidadMostrados += 3; 

    if (cantidadMostrados >= productos.length) {
        botonMostrarMas.style.display = "none"; 
    }
});

function mostrarProductos(productosAmostrar) {
    productosAmostrar.forEach((producto) => {
        let div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
            <img class="producto-img" src="${producto.img}" alt="">
            <h3>${producto.titulo}</h3>
            <p>€${producto.precio}</p>
            <p>SKU ${producto.id}</p>
        `;

        let button = document.createElement("button");
        button.classList.add("producto-btn");
        button.innerText = "Agregar al carrito";
        button.addEventListener("click", () => {
            agregarAlCarrito(producto);
        });

        let buttonDetalles = document.createElement("button"); 
        buttonDetalles.classList.add("producto-btn");
        buttonDetalles.innerText = "Detalles";
        buttonDetalles.addEventListener("click", () => {
            mostrarDetalles(producto); 
        });

        div.append(button);
        div.append(buttonDetalles); 
        contenedorProductos.append(div);
    });
}

function mostrarDetalles(producto) {
    
    document.getElementById("modal-imagen").src = producto.img; 
    document.getElementById("modal-titulo").innerText = producto.titulo;
    document.getElementById("modal-descripcion").innerText = producto.descripcion || 'Descripcion no disponible';
    document.getElementById("modal-precio").innerText = `Precio: €${producto.precio}`;
    document.getElementById("modal-sku").innerText = `SKU: ${producto.id}`;

    
    const modal = document.getElementById("modal");
    modal.style.display = "block";

    
    const closeButton = document.querySelector(".close-button");

    closeButton.onclick = function() {
        modal.style.display = "none";
    }

   
   window.onclick = function(event) {
       if (event.target === modal) {
           modal.style.display = "none";
       }
   }
}

const agregarAlCarrito = (producto) => {
    const indice = carrito.findIndex(item => item.producto.id === producto.id);

    if (indice !== -1) {
        carrito[indice].cantidad++;
    } else {
        carrito.push({ producto, cantidad: 1 });
    }

    actualizarCarrito();

    Toastify({
        text: producto.titulo + " agregado",
        avatar: producto.img,
        duration: 1500,
        close: true,
        className: "toast-agregar",
        style: {
          background: "var(--clr-secundary)",
          color: "var(--clr-black)"
        },
      }).showToast();
}

function actualizarCarrito() {
    if (carrito.length === 0) {
        carritoVacio.classList.remove("d-none");
        carritoProductos.classList.add("d-none");
        vaciarCarrito.classList.add("d-none");
        irAlCarrito.classList.add("d-none");
    } else {
        carritoVacio.classList.add("d-none");
        carritoProductos.classList.remove("d-none");
        vaciarCarrito.classList.remove("d-none");
        irAlCarrito.classList.remove("d-none");

        carritoProductos.innerHTML = "";

        carrito.forEach(({ producto, cantidad }) => {
            let div = document.createElement("div");
            div.classList.add("carrito-producto");
            div.innerHTML = `
                 <img class="producto-img" src="${producto.img}" alt="${producto.titulo}" style="width: 50px; height: auto;">
                <h3>${producto.titulo}</h3>
                <p>${producto.id}</p>
                <p>€${producto.precio} x ${cantidad}</p>
            `;

            let button = document.createElement("button");
            button.classList.add("carrito-producto-btn");
            button.innerText = "❌";
            button.addEventListener("click", () => {
                borrarDelCarrito(producto);
            });

            div.append(button);
            carritoProductos.append(div);
        });

        let button = document.createElement("button");
        button.classList.add("btn-whatsapp");
        button.innerText = 'Enviar por WhatsApp';
        button.addEventListener('click', enviarPorWhatsApp);

        carritoProductos.append(button);
    }

    actualizarTotal();

    localStorage.setItem("carrito", JSON.stringify(carrito));
}
actualizarCarrito();

function borrarDelCarrito(producto) {
    const indice = carrito.findIndex(item => item.producto.id === producto.id);

    if (indice !== -1) {
        if (carrito[indice].cantidad > 1) {
            carrito[indice].cantidad--;
        } else {
            carrito.splice(indice, 1);
        }

        actualizarCarrito();
    }
}

function actualizarTotal() {
    const total = carrito.reduce((acc, { producto, cantidad }) => acc + (producto.precio * cantidad), 0);
    carritoTotal.innerText = divisa + total;
}


function enviarPorWhatsApp() {
    if (carrito.length === 0) return;
 
    let mensaje = 'Contenido de mi pedido:\n\n';
    let totalPedido = 0;
 
    for (let { producto, cantidad } of carrito) {
        mensaje += `${producto.titulo} codigo ${producto.id}: €${producto.precio} x ${cantidad} \n`;
        totalPedido += producto.precio * cantidad;
    }
 
    mensaje += `\nTotal: ${divisa}${totalPedido}`;
 
    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://api.whatsapp.com/send?text=${mensajeCodificado}`;
    window.open(urlWhatsApp, '_blank');
 }

 vaciarCarrito.addEventListener("click", () => {
    const cantidadTotal = carrito.reduce((acc, prod) => acc + prod.cantidad, 0);
    Swal.fire({
        title: "¿Seguro querés vaciar el carrito?",
        text: "Se van a borrar " + cantidadTotal + " productos.",
        icon: "question",
        showDenyButton: true,
        denyButtonText: "No",
        confirmButtonText: "Sí"
      }).then((result) => {
        if (result.isConfirmed) {
            carrito.length = 0;
            actualizarCarrito();
            Swal.fire({
                icon: "success",
                title: "Carrito vaciado",
                showConfirmButton: false,
                timer: 1500
            });
        }
      })
})