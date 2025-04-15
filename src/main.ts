import { getAllProducts, getSingleProduct, completeOrder } from './api';
import { newOrder, ProductResponse, Product } from './types';


const productWrapperEl = document.querySelector<HTMLDivElement>("#container");
const navEl = document.querySelector<HTMLElement>("nav")!;
const productCount = document.querySelector<HTMLDivElement>("#product-count");

// products är flera produkter en variabel som är hämtad från ProductResponse.
let products: ProductResponse;
// product innehåller en produkt eller är tom.
let product: Product | null = null;

// hämtar JSON-produkter från localStorage, och finns inga ger den tillbaka en tom array
let jsonProducts: Product[] = JSON.parse(localStorage.getItem("cartItems") ?? "[]");


/**
 * EVENTLISTENERS
 * 
 */

// Evenlistener for navbar (1) click on hamburger toggles nav-menu (2) click on category renders specified products
navEl.addEventListener("click", (e: MouseEvent) => {
    const target = e.target as HTMLElement;
        
        if (target.id === "cart") {
            renderCart();
        }
        else if (target.className === "fa fa-bars fa-lg" && navEl.className === "navbar") {
            navEl.className += " showMenu";
        } else {
            navEl.className = "navbar";
        }
    
        if (target.className === "link") {
            renderSpecificProducts(target.id)
        }
    
        if (target.className === "link" && target.id === "sortiment" || target.id === "title") {
            renderAllProducts();
        }
    })
    

productWrapperEl?.addEventListener("click", async (e: MouseEvent) => {
    const target = e.target as HTMLElement;
        
    if (target.tagName === "IMG") {
        const parent = target.parentElement as HTMLDivElement;
        const clickedProductId = Number(parent.dataset.todoId);
            
        if (isNaN(clickedProductId)) {
            console.log("Invalid product ID");
            return;
        }
            
        try {
            const fetchedProduct = await getSingleProduct(clickedProductId);
            product = fetchedProduct.data;
            renderProduct();
        } catch (error) {
            console.log("Error fetching product", error);
        }
    }
});

/**
 * PRODUKTRENDERING
 * 
 */

const getAndRenderProducts = async (): Promise<void> => {
    try {
        products = await getAllProducts();
        products.data.sort((a, b) => a.name.localeCompare(b.name));
        renderAllProducts();
        
    } catch (error) {
        console.log("Error fetching products", error);
    }
};


const inStockProducts = (fullStock: Product[]): number => {
    const inStock = fullStock.filter((product) => {
        return product.stock_status === "instock"
    });
    
    return inStock.length;
}


const renderAllProducts = (): void => {
    if (!productWrapperEl || !products || !productCount) return;
    
    productWrapperEl.className = "showAllGrid";
    productWrapperEl.innerHTML = `<div id="productlist" class="cardContainer">` + products.data
    .map((product) => {
        
        const buyButton = product.stock_status === "outofstock" 
        ? `<button class="btn btn-danger all-products-btn disabled=true">Tillfälligt slut</button>` 
        : `<button class="btn btn-primary all-products-btn">Lägg till i varukorg</button>`;
        
        return `
        <div data-todo-id="${product.id}" class="card">
        <img class="card-img-top" src="https://www.bortakvall.se/${product.images.thumbnail}">
        <div class="card-body">
        <h5 class="card-title"><strong>${product.name}</strong></h5>
        <p class="card-text">Pris: ${product.price} kr</p>
        <div class="shopbtn2">
        ` 
        + buyButton + 
        `
        </div>
        </div>
        </div>
        `;
    })
    .join("") 
    + 
    `</div>`;                                                                                   
    // Lägg till event listeners för varje knapp i .shopbtn2`
    document.querySelectorAll(".btn-primary")?.forEach((button) => {
        button.addEventListener("click", addToLocalStorage);
    });
    productCount.innerText = `Visar: ${products.data.length} produkter. ${inStockProducts(products.data)} är i lager.`
};



