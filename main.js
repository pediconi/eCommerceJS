/**
 * clases
 *
/*-------------------------------------------------------------------------------------------------------- */

class Producto {

    constructor(id, stock, cantidadEnCarrito, nombre, marca, precio, src, descripcion) {
        this.id = id;
        this.stock = stock;
        this.cantidadEnCarrito = cantidadEnCarrito;
        this.enCarrito = false;
        this.nombre = nombre;
        this.marca = marca;
        this.precio = parseFloat(precio);
        this.src = src;
        this.descripcion = descripcion;
        
    }
    setStock(stock){
        this.stock = stock;
    }

    setEnCarrito(){
        this.enCarrito = true;
    }

    actualizarStock() {
        this.stock = this.stock - 1;
        return this.stock;
    }
}
/*------------------------------------------------------------------------------------------------------- */
class Cliente {

    constructor(dni, nombre, apellido) {
        this.dni = dni;
        this.nombre = nombre;
        this.apellido = apellido;
        this.carrito = [];
    }
}
/*------------------------------------------------------------------------------------------------------- */
export class Ticket {

    constructor(medioDePago, subtotal, envio, total ){  // agregar como un nuevo parametro al cliente
        this.fecha = luxon.DateTime;
        this.subtotal = subtotal;
        this.envio = envio;
        this.total = total;
        this.medioDePago = medioDePago;
    }
}
/****************************************************************************************************************
 * VARIABLES GLOBALES
 */
 let botonPagar = document.getElementById('botonPagar'); // para controlar el uso del boton pagar
 
/*******************************************************************************************************************
 * FUNCION PRINCIPAL, SE ENCARGA DE CONTROLAR EL FLUJO DEL PROGRAMA Y ADMINISTRAR EL CONTENIDO HTML
 */
const tienda = async () => {  // hacerla asincrona para recibir los productos (q vienen de una funcion asincrona, solo otra funcion async puede recibir el resultado de una funcion async)

    goToTop();
    
/*------------------------------------------------------------------------------------------------------------------------*/
//CARGA Y CREACION DE DATOS INICIALES
    let productos = await getProdcutosFromJSON();  // si tienda no es asincrona no resuelve esta promesa 
                                                    // A ESTE PUNTO YA TENGO LOS PRODUCTOS Y PUEDO CONTINUAR EL FLUJO DEL PROGRAMA NORMALMENTE
    let cliente = cargarClienteToHTML(); 

    let popoverCarrito = document.getElementById('botonVerCarrito');
        popoverCarrito.title = 'Ver Carrito';
        $(popoverCarrito).popover()
    
/*---------------------------------------------------------------------------------------------------------------------*/ 
//VERIFICO SI HAY DATOS EN LS Y LOS TRAIGO 

    cargarDatosFromLSToHTML(productos, cliente.carrito);  // productos y variables trabjan por referencia como un puntero a cada array y los cambios en las funciones los afectan fuera de ellas

/*---------------------------------------------------------------------------------------------------------------------*/ 
// CREACION DEL FILTRO DE MARCA
    
    mostrarProductosFiltradosPorMarcaHTML(divProductos, productos, cliente.carrito);
        
/*---------------------------------------------------------------------------------------------------------------------*/ 
// CREACION DEL FILTRO DE PRECIO
    
    mostrarProductosFiltradosPorPrecioHTML(divProductos, productos, cliente.carrito);
        
/*---------------------------------------------------------------------------------------------------------------------*/ 

// CREACION DEL FILTRO DE CATEGORIA    
    
    mostrarProductosFiltradosPorCategoriaHTML(divProductos, productos, cliente.carrito);
        
/*---------------------------------------------------------------------------------------------------------------------*/ 
// CREACION DEL FILTRO DE BUSQUEDA    
    
    mostrarProductosFiltradosPorBuscadorHTML(divProductos, productos, cliente.carrito);
    
/*---------------------------------------------------------------------------------------------------------------------*/ 
// CREACION OPCIONES DE PAGO

    crearVistaPagoHTML(cliente);
  
}
/*********************************************************************************************************** */
/**
 * funcion para cargar y machear los productos del archivo json de productos
 * @returns array de objetos productos
 */
const getProdcutosFromJSON = async () => {

    let productos = []; // fetch y .json devuelven una promesa

    const response = await fetch('datos/productos.json')   // retorna el objeto response 

    const productosResponse = await response.json()      // retorna el json como objetos del response

    productosResponse.forEach((producto) => {
        productos.push(new Producto(producto.id, producto.stock, producto.cantidadEnCarrito, producto.nombre, producto.marca, producto.precio, producto.src, producto.descripcion))
    })

    return productos;
}

/*******************************************************************************************************************************
 * funcion para obtener un array con todos los valores no repetidos de algun atributo de los productos. Ej: atributo = marca , resultado = [serenisima, ilolay, cabrales, mariolio, etc]
 * @param {*} productos array de productos a filtrar
 * @param {*} atributo atributo a filtrar sus valores del array de productos
 * @returns array con los valores no repetidos de dicho atributo de los productos a filtrar
 */
