let userData = null;
const getFromStorage = async (key) => {
  if (typeof window !== "undefined") {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = new Date();

    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  }
  return null;
};

window.onload = async () => {
  const user = await getFromStorage("user");
  userData = user;
  const url = window.location.href;
  if (user) {
    console.log("User data from localStorage:", user);
    document.querySelector(".add_innerHtml").innerHTML = `
            <button class="btn btn-danger logout" >Logout</button>
          `;
    if (url.includes("login") || url.includes("signup")) {
      window.location.href = "/";
    }
  } else {
    document.querySelector(".add_innerHtml").innerHTML = `
            <a class="btn btn-warning" href="/user/login">Login</a>
          `;
    console.log("No user data found in localStorage.");
  }
  if (window.location.pathname === "/product/cart") {
    fetchCartData();
  }
};
setTimeout(() => {
  document.querySelector(".logout").onclick = () => {
    logout();
  };
}, 1000);
const logout = async () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }
  window.location.href = "/";
};

const fetchCartData = async () => {
  try {
    const response = await fetch("/product/cart/data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${userData.accessToken}`,
      },
    });
    const data = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch cart data");
    }

    if (data.cartItems.length === 0) {
      document.querySelector(".cart_body").innerHTML = "No items found in cart";
      document.querySelector(".total_price").innerHTML = "Total Price: 0 Rs";
      return;
    }
    let clutter = "";
    let totalPrice = 0;
    data.cartItems.forEach((item) => {
      totalPrice += item.product.price * item.quantity;
      clutter += `<div class="p-3 d-flex justify-content-between align-items-center cart_product">
          <div style="width: 100px;height: 100px; background-color: aquamarine;"><img src="${item.product.image}"
              style="width: 100%;height: 100%;" alt=""></div>
          <div style="width: 70%;height: 100px;" class="d-flex flex-column justify-content-start ">
            <div class="cart_product_name">${item.product.title || "title"}</div>
            <div class="cart_product_price">${item.product.price || "Price"}Rs</div>
            <div class="d-flex gap-2"><span style="cursor: pointer;" class="reduce_count" data-productId=${
              item.product.id
            } >-</span><span>${item.quantity}</span><span style="cursor: pointer;" class="add_count" data-productId=${
        item.product.id
      }>+</span></div>
          </div>
          <button class="remove_item" data-productId=${item.product.id}>Remove Item</button>
        </div>`;
    });

    document.querySelector(".cart_body").innerHTML = clutter;

    document.querySelector(".total_price").innerHTML = `Total Price: ${totalPrice} Rs`;

    document.querySelectorAll(".reduce_count").forEach((red) => {
      red.addEventListener("click", async (e) => {
        console.log("Reduce count clicked");

        const productId = e.target.getAttribute("data-productId");
        updateCartItem(productId, false);
      });
    });
    document.querySelectorAll(".add_count").forEach((red) => {
      red.addEventListener("click", async (e) => {
        console.log("add count clicked");
        const productId = e.target.getAttribute("data-productId");
        updateCartItem(productId, true);
      });
    });

    document.querySelectorAll(".remove_item").forEach((red) => {
      red.addEventListener("click", async (e) => {
        console.log("remove item clicked");
        const productId = e.target.getAttribute("data-productId");
        removeItemFromCart(productId);
      });
    });

    console.log("Cart Data:", data);
  } catch (error) {
    console.error("Error fetching cart data:", error);
  }
};

const updateCartItem = async (productId, isIncrement) => {
  try {
    const response = await fetch(`/product/cart/update`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${userData.accessToken}`,
      },
      body: JSON.stringify({
        productId: productId,
        isIncrement: isIncrement,
      }),
    });
    const data = await response.json();
    if (data.success) {
      fetchCartData();
    } else {
      console.error("Failed to reduce item quantity:", data.message);
    }
  } catch (error) {
    console.error("Error reducing item quantity:", error);
  }
};


const removeItemFromCart = async (productId) => {
  try {
    
    const response = await fetch(`/product/cart/remove/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${userData.accessToken}`,
      }
    });
    const data = await response.json();
    if (data.success) {
      fetchCartData();
    } else {
      console.error("Failed to remove item from cart:", data.message);
    }
  } catch (error) {
    console.error("Error removing item from cart:", error);
  }
}