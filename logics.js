document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // STATE & DUMMY DATABASE
    // ----------------------------------------------------
    let cart = JSON.parse(localStorage.getItem("blush_cart")) || [];
    
    // Custom Hamper Builder State
    let customHamper = {
        box: { id: "box-small", name: "Small Box", price: 150, emoji: "📦" },
        filler: { id: "filler-pink", name: "Pink Shredded Paper", color: "#ffb3c6" },
        addons: []
    };

    // ----------------------------------------------------
    // SELECTORS
    // ----------------------------------------------------
    // Navigation & Auth
    const profileText = document.getElementById("profile-text");
    const userProfileBtn = document.getElementById("user-profile-btn");
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const navigationMenu = document.getElementById("navigation-menu");

    // Cart Drawer Elements
    const cartToggleBtn = document.getElementById("cart-toggle-btn");
    const closeCartDrawerBtn = document.getElementById("close-cart-drawer-btn");
    const shoppingCartOverlay = document.getElementById("shopping-cart-overlay");
    const shoppingCartDrawer = document.getElementById("shopping-cart-drawer");
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartEmptyState = document.getElementById("cart-empty-state");
    const cartCounter = document.getElementById("cart-counter");
    const cartSubtotal = document.getElementById("cart-subtotal");
    const cartGrandtotal = document.getElementById("cart-grandtotal");
    const cartGiftNote = document.getElementById("cart-gift-note");
    const cartCheckoutBtn = document.getElementById("cart-checkout-btn");

    // Product Section Selectors
    const productGrid = document.getElementById("product-list-container");

    // Workshop Builder Selectors
    const boxOptions = document.querySelectorAll('#box-options-grid .option-card');
    const fillerOptions = document.querySelectorAll('#filler-options-grid .color-card');
    const addonItems = document.querySelectorAll('#addons-list-container .addon-item');
    
    const previewBoxEmoji = document.getElementById("preview-box-emoji");
    const previewFillerPaper = document.getElementById("preview-filler-paper");
    const previewAddonsContainer = document.getElementById("preview-addons-container");
    const previewHamperTitle = document.getElementById("preview-hamper-title");
    const previewHamperSummary = document.getElementById("preview-hamper-summary");
    const previewHamperTotal = document.getElementById("preview-hamper-total");
    const addCustomHamperBtn = document.getElementById("add-custom-hamper-btn");

    // Reviews Slider Selectors
    const reviewsSliderTrack = document.getElementById("reviews-slider-track");
    const sliderPrevBtn = document.getElementById("slider-prev-btn");
    const sliderNextBtn = document.getElementById("slider-next-btn");
    const carouselDotsContainer = document.getElementById("carousel-dots-container");
    const reviewSlides = document.querySelectorAll(".review-slide");

    // ----------------------------------------------------
    // AUTHENTICATION SYNCHRONIZATION
    // ----------------------------------------------------
    function checkUserLogin() {
        const loggedInUser = localStorage.getItem("blush_username");
        const userRegisterBtn = document.getElementById("user-register-btn");
        if (loggedInUser) {
            profileText.innerText = `Hi, ${loggedInUser}`;
            if (userRegisterBtn) {
                userRegisterBtn.style.display = "none";
            }
            // If clicked, we can offer to logout
            userProfileBtn.href = "#";
            userProfileBtn.addEventListener("click", (e) => {
                e.preventDefault();
                if (confirm("Would you like to logout?")) {
                    localStorage.removeItem("blush_username");
                    window.location.reload();
                }
            });
        }
    }
    checkUserLogin();

    // ----------------------------------------------------
    // CART ENGINE
    // ----------------------------------------------------
    function saveCart() {
        localStorage.setItem("blush_cart", JSON.stringify(cart));
        updateCartUI();
    }

    function addToCart(item) {
        // Check if item already in cart
        const existingItemIndex = cart.findIndex(c => c.id === item.id);
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }
        saveCart();
        openCartDrawer();
    }

    function removeCartItem(itemId) {
        cart = cart.filter(c => c.id !== itemId);
        saveCart();
    }

    function updateQuantity(itemId, change) {
        const item = cart.find(c => c.id === itemId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeCartItem(itemId);
            } else {
                saveCart();
            }
        }
    }

    function updateCartUI() {
        // Clear all except empty message
        const cartItemElements = cartItemsContainer.querySelectorAll(".cart-item");
        cartItemElements.forEach(el => el.remove());

        let totalQty = 0;
        let totalPrice = 0;

        if (cart.length === 0) {
            cartEmptyState.style.display = "block";
        } else {
            cartEmptyState.style.display = "none";
            
            cart.forEach(item => {
                totalQty += item.quantity;
                totalPrice += item.price * item.quantity;

                const itemHTML = document.createElement("div");
                itemHTML.classList.add("cart-item");
                itemHTML.setAttribute("data-id", item.id);
                itemHTML.innerHTML = `
                    <div class="cart-item-img">
                        <img src="${item.image || 'assets/hero_showcase.png'}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <div>
                            <span class="cart-item-name">${item.name}</span>
                            <p class="cart-item-desc">${item.desc}</p>
                        </div>
                        <div class="cart-item-controls">
                            <div class="qty-selector">
                                <button class="qty-btn minus-btn" aria-label="Decrease quantity">-</button>
                                <span class="qty-val">${item.quantity}</span>
                                <button class="qty-btn plus-btn" aria-label="Increase quantity">+</button>
                            </div>
                            <span class="cart-item-price">₹${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                    </div>
                    <button class="remove-cart-item" aria-label="Remove item"><i class="fa-regular fa-trash-can"></i></button>
                `;

                // Add button listeners inside cart drawer
                itemHTML.querySelector(".plus-btn").addEventListener("click", () => updateQuantity(item.id, 1));
                itemHTML.querySelector(".minus-btn").addEventListener("click", () => updateQuantity(item.id, -1));
                itemHTML.querySelector(".remove-cart-item").addEventListener("click", () => removeCartItem(item.id));

                cartItemsContainer.appendChild(itemHTML);
            });
        }

        // Update totals
        cartCounter.innerText = totalQty;
        cartSubtotal.innerText = `₹${totalPrice.toLocaleString()}`;
        cartGrandtotal.innerText = `₹${totalPrice.toLocaleString()}`;
    }

    // Connect pre-made product catalog buttons
    if (productGrid) {
        productGrid.addEventListener("click", (e) => {
            const addBtn = e.target.closest(".add-to-cart-btn");
            if (addBtn) {
                const card = addBtn.closest(".product-card");
                const id = card.dataset.id;
                const name = card.querySelector("h3").innerText;
                const priceText = card.querySelector(".product-price").innerText;
                const price = parseInt(priceText.replace(/[₹,]/g, ''));
                const desc = card.querySelector(".product-desc").innerText;
                const image = card.querySelector(".product-img-wrapper img").src;

                addToCart({
                    id,
                    name,
                    price,
                    desc,
                    image,
                    type: "premade"
                });
            }
        });
    }

    // ----------------------------------------------------
    // CART DRAWER INTERACTIONS
    // ----------------------------------------------------
    function openCartDrawer() {
        shoppingCartOverlay.classList.add("open");
    }

    function closeCartDrawer() {
        shoppingCartOverlay.classList.remove("open");
    }

    cartToggleBtn.addEventListener("click", openCartDrawer);
    closeCartDrawerBtn.addEventListener("click", closeCartDrawer);
    shoppingCartOverlay.addEventListener("click", (e) => {
        if (e.target === shoppingCartOverlay) closeCartDrawer();
    });

    // ----------------------------------------------------
    // CUSTOM HAMPER BUILDER WORKSHOP
    // ----------------------------------------------------
    function updateHamperPreview() {
        // 1. Box Emoji & preview details
        if (customHamper.box.id === "box-small") {
            previewBoxEmoji.innerHTML = '<i class="fa-solid fa-box-open"></i>';
        } else if (customHamper.box.id === "box-medium") {
            previewBoxEmoji.innerHTML = '<i class="fa-solid fa-gift"></i>';
        } else {
            previewBoxEmoji.innerHTML = '<i class="fa-solid fa-box-tissue"></i>';
        }

        // 2. Filler Paper shred decoration
        previewFillerPaper.style.backgroundColor = customHamper.filler.color;

        // 3. Addon list preview emojis
        previewAddonsContainer.innerHTML = "";
        customHamper.addons.forEach(addon => {
            const emojiEl = document.createElement("span");
            emojiEl.classList.add("preview-addon-tag");
            emojiEl.innerText = addon.emoji;
            previewAddonsContainer.appendChild(emojiEl);
        });

        // 4. Compute Totals
        let total = customHamper.box.price;
        customHamper.addons.forEach(addon => {
            total += addon.price;
        });

        previewHamperTotal.innerText = `₹${total}`;
        previewHamperTitle.innerText = `Custom ${customHamper.box.name}`;
        
        const addonNames = customHamper.addons.map(a => a.name).join(", ");
        previewHamperSummary.innerText = `${customHamper.box.name} + ${customHamper.filler.name}` + 
            (addonNames ? ` + ${addonNames}` : "");
    }

    // Box Size Picker listener
    boxOptions.forEach(card => {
        card.addEventListener("click", () => {
            boxOptions.forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            customHamper.box = {
                id: card.dataset.id,
                name: card.dataset.name,
                price: parseInt(card.dataset.price),
                emoji: card.dataset.emoji
            };
            updateHamperPreview();
        });
    });

    // Filler Color Picker listener
    fillerOptions.forEach(card => {
        card.addEventListener("click", () => {
            fillerOptions.forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            customHamper.filler = {
                id: card.dataset.id,
                name: card.dataset.name,
                color: card.dataset.color
            };
            updateHamperPreview();
        });
    });

    // Addon list items click listeners
    addonItems.forEach(item => {
        item.addEventListener("click", () => {
            item.classList.toggle("active");
            const icon = item.querySelector(".checkbox-icon i");
            
            const addon = {
                id: item.dataset.id,
                name: item.dataset.name,
                price: parseInt(item.dataset.price),
                emoji: item.dataset.emoji
            };

            if (item.classList.contains("active")) {
                icon.classList.remove("fa-regular", "fa-square");
                icon.classList.add("fa-solid", "fa-square-check");
                customHamper.addons.push(addon);
            } else {
                icon.classList.remove("fa-solid", "fa-square-check");
                icon.classList.add("fa-regular", "fa-square");
                customHamper.addons = customHamper.addons.filter(a => a.id !== addon.id);
            }
            updateHamperPreview();
        });
    });

    // Add Custom Hamper to Bag
    addCustomHamperBtn.addEventListener("click", () => {
        let total = customHamper.box.price;
        customHamper.addons.forEach(addon => {
            total += addon.price;
        });

        const addonNames = customHamper.addons.map(a => a.emoji + " " + a.name).join(", ");
        const descString = `Filler: ${customHamper.filler.name}. Add-ons: ` + (addonNames || "None");

        const hamperProduct = {
            id: `custom-hamper-${Date.now()}`,
            name: `Custom Gifting Hamper (${customHamper.box.name})`,
            price: total,
            desc: descString,
            image: "assets/hero_showcase.png",
            type: "custom"
        };

        addToCart(hamperProduct);

        // Reset Customizer
        resetCustomizer();
    });

    function resetCustomizer() {
        customHamper = {
            box: { id: "box-small", name: "Small Box", price: 150, emoji: "📦" },
            filler: { id: "filler-pink", name: "Pink Shredded Paper", color: "#ffb3c6" },
            addons: []
        };

        // Reset grid views
        boxOptions.forEach((c, idx) => {
            if (idx === 0) c.classList.add("active");
            else c.classList.remove("active");
        });

        fillerOptions.forEach((c, idx) => {
            if (idx === 0) c.classList.add("active");
            else c.classList.remove("active");
        });

        addonItems.forEach(item => {
            item.classList.remove("active");
            const icon = item.querySelector(".checkbox-icon i");
            icon.classList.remove("fa-solid", "fa-square-check");
            icon.classList.add("fa-regular", "fa-square");
        });

        updateHamperPreview();
    }

    // Run preview once on start
    updateHamperPreview();

    // ----------------------------------------------------
    // REVIEWS CAROUSEL SLIDER
    // ----------------------------------------------------
    let currentSlide = 0;
    const dots = document.querySelectorAll(".dot");

    function showSlide(index) {
        if (index >= reviewSlides.length) currentSlide = 0;
        else if (index < 0) currentSlide = reviewSlides.length - 1;
        else currentSlide = index;

        // Slide the slider track
        reviewsSliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Update active dot
        dots.forEach(dot => dot.classList.remove("active"));
        if (dots[currentSlide]) dots[currentSlide].classList.add("active");
    }

    sliderNextBtn.addEventListener("click", () => {
        showSlide(currentSlide + 1);
        resetAutoSlider();
    });

    sliderPrevBtn.addEventListener("click", () => {
        showSlide(currentSlide - 1);
        resetAutoSlider();
    });

    dots.forEach(dot => {
        dot.addEventListener("click", () => {
            const idx = parseInt(dot.dataset.index);
            showSlide(idx);
            resetAutoSlider();
        });
    });

    // Auto sliding slider
    let autoSlideInterval = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5000);

    function resetAutoSlider() {
        clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    }

    // ----------------------------------------------------
    // WHATSAPP API CHECKOUT REDIRECTION
    // ----------------------------------------------------
    cartCheckoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Your cart is empty! Add some cute items to order.");
            return;
        }

        // WhatsApp number placeholder (representing Blush & Bows owner)
        // Format: Country Code + Phone (e.g. 919999999999 for India)
        const businessPhone = "919999999999"; 

        let message = `🎀 *NEW ORDER REQUEST - BLUSH & BOWS* 🎀\n`;
        message += `----------------------------------------\n`;
        
        // Add User Account verification if available
        const loggedInUser = localStorage.getItem("blush_username");
        if (loggedInUser) {
            message += `*Customer Name:* ${loggedInUser}\n`;
        }
        
        message += `Hello Blush & Bows! I would like to place an order for the following items:\n\n`;

        let subtotal = 0;
        cart.forEach((item, index) => {
            const itemCost = item.price * item.quantity;
            subtotal += itemCost;
            message += `*${index + 1}. ${item.name}*\n`;
            message += `   - Quantity: ${item.quantity}\n`;
            message += `   - Price: ₹${itemCost.toLocaleString()}\n`;
            if (item.type === "custom") {
                message += `   - Detail: ${item.desc}\n`;
            }
            message += `\n`;
        });

        message += `----------------------------------------\n`;
        
        // Add Custom Gift Note
        const note = cartGiftNote.value.trim();
        if (note) {
            message += `💌 *GIFT NOTE:* "${note}"\n\n`;
        }

        message += `💰 *TOTAL AMOUNT:* ₹${subtotal.toLocaleString()}\n`;
        message += `----------------------------------------\n`;
        message += `Please let me know how to proceed with payment and shipping. Thank you! 💕`;

        // Encode message for URL
        const encodedText = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${businessPhone}?text=${encodedText}`;

        // Redirect to WhatsApp chat
        window.open(whatsappURL, "_blank");
    });

    // ----------------------------------------------------
    // MOBILE MENU & RESPONSIVE SCROLLS
    // ----------------------------------------------------
    mobileMenuBtn.addEventListener("click", () => {
        navigationMenu.classList.toggle("open");
        const isOpen = navigationMenu.classList.contains("open");
        
        if (isOpen) {
            navigationMenu.style.cssText = "display: flex; flex-direction: column; position: absolute; top: 100%; left: 0; width: 100%; background: #fffdf9; padding: 2rem; border-top: 1px solid var(--border); box-shadow: var(--shadow); z-index: 99; gap: 1.5rem;";
        } else {
            navigationMenu.removeAttribute("style");
        }
    });

    // Close menu when clicking nav links on mobile
    const navLinks = navigationMenu.querySelectorAll("a");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            navigationMenu.classList.remove("open");
            navigationMenu.removeAttribute("style");
        });
    });

    // Run initial UI Sync
    updateCartUI();
});