const getAtributosDeProducto = (atributo, productos) => {

    let valores = [];   // ej : nombres, marcas, precios, etc

    productos.forEach((producto) => {

        valores.push(producto[atributo]);

    })

    let valoresNoRepetidos = [...new Set(valores)];

    return valoresNoRepetidos;
}


/************************************************************************************************************** 
 * funcion para levantar los productos de un JSON
 * @returns array de productos 
 */
const getTarjetasFromJSON = async () => {

    const response = await fetch('datos/tarjetas.json');

    const tarjetas = await response.json();

    return tarjetas;

}
/******************************************************************************************************************
 * funcion para traer datos que haya en local storage procesarlos y ponerlos a funcionar junto con los nuevos datos que se vayan a ingresar
 * @param {*} productos 
 * @param {*} carrito 
 */
function cargarDatosFromLSToHTML(productos, carrito) {  

    botonPagar.disabled = true;

    let carritoLS = levantarProductosDeLocalStorage() // traigo productos que haya en ls o array vacio si no los hay

    if (carritoLS !=''){
        
        botonPagar.disabled = false;

        carritoLS.forEach((productoLS) => {
            
            let producto = new Producto(productoLS.id, productoLS.stock, productoLS.cantidadEnCarrito -1, productoLS.nombre, productoLS.marca, productoLS.precio, productoLS.src)
            carrito.push(producto);   
           
            // voy buscando los productos que coiciden o sea que estan en el carrito para actualizar su stock
            const indexEncontrado = productos.findIndex((producto) => {
                return producto.id == productoLS.id;
            })

            if (indexEncontrado !== -1) {

                let productoEncontrado = productos[indexEncontrado];
                productoEncontrado.setStock(productoEncontrado.stock - productoLS.cantidadEnCarrito)   // actualizo el stock del producto correspondiente
                productos[indexEncontrado] = productoEncontrado;
            }
        })
        
        let divProductos = document.getElementById("divProductos");
        divProductos.innerHTML = '';
        crearVistaProductoHTML(divProductos, productos, carrito) // muestro los productos x pantalla 

        carrito.forEach((producto) => {
            agregarProductosACarritoHTML(producto, carrito);  // voy pasando los productos al carrito html 
        })

    } else {

        crearVistaProductoHTML(divProductos, productos, carrito);
    }

}
/*****************************************************************************************************************
 * funcion para llamar al swal que se encarga de mostrar el modal en el html para cargar a un cliente
 * @returns al cliente que se cargo
 */

const crearSwalIngresarCliente = () => {

    let cliente = new Cliente;

    Swal.fire({
        title: 'INGRESAR',
        html:     `<input type="text" id="dni" class="swal2-input" placeholder="DNI">
                   <input type="text" id="nombre" class="swal2-input" placeholder="Nombre">
                   <input type="text" id="apeliido" class="swal2-input" placeholder="Apellido">`,
        confirmButtonText: 'Aceptar',
        focusConfirm: false,
        allowOutsideClick: false,
        preConfirm: () => {

            const dni = Swal.getPopup().querySelector("#dni").value
            const nombre = Swal.getPopup().querySelector("#nombre").value
            const apellido = Swal.getPopup().querySelector("#apeliido").value

            cliente.dni = dni;
            cliente.nombre = nombre;
            cliente.apellido = apellido;


            if (!dni || !nombre || !apellido) {
                Swal.showValidationMessage(`Por favor ingrese sus datos`)

            }
            return cliente
        }

    }).then(() => {

        localStorage.setItem('cliente', JSON.stringify(cliente));

        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
          })
          
          Toast.fire({
            icon: 'success',
            title: 'Ingreso Exitoso',
            text: cliente.nombre+' '+cliente.apellido,
          })

          let elemento = document.getElementById('botonRegistrarse');
          $(elemento).popover('dispose')
          elemento.title = cliente.nombre+' '+cliente.apellido;
          $(elemento).popover()
            
    })

    return cliente;
}

/************************************************************************************************************
 * funcion para ingresar un nuevo cliente al sistema o sobreescribir el existente
 * @returns el objeto cliente creado
 */
function cargarClienteToHTML() {

    let cliente = JSON.parse(localStorage.getItem('cliente'));

    if (cliente) { // si hay cliente, si hace click en registrar, sobreescribe al cliente anterior 
       
        let elemento = document.getElementById('botonRegistrarse');
        elemento.title= cliente.nombre+' '+cliente.apellido;
        $(elemento).popover()
    
        let botonRegistrarse = document.getElementById('botonRegistrarse');
        
        botonRegistrarse.addEventListener('click', () => {

            cliente = crearSwalIngresarCliente();                 
        })

    } else { 
        
        cliente = crearSwalIngresarCliente();
    }

    return cliente;
}
    
