import ReactGA from 'react-ga4';

export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-WRRBVHX7NT';

/**
 * Initialize Google Analytics 4
 */
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('GA4 Measurement ID is missing.');
    return;
  }
  try {
    const isDev = import.meta.env.DEV;
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      gtagOptions: {
        debug_mode: isDev,
      },
    });
    console.log(`GA4 initialized with ID: ${GA_MEASUREMENT_ID} (debug_mode: ${isDev})`);
  } catch (err) {
    console.error('Failed to initialize ReactGA:', err);
  }
};

// Auto-initialize GA4 at module load to prevent React useEffect race conditions
initGA();

/**
 * Track SPA Page View
 */
export const trackPageView = (path) => {
  try {
    ReactGA.send({ hitType: 'pageview', page: path });
  } catch (err) {
    console.error('Error tracking pageview:', err);
  }
};

/**
 * Format item object according to GA4 Ecommerce Schema
 */
const formatGA4Item = (product, quantity = 1) => {
  if (!product) return null;
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  const categoryName = typeof product.category === 'object' ? product.category?.name : (product.category || 'General');
  const brandName = typeof product.brand === 'object' ? product.brand?.name : (product.brand || 'Apex');
  
  return {
    item_id: String(product._id || product.id || product.sku || 'unknown_item'),
    item_name: product.name || 'Product',
    item_category: categoryName,
    item_brand: brandName,
    price: price,
    quantity: quantity,
  };
};

/**
 * Track view_item_list (Browsing Product Catalog / Shop)
 */
export const trackViewItemList = (items, listName = 'Product Catalog') => {
  if (!Array.isArray(items) || items.length === 0) return;
  try {
    const ga4Items = items.map((prod, idx) => ({
      ...formatGA4Item(prod),
      index: idx + 1,
      item_list_name: listName,
    })).filter(Boolean);

    ReactGA.event('view_item_list', {
      item_list_name: listName,
      items: ga4Items,
    });
  } catch (err) {
    console.error('Error tracking view_item_list:', err);
  }
};

/**
 * Track select_item (Clicking a Product Card)
 */
export const trackSelectItem = (product, listName = 'Product Catalog') => {
  const item = formatGA4Item(product);
  if (!item) return;
  try {
    ReactGA.event('select_item', {
      item_list_name: listName,
      items: [{ ...item, item_list_name: listName }],
    });
  } catch (err) {
    console.error('Error tracking select_item:', err);
  }
};

/**
 * Track view_item (Viewing Product Details Page)
 */
export const trackViewItem = (product) => {
  const item = formatGA4Item(product);
  if (!item) return;
  try {
    ReactGA.event('view_item', {
      currency: 'USD',
      value: item.price,
      items: [item],
    });
  } catch (err) {
    console.error('Error tracking view_item:', err);
  }
};

/**
 * Track add_to_cart
 */
export const trackAddToCart = (product, quantity = 1) => {
  const item = formatGA4Item(product, quantity);
  if (!item) return;
  try {
    ReactGA.event('add_to_cart', {
      currency: 'USD',
      value: item.price * quantity,
      items: [item],
    });
  } catch (err) {
    console.error('Error tracking add_to_cart:', err);
  }
};

/**
 * Track view_cart (Viewing Cart Page)
 */
export const trackViewCart = (cartItems, totalValue) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return;
  try {
    const items = cartItems.map(item => formatGA4Item(item.product || item, item.quantity)).filter(Boolean);
    ReactGA.event('view_cart', {
      currency: 'USD',
      value: totalValue || 0,
      items: items,
    });
  } catch (err) {
    console.error('Error tracking view_cart:', err);
  }
};

/**
 * Track remove_from_cart
 */
export const trackRemoveFromCart = (product, quantity = 1) => {
  const item = formatGA4Item(product, quantity);
  if (!item) return;
  try {
    ReactGA.event('remove_from_cart', {
      currency: 'USD',
      value: item.price * quantity,
      items: [item],
    });
  } catch (err) {
    console.error('Error tracking remove_from_cart:', err);
  }
};

/**
 * Track begin_checkout
 */
export const trackBeginCheckout = (cartItems, totalValue) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return;
  try {
    const items = cartItems.map(item => formatGA4Item(item.product || item, item.quantity)).filter(Boolean);
    ReactGA.event('begin_checkout', {
      currency: 'USD',
      value: totalValue || 0,
      items: items,
    });
  } catch (err) {
    console.error('Error tracking begin_checkout:', err);
  }
};

/**
 * Track add_shipping_info
 */
export const trackAddShippingInfo = (cartItems, totalValue, shippingTier = 'Standard Shipping') => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) return;
  try {
    const items = cartItems.map(item => formatGA4Item(item.product || item, item.quantity)).filter(Boolean);
    ReactGA.event('add_shipping_info', {
      currency: 'USD',
      value: totalValue || 0,
      shipping_tier: shippingTier,
      items: items,
    });
  } catch (err) {
    console.error('Error tracking add_shipping_info:', err);
  }
};

/**
 * Track purchase (Completed Order)
 */
export const trackPurchase = (order) => {
  if (!order || (!order._id && !order.id && !order.invoiceNumber)) {
    console.warn('Aborting trackPurchase: Invalid order payload', order);
    return;
  }

  try {
    const rawItems = Array.isArray(order.items) ? order.items : [];
    const items = rawItems.map(item => {
      const prod = item.product || item;
      return formatGA4Item(prod, item.quantity || 1);
    }).filter(Boolean);

    const totalValue = typeof order.grandTotal === 'number'
      ? order.grandTotal
      : (typeof order.totalAmount === 'number' ? order.totalAmount : 0);

    const transactionId = String(order.invoiceNumber || order._id || order.id);

    ReactGA.event('purchase', {
      transaction_id: transactionId,
      currency: 'USD',
      value: totalValue,
      tax: order.tax || 0,
      shipping: order.shippingCost || 0,
      coupon: order.couponCode || '',
      items: items,
    });
  } catch (err) {
    console.error('Error tracking purchase:', err);
  }
};