const renderSpecificProducts = (specification: string): void => {
    if (!productWrapperEl || !products || !productCount) return;
    
    const specifiedProducts = products.data.filter((product) => 
        product.tags.some(tag => tag.name === `${specification}`)
    );

    productWrapperEl.className = "showAllGrid";
    productWrapperEl.innerHTML = `<div id="productlist" class="cardContainer">` + specifiedProducts
    .map((product) => {
        
        const buyButton = product?.stock_status === "outofstock"
        ? `<button class="btn btn-danger all-products-btn disabled=true">Tillfälligt slut</button>` 
        : `<button class="btn btn-primary all-products-btn">Lägg till i varukorg</button>`;
        
        return `
        <div data-todo-id="${product.id}" class="card">
        <img class="card-img-top" src="https://www.bortakvall.se/${product.images.thumbnail}">
        <div class="card-body">
        <h5 class="card-title"><strong>${product.name}</strong></h5>
        <p class="card-text">Pris: ${product.price} kr</p>
        <div class="shopbtn2">
        ` 
        + buyButton + 
        `
        </div>
        </div>
        </div>
        `;
    })
    .join("");
    +
    `</div>`;                                                                                   
    // Lägger till event listeners för varje knapp i .shopbtn2`
    document.querySelectorAll(".btn-primary")?.forEach((button) => {
        button.addEventListener("click", addToLocalStorage);
    });

    productCount.innerText = `Visar: ${specifiedProducts.length} produkter varav ${inStockProducts(specifiedProducts)} är i lager.`  
}


const renderProduct = (): void => {
    if (!productWrapperEl || !product) return;
    
    const buyButton = product.stock_status === "outofstock" 
    ? `<button class="btn btn-primary single-product-btn visually-hidden">Lägg till i varukorg</button>` 
    : `<button class="btn btn-primary single-product-btn">Lägg till i varukorg</button>`;
    
    const stockQuantity = product.stock_quantity === null
    ? `<p class="card-text"><strong>Tillfälligt slut</strong></p>`
    : `<p class="card-text">Antal i lager: ${product.stock_quantity}</p>`;
    
    productWrapperEl.className = "showOneGrid";
    productWrapperEl.innerHTML = `
    <div data-todo-id="${product.id}" class="card">
    <div class="imageContainer">
    <img src="https://www.bortakvall.se/${product.images.large}">
    </div>
    <div class="detailsContainer">
    <div class="card-body">
    <h5 class="card-title">${product.name}</h5>
    <p class="card-text">${product.description}</p>
    <p class="card-text"><strong>${product.price} kr styck</strong></p>
    `
    + stockQuantity +
    `
    </div>
    <div class="shopbtn">
    ` 
    + buyButton + 
    `
    </div>
    </div>
    <div class="backButton">
    <button class="btn btn-secondary back-btn">Tillbaka</button>
    </div>
    </div>
    `;
    document.querySelector(".shopbtn")?.addEventListener("click", addToLocalStorage);
    
    document.querySelector(".back-btn")?.addEventListener("click", renderAllProducts);
};

/** 
 * VARUKORG + LOCALSTORAGE
 * 
 */

// Uppdaterat funktionen: Sparar först ner knapp som trycktes på, letar upp kort närmast knappen
// hämtar ID:t från renderingen och letar efter matchande ID i products.data -> pushar sedan upp detta till localStorage
const addToLocalStorage = (event: Event): void => {
    const button = event.target as HTMLElement;
    const card = button.closest(".card");
    if (!card) return;
    
    const productId = card.getAttribute("data-todo-id");
    const product = products.data.find(product => product.id.toString() === productId);
    if (!product) return;
    
    
    jsonProducts.push(product);
    toggleCartColour()                                       
    
    localStorage.setItem("cartItems", JSON.stringify(jsonProducts));
    
    calculateCartItems();
};



// Sorterar varukorgen efter antal - tar emot jsonProducts, pushar upp varje produkt i ny array (sortedProducts),
// men först stämmer den av om en likadan produkt redan pushats upp till sortedProducts.
// Om så är fallet ökar den bara antalet på existerande product och pushar inte upp en till.
// Tänkte göra ett interface till objekten i sortedProducts, men den skulle i så fall behöva ligga
// utanför funktionen vilket kändes otydligare än att formulera mig utan interface.
const sortCart = (productsToSort: Product[]): { product: Product, quantity: number}[] => {
    
    let sortedProducts: { product: Product, quantity: number}[] = []
    
    productsToSort.forEach(productToSort => {
        
        const existingProduct = sortedProducts.find(index => index.product.id === productToSort.id);
        
        if (existingProduct) {
            existingProduct.quantity++
        } else {
            sortedProducts.push({ product: productToSort , quantity: 1 });
        }
        
    });
    
    sortedProducts = sortedProducts.sort((a, b) => a.product.name.localeCompare(b.product.name))
    
    return sortedProducts;
    
}


// Räknar ut det totala priset av alla varor i kundvagnen
const calculateCartTotal = () => {
    const sortedProducts = sortCart(jsonProducts);
    
    const total_stock_value = sortedProducts.reduce((total, {product, quantity}) => {
        return total + (product.price * quantity);
    }, 0);
    
    return total_stock_value;
}