/***************************************************************************************************************
 * //funcion para mostrar en el HTML el arreglo que obtengo al filtrar por busqueda, compara por cada caracter que se va a ingresando y va devolviendo el arreglo con los resultados que coincidan
 * @param {*} nodo nodo donde voy a agregar el HTML correspondiente
 * @param {*} arrayProductos productos sobre los cuales voy a filtrar 
 * @param {*} carrito array de productos contenidos en el carrito
 */
function mostrarProductosFiltradosPorBuscadorHTML(nodo, arrayProductos, carrito){

    let inputBuscador = document.getElementById("buscador"); // obtengo el input buscador

    inputBuscador.addEventListener('input', () => { //agrego evento input (activa por cada tecla ingresada)

        let productoBuscado = inputBuscador.value; // voy obteniendo cada tecla que se ingresa
        let productosBuscados = filtrarProductosPorNombreYMarcaBuscado(productoBuscado, arrayProductos); // filtro de acuerdo a CADA input ingresado y traigo array de productos que coincidan con dicho input 
                                                                                    
        nodo.innerHTML = "";  // limpio el HTML del nodo donde voy a mostrar los productos filtrados  
        crearVistaProductoHTML(nodo, productosBuscados, carrito); // llamo a la funcion que agrega los productos al html
    })
}


/*****************************************************************************************************************
 * funcion para filtrar y mostrar en el HTML los productos por categoria
 * @param {*} nodo elemento del DOM donse se agregara HTML
 * @param {*} arrayProductos array de productos
 * @param {*} carrito array de productos en el carrito
 */
function mostrarProductosFiltradosPorCategoriaHTML(nodo, arrayProductos, carrito) {

    let selectCategoria = document.getElementById("selectCategory");

    let categorias = getAtributosDeProducto('nombre', arrayProductos);

    let opcionNula = document.createElement("option");
    opcionNula.value = "";
    opcionNula.innerText = "Categoria"
    selectCategoria.append(opcionNula);

    categorias.forEach((categoria) => {

        let opcion = document.createElement("option");
        opcion.value = categoria;
        opcion.innerHTML = categoria;
        selectCategoria.append(opcion);

    })

    let opcionTodos = document.createElement("option");
    opcionTodos.value = 'todos';
    opcionTodos.innerHTML = 'TODOS';
    selectCategoria.append(opcionTodos);


    selectCategoria.addEventListener('change', () => { 

        let productoBuscado = selectCategoria.value; 

        if (productoBuscado == 'todos' || productoBuscado == '') {
            nodo.innerHTML = "";
            crearVistaProductoHTML(nodo, arrayProductos, carrito);

        } else {
            let productosBuscados = filtrarProductosPorAtributo('nombre', productoBuscado, arrayProductos); // filtro de acuerdo a CADA input ingresado y traigo array de productos que coincidan con dicho input 
            nodo.innerHTML = "";  // limpio el HTML del nodo donde voy a mostrar los productos filtrados  
            crearVistaProductoHTML(nodo, productosBuscados, carrito); // llamo a la funcion que agrega los prodatributoal html
        }
    })
}


/************************************************************************************************************** */

/*****************************************************************************************************************
 * funcion para filtrar y mostrar en el HTML los elementos por marca
 * @param {*} nodo elemento del DOM donse se agregara HTML
 * @param {*} arrayProductos array de productos
 * @param {*} carrito array de productos en el carrito
 */
 function mostrarProductosFiltradosPorMarcaHTML(nodo, arrayProductos, carrito) {

    let selectMarca = document.getElementById("selectTradeMark");

    let marcas = getAtributosDeProducto('marca', arrayProductos);

    let opcionNula = document.createElement("option");
    opcionNula.value = "";
    opcionNula.innerText = "Marca"
    selectMarca.append(opcionNula);

    marcas.forEach((marca) => {

        let opcion = document.createElement("option");
        opcion.value = marca;
        opcion.innerHTML = marca;
        selectMarca.append(opcion);

    })

    let opcionTodos = document.createElement("option");
    opcionTodos.value = 'todos';
    opcionTodos.innerHTML = 'TODAS';
    selectMarca.append(opcionTodos);


    selectMarca.addEventListener('change', () => { 

        let productoBuscado = selectMarca.value; 

        if (productoBuscado == 'todos' || productoBuscado == '') {
            nodo.innerHTML = "";
            crearVistaProductoHTML(nodo, arrayProductos, carrito);

        } else {
            let productosBuscados = filtrarProductosPorAtributo('marca', productoBuscado, arrayProductos); // filtro de acuerdo a CADA input ingresado y traigo array de productos que coincidan con dicho input 
            nodo.innerHTML = "";  // limpio el HTML del nodo donde voy a mostrar los productos filtrados  
            crearVistaProductoHTML(nodo, productosBuscados, carrito); // llamo a la funcion que agrega los prodatributoal html
        }
    })
}



