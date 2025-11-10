const productsContainer = document.getElementById('products');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentProduct = {};

async function loadProducts() {
  const res = await fetch('https://fakestoreapi.com/products');
  const products = await res.json();
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'col-md-4 mb-4';
    card.innerHTML = `
  <div class="card h-100">
    <div class="product-image-bg p-3 d-flex justify-content-center align-items-center" style="height:200px;">
      <img src="${product.image}" class="img-fluid" style="max-height:100%; object-fit:contain;">
    </div>
    <div class="card-body">
      <h5 class="card-title">${product.title}</h5>
      <p>$${product.price}</p>
      <button class="btn btn-primary" onclick='showModal(${product.id})'>Ver más 🔍</button>
    </div>
  </div>`;
    productsContainer.appendChild(card);
  });
}

function showModal(product) {
  currentProduct = product;
  document.getElementById('modalTitle').textContent = product.title;
  document.getElementById('modalImage').src = product.image;
  document.getElementById('modalDescription').textContent = product.description;
  document.getElementById('modalPrice').textContent = `$${product.price}`;
  document.getElementById('modalQuantity').value = 1;
  new bootstrap.Modal(document.getElementById('productModal')).show();
}

function addToCart() {
  const qty = parseInt(document.getElementById('modalQuantity').value);
  const item = { ...currentProduct, quantity: qty };
  cart.push(item);
  localStorage.setItem('cart', JSON.stringify(cart));
  alert('Producto añadido 🛒');
}

function toggleCart() {
  document.getElementById('cartPanel').classList.toggle('d-none');
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = '';
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `
      ${item.title} x${item.quantity} - $${item.price * item.quantity}
      <button class="btn btn-danger btn-sm" onclick="removeItem(${index})"><i class="fas fa-trash"></i></button>`;
    cartItems.appendChild(li);
  });
  cartTotal.textContent = total.toFixed(2);
}

function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
}

function showPaymentForm() {
  document.getElementById('paymentForm').classList.remove('d-none');
}

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ format: [80, 200] });
  const name = document.getElementById('name').value;
  let y = 10;
  doc.setFont('courier');
  doc.setFontSize(10);
  doc.text(`ShopMaster - Recibo 🧾`, 10, y); y += 6;
  doc.text(`Cliente: ${name}`, 10, y); y += 6;
  doc.text(`Fecha: ${new Date().toLocaleString()}`, 10, y); y += 6;
  doc.text(`------------------------`, 10, y); y += 6;
  let total = 0;
  cart.forEach(item => {
    doc.text(`${item.title.substring(0,15)} x${item.quantity}`, 10, y); y += 6;
    doc.text(`$${(item.price * item.quantity).toFixed(2)}`, 10, y); y += 6;
    total += item.price * item.quantity;
  });
  doc.text(`------------------------`, 10, y); y += 6;
  doc.text(`Total: $${total.toFixed(2)}`, 10, y); y += 6;
  doc.save('ticket.pdf');
  alert('✅ Compra realizada. Ticket generado.');
  cart = [];
  localStorage.removeItem('cart');
  renderCart();
}
loadProducts();