// Räknar ut det totala antalet varor i kundvagnen
const calculateCartItems = () => {
    const sortedProducts = sortCart(jsonProducts);
    
    const items_in_cart = sortedProducts.reduce((total, {quantity}) => {
        return total + quantity;
    }, 0);
    
    return document.querySelector(".badge")!.innerHTML = `${items_in_cart}`;
}



const renderCart = () => {
    productWrapperEl!.className = "showCartGrid";
    productCount!.innerText = "";
    
    if (jsonProducts.length === 0) {
        productWrapperEl!.innerHTML = `
        <div id="emptyCart" class="card">
        <div class="card-body">
        <h5 class="card-title">Du har inget godis i varukorgen :(</h5>
        <p class="card-text">Välj någon av kategorierna ovan och gå lös, <br>
        så ses vi här när du är redo!</p>
        </div>`;
        
        return;
    } else {
        const sortedProducts = sortCart(jsonProducts);
        const cartTotal = calculateCartTotal();
        
        productWrapperEl!.innerHTML = `
        <div class="cartProduct">` + 
        sortedProducts.map(({ product, quantity }) => `
        <div class="cartItem" data-product-id="${product.id}">                                       
        <div class="cartImg">
        <img src="https://www.bortakvall.se/${product.images.thumbnail}">
        </div>
        <div class="detailText">
        <h5>${product.name}</h5>
        <p>Antal skopor: ${quantity}st</p>
        <p>Pris per skopa: ${product.price}kr</p>
        <p>Ditt pris: ${product.price * quantity}kr</p>
        </div>
        <div class="amountDetails">
        <button id="decreaseBtn" class="cartBtn btn btn-outline-dark"> - </button>
        <span class="quantity">${quantity}</span>
        <button id="increaseBtn" class="cartBtn btn btn-outline-dark"> + </button>
        <button id="removeBtn" class="cartBtn btn btn-outline-dark"> X </button>
        </div>
        </div>
        `).join("") + `
        </div>
        <div class="totalDescription">
        <h5>Totalsumma: ${cartTotal} kr</h5>
        <button id="checkoutButton">Gå till kassan</button>
        </div>
        `;
        
        addCartEventListeners(sortedProducts);
        
        const checkoutButton = document.querySelector<HTMLButtonElement>("#checkoutButton");
        
        if (checkoutButton) {
            checkoutFormer(checkoutButton);
        }
    }
};


const toggleCartColour = () => {
    jsonProducts.length === 0
    ? navEl.querySelector<HTMLElement>("#cart")?.classList.remove("fullBasket")
    : navEl.querySelector<HTMLElement>("#cart")?.classList.add("fullBasket");
}

/**
 * KASSA OCH UTCHECKNING
 * 
 */

const getFormData = () => {
    return {
        customer_first_name: (document.querySelector<HTMLInputElement>("#customer_first_name")?.value || "").trim(),
        customer_last_name: (document.querySelector<HTMLInputElement>("#customer_last_name")?.value || "").trim(),
        customer_address: (document.querySelector<HTMLInputElement>("#customer_address")?.value || "").trim(),
        customer_postcode: (document.querySelector<HTMLInputElement>("#customer_postcode")?.value || "").trim(),
        customer_city: (document.querySelector<HTMLInputElement>("#customer_city")?.value || "").trim(),
        customer_email: (document.querySelector<HTMLInputElement>("#customer_email")?.value || "").trim(),
        customer_phone: (document.querySelector<HTMLInputElement>("#customer_phone")?.value || "").trim(),
    };
};