/*****************************************************************************************************************
 * funcion para filtrar y mostrar en el HTML los elementos por rangos de precios
 * @param {*} nodo elemento del DOM donse se agregara HTML
 * @param {*} arrayProductos array de productos
 * @param {*} carrito array de productos en el carrito
 */
 function mostrarProductosFiltradosPorPrecioHTML(nodo, arrayProductos, carrito) {

    let selectPrecio = document.getElementById("selectPrice");

    let opcionNula = document.createElement("option");
    opcionNula.value = "";
    opcionNula.innerText = "Precio"
    selectPrecio.append(opcionNula);

    let opcion = document.createElement("option");
    opcion.value = 100;
    opcion.innerHTML = '0 - 100';
    selectPrecio.append(opcion);

    let opcion2 = document.createElement("option");
    opcion2.value = 200;
    opcion2.innerHTML = '100 - 200';
    selectPrecio.append(opcion2);

    let opcion3 = document.createElement("option");
    opcion3.value = 300;
    opcion3.innerHTML = '200 - 300';
    selectPrecio.append(opcion3);

    let opcion4 = document.createElement("option");
    opcion4.value = 400;
    opcion4.innerHTML = '300 - 400';
    selectPrecio.append(opcion4);


    selectPrecio.addEventListener('change', () => { //agrego evento input (activa por cada tecla ingresada)

        let productoBuscado = selectPrecio.value; 

        if (productoBuscado == '') {
            nodo.innerHTML = "";
            crearVistaProductoHTML(nodo, arrayProductos, carrito);

        } else {
            let productosBuscados = filtrarProductosPorPrecio(selectPrecio.value-100 , selectPrecio.value ,arrayProductos); // filtro de acuerdo a CADA input ingresado y traigo array de productos que coincidan con dicho input 
            nodo.innerHTML = "";  // limpio el HTML del nodo donde voy a mostrar los productos filtrados  
            crearVistaProductoHTML(nodo, productosBuscados, carrito); // llamo a la funcion que agrega los productos al html
        }
    })
}

/*********************************************************************************************************************
 * funcion para filtrar los productos por caracter ingresado en el buscador
 * @param {*} productoBuscado producto (coincidencia) que deseo comparar y filtrar 
 * @param {*} productos arreglo de productos a filtrar
 * @returns arreglo de productos filtrado
 */
 function filtrarProductosPorNombreYMarcaBuscado(productoBuscado, productos){

    let productosBuscados = productos.filter((producto) => {    
        return `${producto.nombre}${producto.marca.replace(/ /g, '')}`.toLowerCase().includes(productoBuscado.replace(/ /g, '').toLowerCase()); // letras de producto.nombre incluyan las letras del productoBuscado, retorna true o false
    })                                                  // con este elimino los espacios en blanco
    return productosBuscados;
}


/*********************************************************************************************************************
 * funcion para filtrar los productos por el atributo deseado
 * @param {*} atributo atributo cuyos elementos deseo filtrar 
 * @param {*} productoBuscado nombre de la categoria del producto buscado 
 * @param {*} productos arreglo de productos a filtrar
 * @returns arreglo de productos filtrado
 */            
 function filtrarProductosPorAtributo(atributo, productoBuscado, productos){

    let productosBuscados = productos.filter((producto) => {    
        return producto[atributo].toLowerCase() == productoBuscado.toLowerCase() 
    })                                                  
    return productosBuscados;
}

/**********************************************************************************************************************
 * funcion para filtrar los productos por precio
 * @param {*} precioMin valor minimo del precio para el filtro 
 * @param {*} precioMax valor maximo del precio para el filtro
 * @param {*} productos array de productos a filtrar
 * @returns 
 */          
 function filtrarProductosPorPrecio(precioMin, precioMax, productos){

    let productosBuscados = productos.filter((producto) => {    
        return (producto.precio >= precioMin && producto.precio <= precioMax)  
    })                                                 
    return productosBuscados;
}

