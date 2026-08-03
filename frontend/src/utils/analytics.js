import ReactGA from 'react-ga4';

export const GA_MEASUREMENT_ID = 'G-WRRBVHX7NT';

export const initGA = () => {
  try {
    ReactGA.initialize(GA_MEASUREMENT_ID);
  } catch (err) {
    console.error('Failed to initialize ReactGA:', err);
  }
};

export const trackPageView = (path) => {
  try {
    ReactGA.send({ hitType: 'pageview', page: path });
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('config', GA_MEASUREMENT_ID, { page_path: path });
    }
  } catch (err) {
    console.error('Error tracking pageview:', err);
  }
};

export const trackViewItem = (product) => {
  if (!product) return;
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  const itemData = {
    item_id: String(product._id || product.id || 'sku_123'),
    item_name: product.name || 'Product',
    price: price,
  };

  try {
    ReactGA.event('view_item', {
      currency: 'USD',
      value: price,
      items: [itemData],
    });

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'view_item', {
        currency: 'USD',
        value: price,
        items: [itemData],
      });
    }
  } catch (err) {
    console.error('Error tracking view_item:', err);
  }
};

export const trackAddToCart = (product, quantity = 1) => {
  if (!product) return;
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  const itemData = {
    item_id: String(product._id || product.id || 'sku_123'),
    item_name: product.name || 'Product',
    price: price,
    quantity: quantity,
  };

  try {
    ReactGA.event('add_to_cart', {
      currency: 'USD',
      value: price * quantity,
      items: [itemData],
    });

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: price * quantity,
        items: [itemData],
      });
    }
  } catch (err) {
    console.error('Error tracking add_to_cart:', err);
  }
};

export const trackPurchase = (order) => {
  if (!order) return;
  const items = Array.isArray(order.items) && order.items.length > 0
    ? order.items.map((item) => {
        const prod = item.product || item;
        const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || prod.price || 0;
        return {
          item_id: String(prod._id || prod.id || item._id || 'sku_123'),
          item_name: prod.name || item.name || 'Product',
          price: price,
          quantity: item.quantity || 1,
        };
      })
    : [{ item_id: 'sku_123', item_name: 'PlanPost Hoodie', price: 79.99, quantity: 1 }];

  const totalValue = typeof order.grandTotal === 'number'
    ? order.grandTotal
    : (typeof order.totalAmount === 'number' ? order.totalAmount : 79.99);

  const transactionId = String(order.invoiceNumber || order._id || order.id || 'txn_001');

  try {
    ReactGA.event('purchase', {
      transaction_id: transactionId,
      currency: 'USD',
      value: totalValue,
      items: items,
    });

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        currency: 'USD',
        value: totalValue,
        items: items,
      });
    }
  } catch (err) {
    console.error('Error tracking purchase:', err);
  }
};
