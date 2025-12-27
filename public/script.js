const products = [
  { name: 'brahamand', domain: 'brahamand.ai', logo: 'icons/brahamand.png' },
  { name: 'connectflow', domain: 'connectflow.co.in', logo: 'icons/connectflow.png' },
  { name: 'customerzone', domain: 'customerzone.in', logo: 'icons/customerzone.png' },
  { name: 'foodfly', domain: 'foodfly.co', logo: 'icons/foodfly.png' },
  { name: 'subvivah', domain: 'subvivah.com', logo: 'icons/subvivah.png' },
  { name: 'tutorbuddy', domain: 'tutorbuddy.co', logo: 'icons/tutorbuddy.png' },
  { name: 'amenities', domain: 'amenties.rozgarhub.co', logo: 'icons/amenities.png' }
];

const statusMap = {};

async function checkStatus(product) {
  const url = `https://${product.domain}`;
  
  // For static site, use image loading to check if site is reachable
  // This works even with CORS restrictions
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => resolve('maintenance'), 5000);
    
    img.onload = () => {
      clearTimeout(timeout);
      resolve('live');
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      // Image failed, but site might still be up - try fetch with no-cors
      fetch(url, { method: 'HEAD', mode: 'no-cors' })
        .then(() => resolve('live'))
        .catch(() => resolve('maintenance'));
    };
    
    img.src = `${url}/favicon.ico?t=${Date.now()}`;
  });
}

function getStatusClass(productName) {
  const status = statusMap[productName];
  if (status === 'live') return 'status-live';
  if (status === 'maintenance') return 'status-maintenance';
  if (status === 'checking') return 'status-loading';
  return 'status-loading';
}

function getStatusText(productName) {
  const status = statusMap[productName];
  if (status === 'live') return 'Live';
  if (status === 'maintenance') return 'Maintenance';
  if (status === 'checking') return 'Checking...';
  return 'Checking...';
}

function renderProducts() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = products.map(product => `
    <div
      class="product-card ${getStatusClass(product.name)}"
      onclick="window.open('https://${product.domain}', '_blank')"
    >
      <img
        src="${product.logo}"
        alt="${product.name}"
        class="product-logo"
      />
      <div class="status-badge">
        ${getStatusText(product.name)}
      </div>
    </div>
  `).join('');
}

async function checkAllStatuses() {
  // Render products immediately with "Checking..." status
  products.forEach(product => {
    statusMap[product.name] = 'checking';
  });
  renderProducts();
  
  // Then check each status and update individually
  products.forEach(async (product) => {
    const status = await checkStatus(product);
    statusMap[product.name] = status;
    renderProducts(); // Re-render to update this product's status
  });
}

// Initial load
checkAllStatuses();

// Refresh every 30 seconds
setInterval(checkAllStatuses, 30000);

