document.addEventListener('DOMContentLoaded', () => {
  let appData = null;
  let activeCategory = 'all';

  // Các phần tử DOM chính
  const productGrid = document.getElementById('product-grid');
  const categoryFilters = document.getElementById('category-filters');
  const modal = document.getElementById('product-modal');
  const modalBody = document.getElementById('modal-body');
  const modalClose = document.getElementById('modal-close');
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');

  // Định dạng tiền tệ VNĐ
  const formatVND = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Tạo link Zalo chuẩn
  const getZaloLink = (phone) => {
    const cleanPhone = String(phone).replace(/\D/g, '');
    return `https://zalo.me/${cleanPhone}`;
  };

  // Khởi chạy: lấy dữ liệu từ data.json
  async function initApp() {
    try {
      const response = await fetch('./data.json');
      if (!response.ok) {
        throw new Error(`Không thể tải data.json (HTTP ${response.status})`);
      }
      appData = await response.json();

      renderBrandInfo(appData.brand);
      renderFeatures(appData.features);
      renderCategories(appData.categories);
      renderProducts(appData.products);
      renderPricing(appData.pricing, appData.brand);
      setupInteractions();
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
      productGrid.innerHTML = `
        <div class="error-box">
          <strong>Không thể đọc file data.json.</strong><br>
          Nếu bạn đang mở trực tiếp file HTML bằng giao thức <code>file://</code>, hãy chạy qua Live Server (VS Code) hoặc deploy lên Vercel để trình duyệt cho phép gọi <code>fetch('./data.json')</code>.
        </div>
      `;
    }
  }

  // 1. Đổ dữ liệu thương hiệu, Hero, Liên hệ & Footer
  function renderBrandInfo(brand) {
    const zaloUrl = getZaloLink(brand.zalo);
    const telUrl = `tel:${brand.hotline}`;

    document.title = `${brand.name} | ${brand.tagline}`;
    document.getElementById('header-logo').textContent = brand.name;
    document.getElementById('footer-logo').textContent = brand.name;
    document.getElementById('footer-tagline').textContent = `${brand.tagline} — ${brand.domain}`;
    document.getElementById('footer-copyright').textContent = brand.copyright;

    // Hero
    const heroSection = document.getElementById('hero-section');
    heroSection.style.backgroundImage = `url('${brand.heroImage}')`;
    document.getElementById('hero-tagline').textContent = brand.tagline;
    document.getElementById('hero-title').textContent = brand.heroTitle;
    document.getElementById('hero-subtitle').textContent = brand.heroSubtitle;

    // About
    document.getElementById('about-title').textContent = brand.aboutTitle;
    document.getElementById('about-desc').textContent = brand.aboutDescription;

    // Gắn link Zalo & Hotline
    ['header-zalo-btn', 'hero-zalo-btn', 'contact-zalo-btn', 'float-zalo-btn'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.href = zaloUrl;
    });

    const contactHotlineBtn = document.getElementById('contact-hotline-btn');
    if (contactHotlineBtn) {
      contactHotlineBtn.href = telUrl;
      contactHotlineBtn.textContent = `Gọi Hotline: ${brand.hotlineDisplay}`;
    }

    const floatCallBtn = document.getElementById('float-call-btn');
    if (floatCallBtn) floatCallBtn.href = telUrl;

    // Danh sách thông tin liên hệ
    document.getElementById('contact-list').innerHTML = `
      <li><strong>Website:</strong> ${brand.domain}</li>
      <li><strong>Hotline / Zalo:</strong> <a href="${telUrl}">${brand.hotlineDisplay}</a></li>
      <li><strong>Email:</strong> <a href="mailto:${brand.email}">${brand.email}</a></li>
      <li><strong>Showroom:</strong> ${brand.address}</li>
      <li><strong>Giờ mở cửa:</strong> ${brand.workingHours}</li>
    `;
  }

  // 2. Đổ danh sách giá trị cốt lõi
  function renderFeatures(features) {
    const grid = document.getElementById('features-grid');
    grid.innerHTML = features.map((item) => `
      <div class="feature-card">
        <div class="feature-icon">${item.icon}</div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
      </div>
    `).join('');
  }

  // 3. Đổ thanh lọc danh mục
  function renderCategories(categories) {
    categoryFilters.innerHTML = categories.map((cat) => `
      <button 
        class="filter-btn ${cat.id === activeCategory ? 'active' : ''}" 
        data-category="${cat.id}"
        role="tab"
        aria-selected="${cat.id === activeCategory}"
      >
        ${cat.name}
      </button>
    `).join('');
  }

  // 4. Đổ lưới sản phẩm theo danh mục đang chọn
  function renderProducts(products) {
    const filtered = activeCategory === 'all'
      ? products
      : products.filter((p) => p.category === activeCategory);

    if (filtered.length === 0) {
      productGrid.innerHTML = '<p class="loading-text">Chưa có sản phẩm nào trong danh mục này.</p>';
      return;
    }

    const zaloUrl = getZaloLink(appData.brand.zalo);

    productGrid.innerHTML = filtered.map((product) => `
      <article class="product-card" data-id="${product.id}">
        <div class="product-thumb">
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-info">
          <span class="product-cat">${product.categoryName}</span>
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price-row">
            <span class="price-current">${formatVND(product.price)}</span>
            ${product.originalPrice ? `<span class="price-old">${formatVND(product.originalPrice)}</span>` : ''}
          </div>
          <div class="product-card-footer">
            <button class="btn-card-detail" data-action="view" data-id="${product.id}">Chi tiết</button>
            <a href="${zaloUrl}" class="btn-card-zalo" target="_blank" rel="noopener" data-action="zalo">Đặt qua Zalo</a>
          </div>
        </div>
      </article>
    `).join('');
  }

  // 5. Đổ bảng giá dịch vụ
  function renderPricing(pricingList, brand) {
    const grid = document.getElementById('pricing-grid');
    const zaloUrl = getZaloLink(brand.zalo);

    grid.innerHTML = pricingList.map((plan) => `
      <div class="pricing-card ${plan.featured ? 'featured' : ''}">
        ${plan.featured ? '<span class="pricing-popular-tag">Phổ biến nhất</span>' : ''}
        <h3 class="pricing-name">${plan.name}</h3>
        <div class="pricing-price">${plan.price} <span>${plan.unit}</span></div>
        <p class="pricing-desc">${plan.description}</p>
        <ul class="pricing-list">
          ${plan.items.map((feature) => `<li>${feature}</li>`).join('')}
        </ul>
        <a href="${zaloUrl}" class="btn ${plan.featured ? 'btn-primary' : 'btn-outline'} btn-full" target="_blank" rel="noopener">
          Tư vấn gói này qua Zalo
        </a>
      </div>
    `).join('');
  }

  // 6. Mở Modal chi tiết sản phẩm
  function openProductModal(productId) {
    const product = appData.products.find((p) => p.id === productId);
    if (!product) return;

    const zaloUrl = getZaloLink(appData.brand.zalo);
    const telUrl = `tel:${appData.brand.hotline}`;

    modalBody.innerHTML = `
      <div class="modal-grid">
        <div class="modal-image-wrap">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="modal-details">
          <span class="modal-sku">Mã SP: ${product.id} • ${product.categoryName}</span>
          <h2 class="modal-title">${product.name}</h2>
          <div class="modal-price-wrap">
            <span class="modal-price">${formatVND(product.price)}</span>
            ${product.originalPrice ? `<span class="price-old">${formatVND(product.originalPrice)}</span>` : ''}
          </div>
          <p class="modal-desc">${product.description}</p>
          <ul class="modal-specs">
            <li><strong>Kích thước:</strong> ${product.dimensions}</li>
            <li><strong>Chất liệu:</strong> ${product.material}</li>
            <li><strong>Màu sắc:</strong> ${product.color}</li>
            <li><strong>Tình trạng:</strong> ${product.stock}</li>
          </ul>
          <div class="modal-actions">
            <a href="${zaloUrl}" class="btn btn-primary btn-full" target="_blank" rel="noopener">
              Đặt hàng / Tư vấn nhanh qua Zalo
            </a>
            <a href="${telUrl}" class="btn btn-outline btn-full">
              Gọi Hotline: ${appData.brand.hotlineDisplay}
            </a>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  // Đóng Modal
  function closeProductModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // 7. Gắn các sự kiện tương tác
  function setupInteractions() {
    // Lọc danh mục
    categoryFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      activeCategory = btn.dataset.category;
      renderCategories(appData.categories);
      renderProducts(appData.products);
    });

    // Click mở modal từ thẻ sản phẩm
    productGrid.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="zalo"]')) return; // Cho phép mở thẳng Zalo
      const card = e.target.closest('.product-card');
      if (card) {
        openProductModal(card.dataset.id);
      }
    });

    // Đóng modal bằng nút X, click ra ngoài hoặc phím ESC
    modalClose.addEventListener('click', closeProductModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeProductModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeProductModal();
      }
    });

    // Menu mobile
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    mainNav.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav-link')) {
        mainNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  initApp();
});