/**********************************************************************************************************************
 * funcion para agregar los productos al DOM
 * @param {*} nodo etiqueta donde voy a agregar el producto  
 * @param {*} arrayProducto array de todos los productos de la tienda
 * @param {*} carrito array de los productos que se encuentran en el carrito
*/
function crearVistaProductoHTML(nodo, arrayProductos, carrito){
    
    arrayProductos.forEach((producto) => {
        //agrego al nodo HTML completo con la "card" del producto  

        nodo.innerHTML += 
                        `<div class="col">
                           <div class="card">
                            <img type="button" id="cardProducto-${producto.id}" src=${producto.src} class="card-img-top" alt="...">
                             <div class="card-body">
                             <h5 class="card-title" style="text-align:center">${producto.nombre} ${producto.marca}</h5>
                             <p style="text-align:center"> ${producto.descripcion} </p>
                             <h5 id="precioProducto" style="text-align:center"> $ ${producto.precio} </h5>
                             <div class="d-grid gap-2 col-6 mx-auto">
                             <button id ="producto-${producto.id}" class="btn btn-primary p-3 rounded-3 btn-sm " type="button" data-bs-trigger="hover" > <img src="imagenes/iconcart.png" width="30px">
                            </button>
                            </div>
                           </div>
                         </div>
                        </div>`
    })

    // una vez armado el esqueleto HTML con los productos agregados...
    arrayProductos.forEach((producto) => {

        let botonVerProducto = document.getElementById(`cardProducto-${producto.id}`);
        
        botonVerProducto.addEventListener('click',()=>{

            window.open(`pages/productView.html?id=${producto.id}`, "_self");
            // le paso el id del producto a la otra pagina            
        })

        let botonAgregar = document.getElementById(`producto-${producto.id}`);
        
        botonAgregar.title = 'Agregar al Carrito'
        $(botonAgregar).popover() 

        botonAgregar.addEventListener('click', () => {

                Toastify({
                    text: "Producto Agregado",
                    duration: 2000,
                    gravity: "top", // `top` or `bottom`
                    position: "right", // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                      //background: "linear-gradient(to right, #00b09b, #0069ff)",
                      background: "#007CFF" 
                    },
                    onClick: ()=>{
                        $('#modalVerCarrito').modal('show');
                        } 
                  }).showToast();

            producto.actualizarStock(); 
            agregarProductosACarritoHTML(producto, carrito);
            agregarProductosALocalStorage(producto); // cada vez que agrego un elemento al carrito, lo agrego al LS
        
        });
    })
}
/*******************************************************************************************************************/
/**
 * funcion para eliminar productos del local storage
 * @param {*} producto que voy a eliminar del LS
 */
 function eliminarProductosDelLocalStorage(producto){

    let productosLocalStorage = levantarProductosDeLocalStorage(); // obtengo el array que hay en LS, o array vacio si no hay nada

    const indexProductoBuscado = productosLocalStorage.findIndex((productoLS)=>{
        return productoLS.id == producto.id;
    })
     
    // si un MISMO producto tiene mas de 1 en cantidad , le sigo bajando(--) dicho atriubto
    if(indexProductoBuscado >= 0 && productosLocalStorage[indexProductoBuscado].cantidadEnCarrito > 1){ 
        let productoBuscado = productosLocalStorage[indexProductoBuscado];
        productoBuscado.cantidadEnCarrito--;
        productosLocalStorage[indexProductoBuscado] = productoBuscado;
    // cuando ya la cantidad es menor o igual a 1 no le bajo mas la cantidad sino que lo quito del carrito
    }else if(productosLocalStorage[indexProductoBuscado].cantidadEnCarrito <= 1){ 
        productosLocalStorage.splice(indexProductoBuscado, 1);  // lo elimino
    }
    
    localStorage.setItem('productosEnLS', JSON.stringify(productosLocalStorage));
}

/*******************************************************************************************************************/
/**
 * funcion para agregar productos a array de productos en Local Storage
 * @param {*} producto que voy a agregar al LS
 */
function agregarProductosALocalStorage(producto){

    let productosLocalStorage = levantarProductosDeLocalStorage(); // obtengo el array que hay en LS, o array vacio si no hay nada

    const indexProductoBuscado = productosLocalStorage.findIndex((productoLS)=>{
        return productoLS.id == producto.id;
    })

    if(indexProductoBuscado >= 0){ // si encuentro el producto le aumento la cantidad xq agregue 1 mas
        
        let productoBuscado = productosLocalStorage[indexProductoBuscado];
        productoBuscado.cantidadEnCarrito++;
        productosLocalStorage[indexProductoBuscado] = productoBuscado;

    }else{  // si no lo encuentro, al producto le creo el valor cantidad , y lo agrego
        
        producto.cantidadEnCarrito = 1;
        productosLocalStorage.push(producto);
    }

    localStorage.setItem('productosEnLS', JSON.stringify(productosLocalStorage));

}
/******************************************************************************************************************/
/**
 * funcion para chequear si hay productos guardados en LS
 * @returns devuelve array de productos (parseados a objetos) que hay en LS o array vacio si no hay nada   
 */
function levantarProductosDeLocalStorage(){

    let productosEnLS = localStorage.getItem('productosEnLS');  // obtengo los productos almacenados en LS (vienen en formato json)

    let productosParseados = JSON.parse(productosEnLS) || [] // si es distinto de null toma el primer valor, si es null toma el segundo

    return productosParseados;
}
/******************************************************************************************************************/
/**
 * funcion para agregar los productos que hay en el carrito (ya sea al momento de ir comprando o levantando los productos que hay en el LS) a la vista del carrito en el HTML
 * @param {*} producto a agregar al HTML
 */
