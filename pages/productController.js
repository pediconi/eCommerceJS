// intente usar import, require, etc , y todo problama nunca me dejo importar esta clase...
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

const getProdcutosFromJSON = async () => {

    let productos = []; // fetch y .json devuelven una promesa

    const response = await fetch('../datos/productos.json')   // retorna el objeto response 

    const productosResponse = await response.json()      // retorna el json como objetos del response

    productosResponse.forEach((producto) => {
        productos.push(new Producto(producto.id, producto.stock, producto.cantidadEnCarrito, producto.nombre, producto.marca, producto.precio, producto.src, producto.descripcion))
    })
    
    return productos;
}


function levantarProductosDeLocalStorage(){

    let productosEnLS = localStorage.getItem('productosEnLS');  // obtengo los productos almacenados en LS (vienen en formato json)

    let productosJSON = JSON.parse(productosEnLS) || [] // si es distinto de null toma el primer valor, si es null toma el segundo

    return productosJSON;
}


function renderCarrito(){

    let carrito = [];
    let carritoLS = levantarProductosDeLocalStorage();

    carritoLS.forEach((productoLS) => {
            
        let producto = new Producto(productoLS.id, productoLS.stock, productoLS.cantidadEnCarrito, productoLS.nombre, productoLS.marca, productoLS.precio, productoLS.src)
        carrito.push(producto);   
    })

    carrito.forEach((producto) => {
        //pasarProductosACarritoHTML(producto, carrito);  // voy pasando los productos al carrito html 
        crearItemLiProductoEnCarritoHTML(producto);
    })

    return carrito;
}
/**************************************************************************************************************/
                                                      
/*************************************************************************************************************/
function crearItemLiProductoEnCarritoHTML(producto) {

    let ul = document.getElementById("ulCarrito");

    let li = document.createElement('li');

    li.innerHTML = `  <div id="li-${producto.id}" class="col">
                                <div class="card mx-auto " style="width:10rem">
                                    <img src=../${producto.src} class="card-img-top" alt="...">
                                    <div class="card-body">
                                    <h5 class="card-title">${producto.nombre} ${producto.marca}</h5>
                                    <h5 id="precioProducto" style="text-align:center"> $ ${producto.precio} </h5>
                                    <h5 id="cantidad-${producto.id}" class="card-title">Cantidad: ${producto.cantidadEnCarrito}</h5>
                                    </div>
                                </div>
                            </div> <Br>`

    ul.append(li);
}
/*********************************************************************************************************** */                                                       
const getParametterFromURL = ()=> {                         
                                                               
    let url_string = window.location.href; //window.location.href
    let url = new URL(url_string);
    let param = url.searchParams.get("id");
    console.log(param);

    return param;
}

const createProductView = async () => {

    let param = getParametterFromURL();
    let productos = await getProdcutosFromJSON()
    
    const producto = productos.find((producto) => {
        return producto.id == param;
    })
    
    console.log(producto);
    
    let divProducto = document.getElementById('divpaginaproducto');
    //`<strong>Y A ESE DIV LE AGREGO ${param}</strong>`
    divProducto.innerHTML = `<div class="card mb-3 mx-auto" >
                                <div class="row g-0">
                                <div class="col-md-4">
                                    <img src=../${producto.src} width="1000px" class="img-fluid rounded-start" />
                                </div>
                                <div class="col-md-8">
                                    <div class="card-body">
                                    <h5 class="card-title">${producto.nombre} ${producto.marca}</h5>
                                    <p class="card-text">
                                    ${producto.descripcion}
                                    <h5 id="precioProducto"> $ ${producto.precio} </h5>
                                    </p>
                                    <p class="card-text">
                                    <a href = "../index.html" id ="producto-${producto.id}" class="btn btn-secondary" type="button" > Volver </a>
                                    </p>
                                    </div>
                                </div>
                                </div>
                            </div>`
}

createProductView();
renderCarrito();
//levantarProductosDeLocalStorage();



// AGREGAR LA VISTA DEL PRODUCTO