require("dotenv").config();

const express = require("express");
const Stripe = require("stripe");
const EasyPostClient = require("@easypost/api");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const easypost = new EasyPostClient(process.env.EASYPOST_API_KEY);

app.use(express.json());
app.use(express.static(__dirname));

app.get("/test", (req, res) => {
    res.send("Shift Happens server is running!");
});
app.post("/shipping-rates", async (req, res) => {
    try {
        const { address } = req.body;

        const shipment = await easypost.Shipment.create({
            to_address: {
                name: address.name,
                street1: address.street1,
                street2: address.street2 || "",
                city: address.city,
                state: address.state,
                zip: address.zip,
                country: "US"
            },

            from_address: {
                name: "Shift Happens Motors",
                street1: "72 Dunn Dr",
                city: "Fort Rucker",
                state: "AL",
                zip: "36362",
                country: "US"
            },

            parcel: {
                length: 18,
                width: 12,
                height: 6,
                weight: 80
            }
        });

        const allowedCarriers = ["USPS", "UPS", "FedEx"];

        const rates = shipment.rates
            .filter(rate => allowedCarriers.includes(rate.carrier))
            .map(rate => ({
                id: rate.id,
                carrier: rate.carrier,
                service: rate.service,
                rate: rate.rate,
                deliveryDays: rate.delivery_days
            }));

        res.json({ rates });

    } catch (error) {
        console.error("EasyPost error:", error);

        res.status(500).json({
            error: "Unable to calculate shipping rates"
        });
    }
});
app.post("/create-checkout-session", async (req, res) => {
    try {
        const { cart, shipping, address } = req.body;
        if (!shipping || !shipping.id) {
    return res.status(400).json({
        error: "Please select a shipping option."
    });
}

        const lineItems = cart.map(item => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: "13B S4/S5 HALTECH ELITE 1500 MIATA SWAP HARNESS"
                },
                unit_amount: 84999
            },
            quantity: item.quantity
        }));
const shippingPrice = Math.round(
    parseFloat(shipping.rate) * 100
);

const taxPrice = Math.round(
    (84999 * 0.06) * cart.reduce((sum, item) => sum + item.quantity, 0)
);

lineItems.push({
    price_data: {
        currency: "usd",
        product_data: {
            name: `${shipping.carrier} ${shipping.service} Shipping`
        },
        unit_amount: shippingPrice
    },
    quantity: 1
});

lineItems.push({
    price_data: {
        currency: "usd",
        product_data: {
            name: "Sales Tax"
        },
        unit_amount: taxPrice
    },
    quantity: 1
});
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: lineItems,

            success_url: `${process.env.BASE_URL}/success.html`,
            cancel_url: `${process.env.BASE_URL}/cart.html`
        });

        res.json({ url: session.url });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Shift Happens server running at http://localhost:${PORT}`);
});