function agregarProductosACarritoHTML(producto, carrito){
    
    if (carrito){

        botonPagar.disabled = false;

        let indexProductoBuscado = carrito.findIndex((productoCarrito)=>{
            return productoCarrito.id == producto.id;
        })

        // Si encuentro el producto le aumento la cantidad xq agregue 1 mas y actualizo el HTML
/*----------------------------------------------------------------------------------------------------------------------------------*/    
        if (indexProductoBuscado >= 0) {   
            
            producto = carrito[indexProductoBuscado];

            producto.cantidadEnCarrito++

            let divCantidad = document.getElementById(`cantidad-${producto.id}`); // si el producto ya estaba en el carrito actualizo su etiqueta de cantidad
            // cuando actualizo del LS la primera vez divCant no existe, entonces va al else, luego solo actualizo el stock en el if
            divCantidad  ? divCantidad.innerHTML = `<h5 id="cantidad-${producto.id}" class="card-title">Cantidad: ${producto.cantidadEnCarrito}</h5>` : crearVistaCarritoHTML(producto);
            //puede ocurrir que agregue varias veces un mismo elemento, SOLO CON LA PRIMERA VEZ QUE LO AGREGUE creo el evento eliminar, pues si no se creeara las N veces que haya pulsado el boton AGREGAR y luego este evento se ejecutaria esas N veces 
            if (!producto.enCarrito) {
                
                let botonEliminar = document.getElementById(`eliminar-${producto.id}`); //agarro el boton eliminar 
                botonEliminar.addEventListener('click', () => {

                    producto = eliminarProductoDelCarrito(producto, carrito);
                
                })
                producto.setEnCarrito();  // pone enCarrito = true para que ya no vuelva a crear este event en caso que se siga agregando este mismo producto
            }
            carrito[indexProductoBuscado] = producto;

// Si NO lo encuentro, al producto le creo el valor cantidad , y lo agrego         
/*----------------------------------------------------------------------------------------------------------------------------------*/
        } else {  
            
            producto.cantidadEnCarrito = 1;

            crearVistaCarritoHTML(producto);
           
            let botonEliminar = document.getElementById(`eliminar-${producto.id}`); //agarro el boton eliminar 
            botonEliminar.addEventListener('click', () => {

                producto = eliminarProductoDelCarrito(producto, carrito);
                
            })
            producto.setEnCarrito();  // pone enCarrito = true
            carrito.push(producto);
        }
    }
}
/*************************************************************************************************************************
 * funcion para ir eliminando productos del carrito y de la lista del carrito en el HTML
 * @param {*} producto 
 * @returns 
 */
function eliminarProductoDelCarrito(producto, carrito){

    if (producto.cantidadEnCarrito > 1){
        
        producto.cantidadEnCarrito--;
        let divCantidad = document.getElementById(`cantidad-${producto.id}`);
        divCantidad.innerHTML = `<h5 id="cantidad-${producto.id}" class="card-title">Cantidad: ${producto.cantidadEnCarrito}</h5>`
        eliminarProductosDelLocalStorage(producto);
       
    
    }else{ // si cantidad en carrito es menor a 1, entonces procedo a eliminar dicho producto del carrito y de la lista
               
        producto.cantidadEnCarrito = 0;  // seteo cantidad en carrito de ese producto en 0 unidades
        producto.enCarrito = false;
        let indiceAEliminar = carrito.indexOf(producto); // busco el producto en el carrito 
        carrito.splice(indiceAEliminar, 1);  // lo elimino
        eliminarProductosDelLocalStorage(producto);
        
        let liAEliminar = document.getElementById(`li-${producto.id}`);  // obtengo el item completo de la lista de ese producto

        liAEliminar.parentNode.removeChild(liAEliminar);  // lo elimino
    }
    
    if(carrito==''){
        
        botonPagar.disabled = true;
    }
    

    return producto;
}
/********************************************************************************************************************** */
/**
 * funcion para crear una "card" completa de algun producto y añadirlo a la lista del carrito
 * @param {*} producto sobre el cual estoy posicionado del carrito 
 */
function crearVistaCarritoHTML(producto) {

    let ul = document.getElementById("ulCarrito");

    let li = document.createElement('li');

    li.innerHTML = `  <div id="li-${producto.id}" class="col">
                                <div class="card mx-auto " style="width:10rem">
                                    <img src=${producto.src} class="card-img-top" alt="...">
                                    <div class="card-body">
                                    <h5 class="card-title">${producto.nombre} ${producto.marca}</h5>
                                    <h5 id="cantidad-${producto.id}" class="card-title">Cantidad: ${producto.cantidadEnCarrito}</h5>
                                    <h5 id="precioProducto" style="text-align:center"> $ ${producto.precio} </h5>
                                    <button id ="eliminar-${producto.id}" class="btn btn-primary mx-auto" type="button" > Quitar </button>
                                    </div>
                                </div>
                            </div> <Br>`

    ul.append(li);
}

/*************************************************************************************************************** */

/**
 * funcion para crear un select (HTML) con las options que corresponden a  los medios de pago que hay disponibles
 * @param {*} cliente 
 */
