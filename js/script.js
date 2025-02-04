let draggedElement = null;
let placeholder = null;
let productCount = 0;
let offsetX = 0;
let offsetY = 0;
const MAX_PRODUCTS = 3;

const cart = document.querySelector('.cart__products');
const button = document.querySelector('.button');

document.querySelectorAll('.rack__product').forEach(product => {
	product.addEventListener('mousedown', startDragHandler);
	product.addEventListener('touchstart', startDragHandler, { passive: false });
});

function startDragHandler(event) {
	event.preventDefault();
	draggedElement = event.currentTarget;
	const rect = draggedElement.getBoundingClientRect();
	const isTouch = event.type === 'touchstart';
	const position = getEventPosition(event);

	offsetX = position.x - rect.left;
	offsetY = position.y - rect.top;

	createPlaceholder();

	draggedElement.style.position = 'fixed';
	draggedElement.style.zIndex = '1000';
	draggedElement.style.pointerEvents = 'none';
	draggedElement.style.transform = 'none';
	draggedElement.style.left = `${rect.left}px`;
	draggedElement.style.top = `${rect.top}px`;

	const moveEvent = isTouch ? 'touchmove' : 'mousemove';
	const endEvent = isTouch ? 'touchend' : 'mouseup';

	document.addEventListener(
		moveEvent,
		moveDragHandler,
		isTouch ? { passive: false } : false
	);
	document.addEventListener(endEvent, endDragHandler, { once: true });
}

function moveDragHandler(event) {
	if (event.type === 'touchmove') {
		event.preventDefault();
	}
	if (!draggedElement) return;
	const position = getEventPosition(event);
	moveElementToPosition(draggedElement, position.x, position.y);
}

function endDragHandler(event) {
	const position = getEventPosition(event);
	const isDroppedInCart = checkIfInCart(position);
	if (isDroppedInCart) {
		addProductToCart();
	} else {
		resetDraggedElement();
	}
}

function getEventPosition(event) {
	if (event.type.startsWith('touch')) {
		const touch = event.touches[0] || event.changedTouches[0];
		return { x: touch.clientX, y: touch.clientY };
	}
	return { x: event.clientX, y: event.clientY };
}

function moveElementToPosition(element, x, y) {
	requestAnimationFrame(() => {
		element.style.left = `${x - offsetX}px`;
		element.style.top = `${y - offsetY}px`;
		element.style.transition = 'none';
	});
}

function createPlaceholder() {
	placeholder = document.createElement('div');
	placeholder.style.width = `${draggedElement.offsetWidth}px`;
	placeholder.style.height = `${draggedElement.offsetHeight}px`;
	placeholder.style.backgroundColor = 'transparent';
	placeholder.classList.add('placeholder');
	draggedElement.parentNode.insertBefore(placeholder, draggedElement);
}

function resetDraggedElement() {
	draggedElement.style.position = '';
	draggedElement.style.zIndex = '';
	draggedElement.style.pointerEvents = '';
	draggedElement.style.transform = '';
	if (placeholder) {
		placeholder.replaceWith(draggedElement);
		placeholder = null;
	}
	draggedElement = null;
}

function addProductToCart() {
	if (!draggedElement || productCount >= MAX_PRODUCTS) return;
	const productImageSrc = draggedElement.querySelector('img').src;
	const productType = draggedElement.dataset.type;
	const cartProduct = document.createElement('img');
	cartProduct.src = productImageSrc;
	cartProduct.alt = 'product';
	cartProduct.classList.add('cart__product-image', `cart__product--${productType}`);
	cart.appendChild(cartProduct);

	productCount++;
	draggedElement.classList.add('hidden');

	if (productCount >= MAX_PRODUCTS) {
		button.classList.add('button--active');
		lockProducts();
	}
	resetDraggedElement();
}

function lockProducts() {
	document.querySelectorAll('.rack__product').forEach(product => {
		product.style.pointerEvents = 'none';
	});
}

function checkIfInCart(position) {
	const cartRect = cart.getBoundingClientRect();
	return (
		position.x >= cartRect.left - 20 &&
		position.x <= cartRect.right + 20 &&
		position.y >= cartRect.top - 70 &&
		position.y <= cartRect.bottom + 20
	);
}

document.addEventListener('click', (event) => {
	const button = event.target.closest('.button');
	if (button) {
		button.classList.toggle('button--lock');
		button.textContent = "Оплачено";
		button.disabled = true;
	}
});
