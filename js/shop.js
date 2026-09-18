let cart = JSON.parse(localStorage.getItem("shiftHappensCart")) || [];

const addButtons = document.querySelectorAll(".add-to-cart");
const cartCount = document.getElementById("cart-count");


function updateCartCount() {

    const totalItems = cart.reduce((total, item) => {
        return total + item.quantity;
    }, 0);

    cartCount.textContent = totalItems;
}


addButtons.forEach(button => {

    button.addEventListener("click", () => {

        const productName = button.dataset.name;

        const existingProduct = cart.find(item =>
            item.name === productName
        );


        if (existingProduct) {

            existingProduct.quantity += 1;

        } else {

            cart.push({

                name: productName,

                price: Number(button.dataset.price),

                image: button.dataset.image,

                quantity: 1

            });

        }


        localStorage.setItem(
            "shiftHappensCart",
            JSON.stringify(cart)
        );


        updateCartCount();


        button.textContent = "ADDED ✓";


        setTimeout(() => {

            button.textContent = "ADD TO CART";

        }, 1200);

    });

});


updateCartCount();