const crearVistaPagoHTML = async(cliente)=> {
    
    let tarjetas = await getTarjetasFromJSON();

    let botonConfirmarPago = document.getElementById("botonConfirmarPago");
    let divPagos = document.getElementById("divPagos");

    tarjetas.forEach((tarjeta) => {

        divPagos.innerHTML +=`<label id ="label-${tarjeta.id}" for=${tarjeta.id} class="label" > 
                                <input id=${tarjeta.id} class="radio isHidden" style="margin-left: 10rem;" type="radio" name="tarjeta" value=${tarjeta.concepto}> <img src=${tarjeta.src} width="70px"> ${tarjeta.concepto.toUpperCase()}  
                            </label>`
    })
    
    tarjetas.forEach((tarjeta)=>{

        let label = document.getElementById(`label-${tarjeta.id}`)
        label.addEventListener('mouseover',  ()=>{
            label.style.backgroundColor = '#159FFF'
        })
        
        label.addEventListener('mouseout', ()=>{
            label.style.backgroundColor = "white"
        })
    })

    let inputChecked = document.getElementById(tarjetas[0].id); // pongo en checked el primer elemento de tarjetas
    inputChecked.checked = true;
    
    botonConfirmarPago.addEventListener('click', function funcionBotonConfirmar(){   
        
        let medioPago = document.querySelector('input[name="tarjeta"]:checked').value;

        botonConfirmarPago.removeEventListener('click', funcionBotonConfirmar); 
        //ya hice click (radio check) y pase la info , remuevo el evento de ese boton para asignarle ahora el evento para la seleccion de cuotas al mismo boton
        // cuando haga click evalua el medio de pago y ejecutara el switch correspondiente
        switch (medioPago) {

            case 'efectivo':

                crearVistaEnvioHTML(cliente, medioPago, 0);
                break;

            case 'visa':
            case 'master':
            case 'cabal':    
                 
                // pues sino queda asociado al evento del input radio anterior
                while (divPagos.firstChild) {
                    divPagos.removeChild(divPagos.firstChild); // remuevo los hijos de divpagos (o sea los radio con las tarjetas)
                }
                
                divPagos.innerHTML = `<p style="text-align: center" >Seleccione la cantidad de cuotas</p>`

                let selectCuotas = document.createElement("select");
                selectCuotas.className = "form-select"

                let opcionNula = document.createElement("option");
                opcionNula.value = "";
                opcionNula.innerText = "Elija una opcion"
                selectCuotas.append(opcionNula);

                for(let i=3 ;i<=18; i+=3){

                    if(i==9 || i==15) continue;
                    
                    let opcion = document.createElement("option");
                    opcion.value = i;
                    opcion.innerHTML = i;
                    selectCuotas.append(opcion);
                }

                divPagos.append(selectCuotas);

                botonConfirmarPago.addEventListener('click', ()=>{ // nuevo evento para el boton confirmar asociado al valor del select
                    crearVistaEnvioHTML(cliente, medioPago, selectCuotas.value);
                })    

                break;              
        }
        // este boton en el html llama automaticamente al modal de mostrar ticket
        //- si la opcion es efectivo , llamo a ticket y paso que pago en eftvo y 0 cuotas
        //- si elige alguna tarjeta abrir select que ofrezca la cantidad de pagos que pueda elegir y luego llamar al ticket
    })   
}

/************************************************************************************************************ */
/**
 * funcion para aplicar los recargos al subtotal segun el medio de pago seleccionado
 * @param {*} subtotal importe sin los recargos , es la suma de todos los productos sin ningun recargo 
 * @param {*} medioDePago medio de pago seleccionado por el cliente 
 * @returns 
 */
