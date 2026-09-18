require("dotenv").config();

const express = require("express");
const Stripe = require("stripe");

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json());
app.use(express.static(__dirname));

app.get("/test", (req, res) => {
    res.send("Shift Happens server is running!");
});
app.post("/create-checkout-session", async (req, res) => {
    try {
        const { cart } = req.body;

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

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: lineItems,

            shipping_address_collection: {
                allowed_countries: ["US"]
            },

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