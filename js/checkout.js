document.addEventListener("DOMContentLoaded", () => {

    const calculateButton = document.getElementById("calculate-shipping");
    const ratesBox = document.getElementById("shipping-rates");
    const continueButton = document.getElementById("continue-payment");

    let selectedShipping = null;
    let checkoutAddress = null;

    calculateButton.addEventListener("click", async () => {

        const address = {
            name: document.getElementById("shipping-name").value.trim(),
            street1: document.getElementById("shipping-street").value.trim(),
            street2: document.getElementById("shipping-street2").value.trim(),
            city: document.getElementById("shipping-city").value.trim(),
            state: document.getElementById("shipping-state").value.trim().toUpperCase(),
            zip: document.getElementById("shipping-zip").value.trim(),
            country: "US"
        };

        if (
            !address.name ||
            !address.street1 ||
            !address.city ||
            !address.state ||
            !address.zip
        ) {
            alert("Please fill out the shipping address.");
            return;
        }

        calculateButton.disabled = true;
        calculateButton.textContent = "Calculating...";
        ratesBox.innerHTML = "";
        continueButton.style.display = "none";

        selectedShipping = null;
        checkoutAddress = null;

        try {

            const response = await fetch("/shipping-rates", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    address: address
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to calculate shipping.");
            }

            if (!data.rates || data.rates.length === 0) {
                throw new Error("No shipping rates were returned.");
            }

            ratesBox.innerHTML = "<h3>Select Shipping</h3>";

            data.rates.forEach(rate => {

                const button = document.createElement("button");

                button.type = "button";

                button.textContent =
                    `${rate.carrier} ${rate.service} — $${Number(rate.rate).toFixed(2)}`;

                button.style.display = "block";
                button.style.margin = "8px 0";
                button.style.padding = "12px";
                button.style.cursor = "pointer";

                button.addEventListener("click", () => {

                    document
                        .querySelectorAll("#shipping-rates button")
                        .forEach(btn => {
                            btn.style.fontWeight = "normal";
                        });

                    button.style.fontWeight = "bold";

                    selectedShipping = rate;
                    checkoutAddress = address;

                    continueButton.style.display = "block";
                });

                ratesBox.appendChild(button);
            });

        } catch (error) {

            console.error(error);

            ratesBox.innerHTML =
                `<p>Unable to calculate shipping: ${error.message}</p>`;

        } finally {

            calculateButton.disabled = false;
            calculateButton.textContent = "Calculate Shipping";
        }
    });

    continueButton.addEventListener("click", async () => {

        if (!selectedShipping || !checkoutAddress) {
            alert("Please select a shipping option first.");
            return;
        }

        const cart =
            JSON.parse(localStorage.getItem("shiftHappensCart")) || [];

        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        continueButton.disabled = true;
        continueButton.textContent = "Loading...";

        try {

            const response = await fetch("/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    cart: cart,
                    shipping: selectedShipping,
                    address: checkoutAddress
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to create checkout session."
                );
            }

            if (!data.url) {
                throw new Error("Stripe checkout URL was not returned.");
            }

            window.location.href = data.url;

        } catch (error) {

            console.error(error);

            alert(
                "Unable to start checkout: " + error.message
            );

            continueButton.disabled = false;
            continueButton.textContent = "Continue to Payment";
        }
    });

});