const checkoutFormer = (checkoutButton: HTMLButtonElement): void => {
    checkoutButton.addEventListener("click", () => {
        if (!productWrapperEl) return;
        
        const cartTotal = calculateCartTotal();
        
        productWrapperEl.className = "showCheckoutForm";
        
        productWrapperEl.innerHTML = `
        <form id="checkoutForm">
        <label for="customer_first_name">Förnamn:</label>
        <input type="text" id="customer_first_name" name="customer_first_name" required />
        
        <label for="customer_last_name">Efternamn:</label>
        <input type="text" id="customer_last_name" name="customer_last_name" required />
        
        <label for="customer_address">Adress:</label>
        <input type="text" id="customer_address" name="customer_address" required />
        
        <label for="customer_postcode">Postnummer:</label>
        <input type="text" id="customer_postcode" name="customer_postcode" required />
        
        <label for="customer_phone">Telefonnummer:</label>
        <input type="text" id="customer_phone" name="customer_phone" />
        
        <label for="customer_city">Ort:</label>
        <input type="text" id="customer_city" name="customer_city" required />
        
        <label for="customer_email">E-post:</label>
        <input type="email" id="customer_email" name="customer_email" required />
        
        <button type="submit">Skicka</button>
        </form>
        <div class="totalDescription">
        <h5>Totalsumma: ${cartTotal} kr</h5>
        <p>Antal varor: ${jsonProducts.length}</p>
        </div>
        `;
        
        // Dölj checkout-knappen
        checkoutButton.style.display = "none";
        
        const checkoutForm = document.querySelector<HTMLFormElement>("#checkoutForm");
        if (checkoutForm) {
            checkoutForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                
                // Hämta kunduppgifter från formuläret
                const formData = getFormData();
                
                if (
                    !formData.customer_first_name ||
                    !formData.customer_last_name ||
                    !formData.customer_address ||
                    !formData.customer_postcode ||
                    !formData.customer_city ||
                    !formData.customer_email
                ) {
                    alert("Vänligen fyll i alla obligatoriska fält.");
                    return;
                }
                
                const postcodeRegex = /^[0-9]{1,6}$/;
                if (!postcodeRegex.test(formData.customer_postcode)) {
                    alert("Postnummer måste innehålla max 6 siffror.");
                    return;
                }
                
                // Skapar en beställning med produkterna i varukorgen
                const orderItems = jsonProducts.map((product) => ({
                    product_id: product.id,
                    qty: 1, 
                    item_price: product.price,
                    item_total: product.price,
                }));
                
                const orderTotal = orderItems.reduce((sum, item) => sum + item.item_total, 0);
                
                // Skapar en ny beställning med newOrder med kundens uppgifter och produkter
                const newOrder: newOrder = {
                    customer_first_name: formData.customer_first_name,
                    customer_last_name: formData.customer_last_name,
                    customer_address: formData.customer_address,
                    customer_postcode: formData.customer_postcode,
                    customer_city: formData.customer_city,
                    customer_email: formData.customer_email,
                    customer_phone: formData.customer_phone || "", // Telefonnummer är valfritt
                    order_total: orderTotal,
                    order_items: orderItems,
                };

                try {
                    // Skicka beställningen till API:et
                    const res = await completeOrder(newOrder);

                    alert("Tack för din beställning! Ditt användarID är: " + res.data.items.find(item => item.order_id)?.order_id);
                    productWrapperEl!.innerHTML = "";
                    checkoutButton.style.display = "block";
                    
                    // Rensa varukorgen
                    jsonProducts = [];
                    localStorage.setItem("cartItems", JSON.stringify(jsonProducts));
                    renderCart();
                } catch (err) {
                    alert("Något gick fel vid skickandet av beställningen. Försök igen.");
                }
                
                toggleCartColour();
                calculateCartItems();
                renderAllProducts();
                
            });
        }
    });
};


const addCartEventListeners = (productsInCart: {product: Product, quantity: number}[]) => {
    
    const cartButton = document.querySelectorAll<HTMLButtonElement>(".cartBtn");
    if (!cartButton) {
        return
    }
    
    cartButton.forEach(button => {
        button.addEventListener("click", (e: MouseEvent) => {
            
            const target = e.target as HTMLButtonElement;
            const clickedProductId = Number(target.closest<HTMLDivElement>(".cartItem")?.dataset.productId);
            const productInCart = productsInCart
            .find(index => index.product.id === clickedProductId)! // "!" pga att ts oroar sig över att den ska vara undefined, se över
            .product;
            
            //Knapp för att öka antal av produkt
            if (target.id === "increaseBtn") {
                jsonProducts.push(productInCart);
                localStorage.setItem("cartItems", JSON.stringify(jsonProducts));
                calculateCartItems();
                renderCart();
            }
            
            //Knapp för att sänka antal av produkt
            if (target.id === "decreaseBtn") {
                const indexInJson = jsonProducts.findIndex(product => product.id === clickedProductId);
                jsonProducts.splice(indexInJson, 1);
                localStorage.setItem("cartItems", JSON.stringify(jsonProducts));
                calculateCartItems();
                renderCart();
            }
            
            //Knapp för att ta bort produkt
            if (target.id === "removeBtn"){
                jsonProducts = jsonProducts.filter(product => product.id !== clickedProductId);
                localStorage.setItem("cartItems", JSON.stringify(jsonProducts));
                calculateCartItems();
                renderCart();
            }
            
            toggleCartColour();
            calculateCartItems();
            
        });
    });
}



toggleCartColour();
getAndRenderProducts();
calculateCartItems();