function calcularRecargosSobreTotal(subtotal, medioDePago, cuotas) {

    switch (medioDePago) {

        case 'efectivo': return subtotal ;   

        case 'visa':   
        
            switch(cuotas) {

                case '3' : return subtotal * 1.1
                case '6' : return subtotal * 1.2
                case '12' : return subtotal * 1.3
                case '18' : return subtotal * 1.4
            }
        
        case 'master': //return subtotal * 1.1;   //3 cuotas  

            switch (cuotas) {

                case '3': return subtotal * 1.11
                case '6': return subtotal * 1.21
                case '12': return subtotal * 1.34
                case '18': return subtotal * 1.44
            }
        
        case 'cabal': //return subtotal * 1.1;   //3 cuotas  

            switch (cuotas) {

                case '3': return subtotal * 1.12
                case '6': return subtotal * 1.25
                case '12': return subtotal * 1.4
                case '18': return subtotal * 1.6
            }
    }
}
/*************************************************************************************************************** */
//funcion para calcular el costo de envio por distancia
//devuelve el valor del costo de envio
function crearVistaEnvioHTML(cliente, medioDePago, cuotas) {

    $('#pagarModal').modal('hide');
    $('#envioModal').modal('show');

    let inputEnvio = document.getElementById("inputEnvio");
    let costoEnvio;

    inputEnvio.addEventListener('keyup', (e) => {

        switch (true) {

            case (e.key == "Enter" && inputEnvio.value < 0): {

                Swal.fire({
                    icon: 'error',
                    text: 'La distancia no puede ser negativa!',
                  })
                
                e.preventDefault()
                break;
            }

            case (e.key == "Enter" && inputEnvio.value == ''): {

                Swal.fire({
                    icon: 'warning',
                    text: 'Debe ingresar un valor',
                  })
                e.preventDefault()
                break;

            }

            case (e.key == "Enter"): {

                switch (true) {

                    case (inputEnvio.value == 0):
                        costoEnvio = 0;
                        break;
                    case (inputEnvio.value < 30):
                        costoEnvio = 50;
                        break;
                    case (inputEnvio.value >= 30):
                        costoEnvio = 100;
                        break;
                }

                $('#envioModal').modal('hide');
                crearTicketHTML(cliente, costoEnvio, medioDePago, cuotas); // tengo el valor de value segun la opcion
                
                break;
            }
        }
    })
}
/**************************************************************************************************************** */
/**
 * funcion para calcular la suma de N valores
 * @param  {...any} valores rest de parametros, (cantidad no definida de parametros que recibira la funcion)
 * @returns la suma de todos los valores que haya recibido
 */
const calcularSubtotal = ((...valores) => {

    return valores.reduce((ant, sig) => ant + sig, 0) // voy sumando ant y sig y los voy guardando en el acum
})

/**************************************************************************************************************
 * funcion para crear la vista del ticket en el DOM y mostrar toda la informacion de la compra realizada
 * @param {*} cliente 
 * @param {*} costoEnvio 
 * @param {*} medioDePago 
 */
function crearTicketHTML(cliente, costoEnvio,  medioDePago, cuotas) {
    
    $('#ticketModal').modal('show');

    let arrayImportes = []
    let ul = document.getElementById("ulTicket");
    let botonAceptar = document.getElementById("botonAceptarPago")

    botonAceptar.addEventListener('click', () => {

        Swal.fire({
            icon: 'success',
            title: 'Gracias Por Su Compra',

        }).then((result) => {
            if (result.isConfirmed) {
                location.reload()
            }
        })

    })

    cliente.carrito.forEach((producto) => {
        arrayImportes.push(producto.precio * producto.cantidadEnCarrito ) //esto lo hago para usar spread en arrayimportes
    })

    let subtotal = calcularSubtotal(...arrayImportes); // paso el array de esta forma (precio1, precio2, precio3,...) y no como un array [precio1, precio2, precio3,...]
    let total = (calcularRecargosSobreTotal(subtotal, medioDePago, (cuotas)) + costoEnvio).toFixed(2);
    let ticket = new Ticket(medioDePago, subtotal, costoEnvio, total);
  

    for (let atributo in ticket) {

        if (atributo == 'fecha') {

            let li = document.createElement('li');

            li.className = "list-group-item"
            li.innerHTML = `<p style ="text-align:left;"> ${atributo.toUpperCase()} <span style="float: right">${ticket[atributo].now().toLocaleString(ticket.fecha.DATETIME_SHORT)} </span></p>`
            ul.append(li);
            
            cliente.carrito.forEach((producto)=>{

                let li = document.createElement('li');
    
                li.className = "list-group-item"
                li.innerHTML =  `<p style="text-align:left;">${producto.cantidadEnCarrito} x ${producto.nombre.toUpperCase()} ${producto.marca.toUpperCase()} <img src=${producto.src} class="card" style="width: 5rem" > <span style="float:right;"> $ ${producto.precio * producto.cantidadEnCarrito}</span></p> ` 
                ul.append(li);
            })
 
            continue; // paso a la siguiente iteracion
        }

        let li = document.createElement('li');

        li.className = "list-group-item"
        li.innerHTML =  `<p style="text-align:left;">
                            ${atributo.toUpperCase()} <span style="float:right;"> ${isNaN(ticket[atributo])? ticket[atributo].toUpperCase():'$ '+ticket[atributo]  }</span>
                        </p> ` 

        ul.append(li);
    }
}

/******************************************************************************************************************* */
/**
 * funcion para ir al comienzo de la pagina con un boton tras scrollear hacia abajo
 */
const goToTop = () => {

    let mybutton = document.getElementById("btn-back-to-top");

    //A partir de un scroll hacia abajo de 20px aparece el boton
    window.onscroll = () => {
        if (
            document.body.scrollTop > 20 ||
            document.documentElement.scrollTop > 20
        ) {
            mybutton.style.display = "block";
        } else {
            mybutton.style.display = "none";
        }
    };

    mybutton.addEventListener("click", backToTop);

    function backToTop() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }
}
/**
 * funcion controladora de todo el sistema.
 */
tienda();
