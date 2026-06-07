import axios from 'axios';

const isSandbox = process.env.SSLCOMMERZ_IS_SANDBOX === 'true';
const storeId = process.env.SSLCOMMERZ_STORE_ID;
const storePasswd = process.env.SSLCOMMERZ_STORE_PASS;

const GATEWAY_URL = isSandbox
  ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
  : 'https://payment.sslcommerz.com/gwprocess/v4/api.php';

const VALIDATION_URL = isSandbox
  ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
  : 'https://payment.sslcommerz.com/validator/api/validationserverAPI.php';

export const initSSLCommerzPayment = async ({
  totalAmount,
  tranId,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  customerCity,
  customerPostcode,
}) => {
  // If store credentials are empty, run in Mock Sandbox Mode
  if (!storeId || !storePasswd) {
    console.log('SSLCommerz store credentials missing. Initiating MOCK session.');
    const backendUrl = process.env.APP_URL || 'http://localhost:5000';
    return {
      GatewayPageURL: `${backendUrl}/api/payments/mock-gateway?tranId=${tranId}&amount=${totalAmount}`,
      status: 'SUCCESS',
    };
  }

  const backendUrl = process.env.APP_URL || 'http://localhost:5000';

  const data = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePasswd,
    total_amount: totalAmount.toFixed(2),
    currency: 'BDT', // SSLCommerz defaults to BDT
    tran_id: tranId,
    success_url: `${backendUrl}/api/payments/success?tranId=${tranId}`,
    fail_url: `${backendUrl}/api/payments/fail?tranId=${tranId}`,
    cancel_url: `${backendUrl}/api/payments/cancel?tranId=${tranId}`,
    ipn_url: `${backendUrl}/api/payments/ipn`,
    cus_name: customerName,
    cus_email: customerEmail,
    cus_phone: customerPhone,
    cus_add1: customerAddress || 'N/A',
    cus_city: customerCity || 'N/A',
    cus_postcode: customerPostcode || 'N/A',
    cus_country: 'Bangladesh',
    shipping_method: 'NO',
    product_name: 'E-Commerce Purchase',
    product_category: 'Retail',
    product_profile: 'general',
  });

  try {
    const response = await axios.post(GATEWAY_URL, data.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data && response.data.status === 'SUCCESS') {
      return {
        GatewayPageURL: response.data.GatewayPageURL,
        status: 'SUCCESS',
      };
    } else {
      throw new Error(response.data.failedreason || 'Payment initialization failed');
    }
  } catch (error) {
    console.error('SSLCommerz Session Init Error:', error.message);
    throw error;
  }
};

export const validateSSLCommerzPayment = async (valId) => {
  if (!storeId || !storePasswd) {
    // Mock Validation
    return {
      status: 'VALIDATED',
      val_id: 'mock_val_id_' + Date.now(),
      amount: 0,
      card_type: 'Mock Card',
    };
  }

  try {
    const response = await axios.get(VALIDATION_URL, {
      params: {
        val_id: valId,
        store_id: storeId,
        store_passwd: storePasswd,
        format: 'json',
      },
    });

    if (
      response.data &&
      (response.data.status === 'VALID' || response.data.status === 'VALIDATED')
    ) {
      return {
        status: response.data.status,
        val_id: response.data.val_id,
        amount: parseFloat(response.data.amount),
        card_type: response.data.card_type,
        raw_response: response.data,
      };
    } else {
      throw new Error(response.data.error || 'Payment validation failed');
    }
  } catch (error) {
    console.error('SSLCommerz Validation Error:', error.message);
    throw error;
  }
};
