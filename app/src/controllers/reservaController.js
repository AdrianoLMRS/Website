// *Dependencies
    const path = require('path');
    require('dotenv').config({ path: path.join(__dirname, '../.env') });
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { calculateTotalPrice, validateDates } = require('../utils/reservaUtils');
    const { decodeJWT } = require('../utils/cookieUtils');

// Function to create a session when customerId exists (using customerId)
async function sessionWithId(customerId, totalPrice, checkin, checkout, adults, children, babies, paymentMethod) {
    let productName = `Reserva: ${adults} adulto(s)`;

    if (children > 0) {
        productName += `, ${children} criança(s)`;
    }

    if (babies > 0) {
        productName += `, ${babies} bebê(s);`;
    }

    const productData = {
        name: productName,
        description: `Check-In: ${checkin.toLocaleDateString('pt-BR')} || Check-Out: ${checkout.toLocaleDateString('pt-BR')}`,
    };
    
    return await stripe.checkout.sessions.create({
        payment_method_types: [paymentMethod],
        line_items: [
            {
                price_data: {
                    currency: 'brl',
                    product_data: productData,
                    unit_amount: totalPrice,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.BASE_URL}/api/set-cookies?cs={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL}/reserva/canceled`,
        metadata: {
            checkIn: checkin.toLocaleDateString('pt-BR'),
            checkOut: checkout.toLocaleDateString('pt-BR'),
            adultos: adults,
            criancas: children,
            bebes: babies,
            paymentMethod: paymentMethod,
        },
        customer: customerId,
        phone_number_collection: {
            enabled: true,
        },
        locale: 'pt', 
        custom_text: {
            submit: {
                message: `Dados : ${adults} adultos, ${children} crianças e ${babies} bebês. Check-In: ${checkin.toLocaleDateString('pt-BR')} Check-Out: ${checkout.toLocaleDateString('pt-BR')}`,
            },
        },
    });
}

// Function to create a session without customerId (normal session)
async function sessionNormal(totalPrice, checkin, checkout, adults, children, babies, paymentMethod) {
    let productName = `Reserva: ${adults} adulto(s)`;

    if (children > 0) {
        productName += `, ${children} criança(s)`;
    }

    if (babies > 0) {
        productName += `, ${babies} bebê(s);`;
    }

    const productData = {
        name: productName,
        description: `Check-In: ${checkin.toLocaleDateString('pt-BR')} || Check-Out: ${checkout.toLocaleDateString('pt-BR')}`,
    };

    return await stripe.checkout.sessions.create({
        payment_method_types: [paymentMethod],
        line_items: [
            {
                price_data: {
                    currency: 'brl',
                    product_data: productData,
                    unit_amount: totalPrice,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.BASE_URL}/api/set-cookies?cs={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL}/reserva/canceled`,
        metadata: {
            checkIn: checkin.toLocaleDateString('pt-BR'),
            checkOut: checkout.toLocaleDateString('pt-BR'),
            adultos: adults,
            criancas: children,
            bebes: babies,
            paymentMethod: paymentMethod,
        },
        customer_creation: 'always', // Always create a Stripe customer
        phone_number_collection: {
            enabled: true, // Collect phone number
        },
        locale: 'pt', // Idioma português
        custom_text: {
            submit: {
                message: `Dados : ${adults} adultos, ${children} crianças e ${babies} bebês. Check-In: ${checkin.toLocaleDateString('pt-BR')} Check-Out: ${checkout.toLocaleDateString('pt-BR')}`,
            },
        },
        
    });
}

// Controller function to handle creating a checkout session
const createCheckoutSession = async (req, res) => {
    const { checkinDate, checkoutDate, adults, children, babies, paymentMethod } = req.body;

    if (!checkinDate || !checkoutDate || !adults) {
        return res.status(400).json({ error: 'Faltam dados obrigatórios.' });
    }

    try {
        // Validate and calculate
        const { checkin, checkout, days } = validateDates(checkinDate, checkoutDate);
        const totalPrice = calculateTotalPrice(days, adults, children, babies);

        // Decode JWT and extract customerId
        let customerId = null;
        try {
            const decodedToken = decodeJWT(req, 'authToken');
            customerId = decodedToken.customerId; // Extract customerId from decoded token
        } catch (err) {
            console.log('Token invalid or missing, proceeding without customerId.\n', err);
        }

        let session;

        // If customerId exists, create session with customerId
        if (customerId) {
            session = await sessionWithId(customerId, totalPrice, checkin, checkout, adults, children, babies, paymentMethod);
        } else {
            // If no customerId, create session without it
            session = await sessionNormal(totalPrice, checkin, checkout, adults, children, babies, paymentMethod);
        }

        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating Stripe session:', error.message);
        res.status(500).json({ error: 'Falha ao criar a sessão de checkout.' });
    }
};

module.exports = { createCheckoutSession };
