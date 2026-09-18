let cart =
    JSON.parse(localStorage.getItem("shiftHappensCart")) || [];


const cartItems =
    document.getElementById("cart-items");

const cartCount =
    document.getElementById("cart-count");

const subtotalElement =
    document.getElementById("cart-subtotal");

const totalElement =
    document.getElementById("cart-total");

const emptyCart =
    document.getElementById("empty-cart");

const checkoutButton =
    document.getElementById("checkout-button");



/* =========================
   SAVE CART
========================= */

function saveCart() {

    localStorage.setItem(
        "shiftHappensCart",
        JSON.stringify(cart)
    );

}



/* =========================
   UPDATE CART COUNT
========================= */

function updateCartCount() {

    const totalQuantity =
        cart.reduce(
            (total, item) => total + item.quantity,
            0
        );


    cartCount.textContent = totalQuantity;

}



/* =========================
   CHANGE QUANTITY
========================= */

function changeQuantity(index, amount) {

    cart[index].quantity += amount;


    if (cart[index].quantity <= 0) {

        cart.splice(index, 1);

    }


    saveCart();

    renderCart();

}



/* =========================
   REMOVE PRODUCT
========================= */

function removeItem(index) {

    cart.splice(index, 1);


    saveCart();

    renderCart();

}



/* =========================
   RENDER CART
========================= */

function renderCart() {

    cartItems.innerHTML = "";


    /* EMPTY CART */

    if (cart.length === 0) {

        emptyCart.style.display = "block";

        subtotalElement.textContent = "$0.00";

        totalElement.textContent = "$0.00";

        checkoutButton.disabled = true;

        updateCartCount();

        return;

    }


    emptyCart.style.display = "none";

    checkoutButton.disabled = false;


    let subtotal = 0;



    cart.forEach((item, index) => {


        const itemTotal =
            item.price * item.quantity;


        subtotal += itemTotal;



        const cartItem =
            document.createElement("div");


        cartItem.classList.add("cart-item");


        cartItem.innerHTML = `

            <div class="cart-item-product">

                <div class="cart-item-image">

                    <img
                        src="${item.image}"
                        alt="${item.name}">

                </div>


                <div class="cart-item-details">

                    <p class="cart-item-category">
                        SHIFT HAPPENS
                    </p>

                    <h3>
                        ${item.name}
                    </h3>

                    <p class="cart-unit-price">
                        $${item.price.toFixed(2)}
                    </p>


                    <button
                        class="remove-item"
                        onclick="removeItem(${index})">

                        REMOVE

                    </button>

                </div>

            </div>


            <div class="cart-item-controls">

                <div class="quantity-control">

                    <button
                        onclick="changeQuantity(${index}, -1)">
                        −
                    </button>


                    <span>
                        ${item.quantity}
                    </span>


                    <button
                        onclick="changeQuantity(${index}, 1)">
                        +
                    </button>

                </div>


                <strong class="cart-item-total">

                    $${itemTotal.toFixed(2)}

                </strong>

            </div>

        `;


        cartItems.appendChild(cartItem);

    });



    subtotalElement.textContent =
        `$${subtotal.toFixed(2)}`;


    totalElement.textContent =
        `$${subtotal.toFixed(2)}`;


    updateCartCount();

}



/* =========================
   CHECKOUT
========================= */

checkoutButton.addEventListener("click", async () => {

    if (cart.length === 0) {
        return;
    }

    try {

        const response = await fetch("/create-checkout-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ cart: cart })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Checkout failed");
        }

        window.location.href = data.url;

    } catch (error) {

        console.error("Checkout error:", error);
        alert("Unable to start checkout. Please try again.");

    }

});


renderCart();