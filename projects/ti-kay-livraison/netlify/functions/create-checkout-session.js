const Stripe = require("stripe");

const CATALOG = {
  1: { name: "Poulet boucané", amount: 1290 },
  2: { name: "Colombo de poulet", amount: 1350 },
  3: { name: "Accras de morue", amount: 650 },
  4: { name: "Jus de maracudja", amount: 350 },
  5: { name: "Bokit gourmand", amount: 890 },
  6: { name: "Flan coco", amount: 450 }
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { Allow: "POST" }, body: JSON.stringify({ error: "Méthode non autorisée." }) };
  }
  if (!process.env.STRIPE_SECRET_KEY || !process.env.SITE_URL) {
    return { statusCode: 503, body: JSON.stringify({ error: "Paiement non configuré. Ajoutez STRIPE_SECRET_KEY et SITE_URL aux variables d’environnement Netlify." }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const customer = body.customer || {};
    const items = body.items;
    if (typeof customer.name !== "string" || customer.name.trim().length < 2 ||
        typeof customer.phone !== "string" || customer.phone.trim().length < 6 ||
        typeof customer.address !== "string" || customer.address.trim().length < 5 ||
        !Array.isArray(items) || items.length < 1 || items.length > 20) {
      return { statusCode: 400, body: JSON.stringify({ error: "Vérifiez les coordonnées de livraison et le panier." }) };
    }

    const line_items = [];
    for (const item of items) {
      const product = CATALOG[Number(item.id)];
      const quantity = Number(item.quantity);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        return { statusCode: 400, body: JSON.stringify({ error: "Un article du panier est invalide." }) };
      }
      line_items.push({
        quantity,
        price_data: {
          currency: "eur",
          unit_amount: product.amount,
          product_data: { name: product.name }
        }
      });
    }

    const siteUrl = process.env.SITE_URL.replace(/\/$/, "");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      phone_number_collection: { enabled: true },
      shipping_address_collection: { allowed_countries: ["FR", "MQ"] },
      metadata: {
        customer_name: customer.name.trim().slice(0, 100),
        delivery_phone: customer.phone.trim().slice(0, 40),
        delivery_address: customer.address.trim().slice(0, 450),
        delivery_notes: String(customer.notes || "").trim().slice(0, 450)
      },
      success_url: siteUrl + "/?payment=success&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: siteUrl + "/?payment=cancelled"
    });

    return { statusCode: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify({ url: session.url }) };
  } catch (error) {
    console.error("Stripe Checkout error:", error.message);
    return { statusCode: 500, body: JSON.stringify({ error: "Le paiement n’a pas pu être préparé. Réessayez plus tard." }) };
  }
};
