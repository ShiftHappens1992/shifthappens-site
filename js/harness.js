let cart =
    JSON.parse(
        localStorage.getItem("shiftHappensCart")
    ) || [];


const cartCount =
    document.getElementById("cart-count");


const injectorSelect =
    document.getElementById("injector-option");


const casSelect =
    document.getElementById("cas-option");


const ignitionSelect =
    document.getElementById("ignition-option");


const injectorSummary =
    document.getElementById("summary-injector");


const casSummary =
    document.getElementById("summary-cas");


const ignitionSummary =
    document.getElementById("summary-ignition");
    
const totalSummary =
    document.querySelector(
        ".summary-total span:last-child"
    );

const BASE_PRICE = 849.99;


const addButton =
    document.getElementById(
        "add-configured-harness"
    );



/* ==================================
   CART COUNT
================================== */

function updateCartCount() {

    const totalItems =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );


    cartCount.textContent =
        totalItems;

}



/* ==================================
   UPDATE CONFIGURATION DISPLAY
================================== */

function updateConfiguration() {

    injectorSummary.textContent =
        injectorSelect.value;


    if (casSelect.value === "No CAS") {

        casSummary.innerHTML =
            `No CAS Sub-Harness <span class="option-upcharge">-$50</span>`;

    } else {

        casSummary.textContent =
            casSelect.value;

    }


    if (ignitionSelect.value === "IGN-1A") {

        ignitionSummary.innerHTML =
            `IGN-1A Ignition Harness <span class="option-upcharge">+$50</span>`;

    } else {

        ignitionSummary.textContent =
            ignitionSelect.value;

    }


    let totalPrice = BASE_PRICE;


    if (casSelect.value === "No CAS") {
        totalPrice -= 50;
    }


    if (ignitionSelect.value === "IGN-1A") {
        totalPrice += 50;
    }


    totalSummary.textContent =
        `$${totalPrice.toFixed(2)}`;
}



injectorSelect.addEventListener(
    "change",
    updateConfiguration
);


casSelect.addEventListener(
    "change",
    updateConfiguration
);


ignitionSelect.addEventListener(
    "change",
    updateConfiguration
);



/* ==================================
   ADD CONFIGURED HARNESS
================================== */

addButton.addEventListener(
    "click",
    () => {


        const injector =
            injectorSelect.value;


        const cas =
            casSelect.value;


        const ignition =
            ignitionSelect.value;
            let configuredPrice = BASE_PRICE;

            if (ignition === "IGN-1A") {
              configuredPrice += 50;
            }



        /*
            Configuration is included
            in the product name so your
            current cart can display it
            without us rewriting cart.js yet.
        */

        const configuredName =
            `13B S4/S5 Haltech Elite 1500 Miata Swap Harness | Injector: ${injector} | CAS: ${cas} | Ignition: ${ignition}`;



        const existingProduct =
            cart.find(item =>
                item.name === configuredName
            );



        if (existingProduct) {

            existingProduct.quantity += 1;

        } else {

            cart.push({

                name:
                    configuredName,

                price:
                configuredPrice,

                image:
                    "images/harness.PNG",

                quantity:
                    1,

                options: {

                    injector:
                        injector,

                    cas:
                        cas,

                    ignition:
                        ignition

                }

            });

        }



        localStorage.setItem(
            "shiftHappensCart",
            JSON.stringify(cart)
        );



        updateCartCount();



        addButton.textContent =
            "ADDED TO CART ✓";



        setTimeout(() => {

            addButton.textContent =
                "ADD CONFIGURED HARNESS TO CART";

        }, 1500);

    }
);



updateConfiguration();

updateCartCount();