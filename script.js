//Global Varriables
let categories=[];
let products=[];

let currentUser={
    name:"",
    email:"",
    phone:"",
    address:""

}

let recentlyViewed =[];
let filteredProducts=[];
let cart=[];
let orders=[];
let currentOrderStaps=1;

// images get from Unplash.com 
// function for  get  data 

async function loadData(){
    try{
        const response = await fetch("data.json");
        if(!response.ok){
            throw new Error("Failed to load the data..");
        }
        const data = await response.json();
        categories=data.categories;
        products=data.products;
    
initializeApp();

    }
    
    catch(error){
        console.log("Error loading data:",error);


        document.body.innerHTML=   `<div style="text-aling:center;
        margin-top:50px;"><h2>Error loading data. Please refresh the page.
        </h2></div>`
    }
}

function initializeApp(){
    loadUserData();
    loadCardData();
    loadOrdersData();
    loadRecentlyViewed();
    // saveUserData();

    renderCategories();
    
    showPage("home");
}

document.addEventListener("DOMContentLoaded",function(){
    loadData();



});

// main function for page navigation

function showPage(pageId){
    const pages=document.querySelectorAll(".page")
    pages.forEach(page=>page.classList.add("hidden"))


    const targetPage=document.getElementById(pageId + "Page")
    if(targetPage){
        targetPage.classList.remove("hidden");
    }
// spesific page content render 

    switch(pageId){
        case"home":
        renderCategories();
        break;
        case "cart":
            renderCart();
            break;
            case "orders":
                renderOrders()
                break;
                case "account":
                    loadUserAccountPage();
                    break;
    }
}


//sideBar toggle 

function toggleSidebar(){
    const sidebar=document.querySelector(".sidebar");
    const overlay=document.querySelector(".sidebar-overlay");
   
   
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
}






//search product btn
function searchProducts(){
    const searchTerm=document.getElementById("searchInput").value.toLowerCase();
    if(searchTerm.trim()==="") return;
    filteredProducts=products.filter
    (product=>product.name.toLowerCase().includes(searchTerm)||
 product.brand.toLowerCase().includes(searchTerm)||
 product.description.toLowerCase().includes(searchTerm)

    );

    document.getElementById("categoryTitle").
    textContent=`search result for"${searchTerm}"`;
    populaterFilters();
    renderProducts();
    showPage("category");
}




function renderCategories(){
    const catogoryGird=document.getElementById("categoryGrid")
         catogoryGird.innerHTML="";

         // categories card shows 
         categories.forEach(category=>{
        const categoryCard=document.createElement("div");
        categoryCard.className="category-card";
        categoryCard.onclick=()=>showCategory(category.id);

        // create cards content
        let cardContent=
        `<img src="${category.image}"alt="${category.name}>
        <div class="category-card-content">
        <h3>${category.name}</h3>
        <p>${category.description}</p>
        `;


        if(category.isRecentlyViewed){
            // empty product so show 
            if(recentlyViewed.length===0){
                cardContent += `<p><em>No recently viewed Products</em></p>`
            }else{
                //recently viewed items count
                cardContent +=`<p> You have ${recentlyViewed.length} recently Viewed items</p>`
            }
        }

         cardContent +=`
         <a href="#" class="category-btn">View Products</a></div>`;

         
    

        categoryCard.innerHTML=cardContent;
        catogoryGird.appendChild(categoryCard);
    })
}

// all category 
function showCategory(categoryId){
          if(categoryId==="recently-viewed"){
            filteredProducts=products.filter(product=>recentlyViewed.
                includes(product.id))

                document.getElementById("categoryTitle").
            textContent="Recently Viewed Products"
          }else{
            filteredProducts=products.filter(product=>product.category===categoryId)
            const category =categories.find(cat=>cat.id==categoryId)
            document.getElementById("categoryTitle").
            textContent=category.name;
          }


          populaterFilters();
          renderProducts();
          showPage("category");
}


function populaterFilters(){
    const brandFilter=document.getElementById("brandFilter");
    const brands=[...new Set(filteredProducts.map(product=>product.brand))]
    brandFilter.innerHTML='<option value="">All Brands</option>';
    brands.forEach(brand=>{
        const option=document.createElement("option")
        option.value=brand;
        option.textContent=brand;
        brandFilter.appendChild(option);
    })
}


function applyFilters(){
    const sortBy=document.getElementById("sortBy").value;
    const maxPrice=parseInt(document.getElementById("priceRange").value);
    const selectedBrand=document.getElementById("brandFilter").value;

    document.getElementById("priceValue").textContent = +maxPrice;

    let filtered=filteredProducts.filter(product=>{
        if(product.price>maxPrice) return false;
        if(selectedBrand && product.brand !== selectedBrand)
            return false;

        return true;
    })


    switch(sortBy){
        case "price-low":
            filtered.sort((a,b)=>a.price-b.price)
            break;
            case "price-high":
                filtered.sort((a,b)=>b.price-a.price)
                break;
                case "rating":
                    filtered.sort((a,b)=>b.rating-a.rating)
                    break;
                    default:
                    break;
    }


    renderProducts(filtered);


}
applyFilters();


function renderProducts(products=filteredProducts){
    const productGrid=document.getElementById("productGrid")
    productGrid.innerHTML="";
    if(products.length===0){
        productGrid.innerHTML=`<p>No product found matching your criteria.</p>`;
        return;
    }
    products.forEach(product=>{
        const productCard=document.createElement("div");
        productCard.className="product-card";

        productCard.onclick=()=>showProduct(product.id)

        productCard.innerHTML=`
        <img src="${product.image} alt="${product.name}/>
        <div class="product-card-content">
        <div class="product-brand">${product.brand}</div>
        <h3>${product.name}</h3>
        



        <div class="product-rating">
        ${`<i class="fa-regular fa-star"></i>`.repeat(Math.floor(product.rating))}
        ${`<i class="fa-regular fa-star"></i>`.repeat(5-Math.floor(product.rating))}
        ${product.rating}
        </div>

        <div class="product-price">
        <span class="current-price">${product.price}</span>
        <span class="original-price">${product.originalPrice}</span>
        <span class="discount">${product.discount}% OFF</span>
        </div>
        </div>
        `;


        productGrid.appendChild(productCard);

    })
}



function showProduct(productId){
    const product = products.find(p=> p.id ===productId);
    if(!product) return
    if(!recentlyViewed.includes(productId)){
        recentlyViewed.unshift(productId);
        if(recentlyViewed.length>10){
            recentlyViewed.pop()
        }
        saveRecentlyViewed()
    }
    const productDetail=document.getElementById("productDetails");
    const deliveryDate=new Date();
    deliveryDate.setDate(deliveryDate.getDate()+7);
    productDetail.innerHTML=`
    <div>
    <img src="${product.image}" alt="${product.name}"
      class="product-image">
      </div>

      <div class="product-info">
      <h1>${product.name}</h1>
      <div class="brand">${product.brand}</div>
      <div class="product-rating">


       ${`<i class="fa-regular fa-star"></i>`.repeat(Math.floor(product.rating))}
        ${`<i class="fa-regular fa-star"></i>`.repeat(5-Math.floor(product.rating))}
        ${product.rating}/5
       </div>
       <div class="product-price">
       <span class="current-price"> <i class="fa-solid fa-indian-rupee-sign"></i>${product.price}</span>
       <span class="original-price"><i class="fa-solid fa-indian-rupee-sign"></i>${product.originalPrice}</span>
       <span class="discount"> <i class="fa-solid fa-indian-rupee-sign"></i>${product.discount} % OFF</span>
       </div>
       <div class="description">${product.description}</div>
        <div class="product-option">
        
        ${product.colors.length > 0 ?
                `<div class="option-group"
                <label> Color:</label>
            
                <select id="selectedColor">
                ${product.colors.map(color=>
                    `<option value="${color}">${color}</option>`
                ).join("")}
                </select>
                </div>
                `:" "
            }


        ${product.sizes.length > 0 ?
                `<div class="option-group"
                <label> Size:</label>
                <slect id="selectedSize">
                ${product.sizes.map(size=>
                    `<option value="${size}">${size}</option>`
                ).join("")}
                </select>
                </div>
                `:" "
            }
            </div>


            <div class="address-section">
            <h3>Delivery Address</h3>
            ${currentUser.address ? 
                `<p>${currentUser.address}</p>

                <button class="btn-secondary"
                onclick="showPage('account')">Change Address</button>`:`
                <p>No Address added </p>
                <button class="btn-secondary"
                onclick="showPage('account')">Add Address</button>
                `
            }
            </div>


            <div class="delivery-info">
            <h4>Delivery Information </h4>
            <p> <i class="fa-solid fa-calendar-days"></i> Delivery by ${deliveryDate.toLocaleDateString()}</p>
            <p><i class="fa-solid fa-person-walking-arrow-loop-left"></i> 10 days return policy</p>
            <p> <i class="fa-solid fa-sack-dollar"></i>Cash on Delivery available</p>
            </div>

            <div class="product-actions">
            <button class="btn-primary" onclick="addToCart(${product.id})">
            Add to</button>
            <button class="btn-secondary" onclick="buyNow(${product.id})">
            Buy Now </button>
            </div>
            </div>
    `;

    showPage("product");
}



function buyNow(productId){
    addToCart(productId);
    showPage("cart");
}


//validation of form
function validateName(name){
    const nameRages=/^[a-zA-Z\s]{2,50}$/;
    return nameRages.test(name.trim());
}
function validateEmail(email){
    const emailRages=/^[$@\@]+@[^/s@]+$/;
    return emailRages.test(email.trim());
}

function validatePhone(phone){
    const phoneRages=/^[6-9]\d{9}$/;
    return phoneRages.test(phone.trim());
}


//addCard Function 
function addToCart(productId){
        const product=products.find(p =>p.id===productId)
        if(!product) return;
        const selectedColor=document.getElementById("selectedColor")?.value || "";
        const selectedSize=document.getElementById("selectedSize")?.value || "";

        const existingItem=cart.find(item=>
            item.id ==productId &&
            item.color==selectedColor &&
            item.size==selectedSize
        )
        if(existingItem){
            existingItem.quantity +=1;
        }else{
            cart.push({
                id:productId,
                name:product.name,
                brand:product.brand,
                price:product.price,
                originalPrice:product.originalPrice,
                discount:product.discount,
                image:product.image,
                color:selectedColor,
                size:selectedSize,
                quantity:1
            })
        }
        updateCartCount();
        saveCartData();
        alert("Product added to cart!");
        renderCart();
        renderOrderSteps();
   
       
}


//renderCard detailes;
function renderCart(){
       const cartItems=document.getElementById("cartItems");
       const cartSummary=document.getElementById("cartSummary");

       if(cart.length==0){
        cartItems.innerHTML=`<p>Your cart is empty,
        <a href="#" onclick="showPage(\'home\')">
        Continue Shopping</a></p>`;
        cartSummary.innerHTML="";
        return;
       }


       cartItems.innerHTML='';
       let totalOriginal=0;
       let totalDiscounted=0;

       cart.forEach((item,index)=>{
        const itemTotal=item.price*item.quantity;
        const itemOriginalTotal=item.originalPrice*item.quantity;
        totalOriginal+=itemOriginalTotal;
        totalDiscounted += itemTotal;

        const cartItem=document.createElement("div");
        cart.className="cart-item";
        cartItem.innerHTML=`<img src="${item.image}" alt ="${item.name}"/>
        <div class="cart-item-details">
        <h3>${item.name}</h3>


        <div class="product-brand">${item.brand}</div>
        ${item.color ? `<p> Color: ${item.color}</p>`:""}
        ${item.size ? `<p> Size: ${item.size}</p>`:""}
        <div class="product-price">


        <span class="current-price"><i class="fa-solid fa-indian-rupee-sign"></i>${item.price}</span>
        <span class="original-price"><i class="fa-solid fa-indian-rupee-sign"></i>${item.originalPrice}</span>
        <span class="discount"><i class="fa-solid fa-indian-rupee-sign"></i>${item.discount}% OFF</span>
        </div>
        
        <div class="quantity-controls">
        <button class="quantity-btn"
        onclick="updateQuantity(${index}, -1)">-</button>
        <input type="number" class="quantity-input" value="${item.quantity}" min="1"
        onchange="updateQuantity(${index},0,this.value)">
        <button class="quantity-btn"
        onclick="updateQuantity(${index},1)">+</button>
        </div>


        <p> Total:<i class="fa-solid fa-indian-rupee-sign"></i> ${itemTotal}</p>
        </div>


        <button class="btn-secondary" onclick="removeFromCart(${index})">
        Remove</button>
        `;
        cartItems.appendChild(cartItem)
       })

       const deliveryCharges=totalDiscounted>500 ? 0 : 50;
       const finalTotal=totalDiscounted+deliveryCharges;

       cartSummary.innerHTML=`
       <h3>Price Details</h3>
       <div class="summary-row">
       <span>Total MRP:</span>
       <span><i class="fa-solid fa-indian-rupee-sign"></i> ${totalOriginal}</span>
       </div>
      
       <div class="summary-row">
       <span>Discount:</span>
       <span><i class="fa-solid fa-indian-rupee-sign"></i> ${totalOriginal-totalDiscounted}</span>
       </div>

       <div class="summary-row">
       <span>Delivery Charges::</span>
       <span><i class="fa-solid fa-indian-rupee-sign"></i> ${deliveryCharges ===0 ? "Free":"Rupees"*deliveryCharges}</span>
       </div>

       <div class="summary-divider"></div>
       <div class="summary-row summary-total">
       <span>Total Amount: </span>
       <span><i class="fa-solid fa-indian-rupee-sign"></i>${finalTotal}</span>
       </div>
       <button class="btn-primary" onclick="proceedToCheckout()"
       style="width:100%; margin-top:20px;">
       Place Order
       </button>
       `
}




function updateQuantity(index,change,newValue=null){
    if(newValue!==null){
        cart[index].quantity=Math.max(1,parent(newValue)|| 1)
    }
    else{
        cart[index].quantity=Math.max(1,cart[index].quantity+change)
    }
    updateCartCount();
    saveCartData();
    renderCart();
    renderOrderSteps();
}


// user details 
function renderOrderSteps(){
    const orderSteps=document.getElementById("orderSteps");

    if(currentOrderStaps===1){
        if(!currentUser.name || ! currentUser.phone || ! currentUser.address){
            orderSteps.innerHTML=`
            
            <div class="order-form">
            <h2>Step1:Enter your details</h2>
            <div class="form-group">
            <label for="orderName">Name:</label>
            <input type="text" id="orderName" value="${currentUser.name}" placeholder="Enter your name"/>
            </div>
            
            
            <div class="form-group">
            <label for="orderPhone">Phone:</label>
            <input type="tel" id="orderPhone" value="${currentUser.phone}" placeholder="Enter your phone number"/>
            </div>
            
            
            <div class="form-group">
            <label for="orderAddress">Address:</label>
            <textarea  id="orderAddress"  placeholder="Enter your  complete address...">
            ${currentUser.address}</textarea>
            </div>

            <button class="btn-primary" onclick="saveOrderDetails()">Continue to Summary </button>
            </div>
            `;

        }else{
            currentOrderStaps=2;
            renderOrderSteps()
        }
    }else if(currentOrderStaps===2){
       const cartTotal=cart.reduce((total,item)=>total+(item.price*item.quantity),0);
       const deliveryCharges=cartTotal>500? 0:50;
       const finalTotal=cartTotal+deliveryCharges;
       let cartItemsHTML ='';
       cart.forEach(item=>{
        cartItemsHTML +=`
        <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
    
        <div class="cart-item-details">
        <h3>${item.name}</h3>


        <div class="product-brand">${item.brand}</div>
        ${item.color ?`<p>Color: ${item.color}</p>`:""}
        ${item.size ?`<p>Size:: ${item.size}</p>`:""}

        <p>Quantity:${item.quantity}</p>
        <p>Price:<i class="fa-solid fa-indian-rupee-sign"></i> ${item.price * item.quantity}</p>
        </div>
        </div>
        
        `
       })


       orderSteps.innerHTML=`
       
       <div class="order-form">
       <h2>Step 2: Order Summary</h2>
       <div class="order-section">
       <h3>Delivery Address</h3>
       <p><strong>${currentUser.name}</strong></p>
       <p>${currentUser.phone}</p>
       <p>${currentUser.address}</p>
       </div>


       <h3>Order Items:</h3>
       ${cartItemsHTML}


       <div class="cart-summary">
       <div class="summary-row">
       <span> Items Total:<span>
       <span><i class="fa-solid fa-indian-rupee-sign"></i>${cartTotal}</span>
       </div>
       
       <div class="summary-row">
       <span>Delivery Charges:<span>
       <span>${deliveryCharges ===0 ? "FREE":" "+  `<i class="fa-solid fa-indian-rupee-sign"></i>`+ deliveryCharges}</span>
       </div>

       <div class="summary-divider"></div>

       <div class="summary-row summary-total">
       <span>Total Amount:</span>
       <span><i class="fa-solid fa-indian-rupee-sign"></i>${finalTotal}</span>
       </div>
       </div>


       <button class="btn-primary"
       onclick="proceedToPayment()">Proceed to Payment</button>
       </div>
       
       `;
    }else if(currentOrderStaps===3){
           orderSteps.innerHTML=`
           
           <div class="order-form">
           <h2>Step 3:Payment</h2>
           <div class="payment-options">
           <div class="payment-option">
           <input type="radio" id="upi"
           name="payment" value="upi">
           <label for="upi">UPI Payment</label>
           </div>

           <div class="payment-option">
           <input type="radio" id="card"
           name="payment" value="card">
           <label for="card">Credit/Debit Card</label>
           </div>


           <div class="payment-option">
           <input type="radio" id="cod"
           name="payment" value="cod" checked>
           <label for="cod">Cash On Delivery</label>
           </div>
    </div>


    <button class="btn-primary" onclick="placeOrder()">
    Place Order </button>
    </div>      
           `
    }
}

function validateAddress(address){
 return address.trim().length>=10;
}


function saveOrderDetails(){
    const name=document.getElementById("orderName").value.trim()
    const phone=document.getElementById("orderPhone").value.trim();
    const address=document.getElementById("orderAddress").value.trim();


    if(!name && !phone && !address){
        alert("Please fill  all required fields...");
        return;
    
    }   

if(!validateName(name)){
    alert(`please enter the valid name (2-50) charecters,letters only.`)
    return;
}
if(!validatePhone(phone)){
    alert(`please enter the valid 10 numbers of digit`);
return;
}

if(!validateAddress(address)){
    alert("Enter complet address!")
    
    return;
}
    currentUser.name=name;
    currentUser.phone=phone;
    currentUser.address=address;
    // saveUserData();
    loadUserData();
    currentOrderStaps=2;
    renderOrderSteps();

}

// user Payment 
function proceedToPayment(){
   currentOrderStaps=3;
   renderOrderSteps();
}

//check payment method
function placeOrder(){
      const paymentMethod=document.querySelector('input[name="payment"]:checked')?.value
   
      if(!paymentMethod){
        alert("Please Select a payment method..")
        return;
      }

    //   order id date and details
const orderId="ORD"+Date.now();
const orderDate=new Date();
const deliveryDate=new Date();
deliveryDate.setDate(deliveryDate.getDate() +7);

const order={
    id:orderId,
    items:[...cart],
    total:cart.reduce((total,item)=>total+(item.price * item.quantity),0),
    deliveryCharges:cart.reduce((total,item)=>total+(item.price * item.quantity),0)>500 ? 0:50,
    paymentMethod:paymentMethod,
    orderDate:orderDate,
    deliveryDate:deliveryDate,
    status:"confirmed",
    address:currentUser.address,
    phone:currentUser.phone,
    name:currentUser.name
};
orders.push(order);
saveOrdersData();

cart=[];
updateCartCount();
saveCartData();
document.getElementById("orderSteps").innerHTML=`
 <div class="order-success">
 <h1><i class="fa-solid fa-hands-clapping"></i> Order placed successfully!</h1>
 <p> Your order Id is :<strong>${orderId}</strong></p>
 <p>Expected Delivery : ${deliveryDate.toLocaleDateString()}</p>
 <button class="btn-primary" onclick="showPage('orders')">View My Orders</button>
 <button class="btn-secondary" onclick="showPage('home')">Continue Shopping</button>
 </div>
 
`
}

// order rebnders

function renderOrders(){
    const ordersList=document.getElementById("ordersList");

    if(orders.length===0){
        ordersList.innerHTML=`
        <p> No orders found.<a href="#" onclick="showPage{\'home\'}"> Start shopping </a></p>`;
        return;
    }
    ordersList.innerHTML=``;
    const sortedOrders=[...orders].sort((a,b)=> new Date(b.orderDate)
      - new Date(a.orderDate))

sortedOrders.forEach(order=>{
const currentDate=new Date();
  const isDelivery=currentDate>order.deliveryDate;

  const orderDiv=document.createElement("div");
  orderDiv.className="order-card";


let orderItmesHTML="";
order.items.forEach(item=>{
    orderItmesHTML += `
    <div class="cart-item">
    <img src="${item.image}" alt="${item.name}">
    <div class="cart-item-details">
    <h3>${item.name}</h3>
    <div class="product-brand">${item.brand}</div>
    ${item.color ? `<p> Color: ${item.color}</p>`:""}
    ${item.size ? `<p> Size: ${item.size}</p>`:""}
    <p>Quantity: ${item.quantity}</p>
    <p>Price: <i class="fa-solid fa-indian-rupee-sign"></i>${item.price}</p>
    </div>
    </div> 
    `;
})
// order details toggle   onclick 
orderDiv.innerHTML=`
<div class="order-header" onclick="toggleOrderDetails('${order.id}')">
<div class="order-summary">
<h3>Order ID: ${order.id}</h3>
<span class="status-badge ${isDelivery ? "delivered":"on-way"}>
${isDelivery ? "Delivered" : "on the way"}
</span>
</div>

<div class="order-meta">
<p><Strong>Order Date: </strong> ${order.orderDate.toLocaleDateString()}</p>
<p><Strong>Total:: </strong> ${order.total + order.deliveryCharges}</p>
<p><Strong>Items: </strong> ${order.items.length} item${order.items.length> 1?"s":""}</p>
</div>
<div class="dropdown-arrow">
<span class="arrow-icon" <i class="fa-solid fa-caret-down"></i> </span>
</div>
</div>

<div class="order-details" id="details-${order.id}" style="display:none;">
<div class="order-info">
<p><strong>Delivery Date:</strong> ${order.deliveryDate.toLocaleDateString()}</p>
<p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>

<div class="address-section">
<h4>Delivery Address:</h4>
<p>${order.name}</p>
<p>${order.phone}</p>
<p>${order.address}</p>
</div>

<h4>Order Items:</h4>
${orderItmesHTML}

<div class="cart-summary">

<div class="summary-row">
<span> Items Total:</span>
<span>${order.total}</span>
</div>


<div class="summary-row">
<span> Delivery Charges:</span>
<span>${order.deliveryCharges === 0 ?"Free":`<i class="fa-solid fa-indian-rupee-sign"></i>`+order.deliveryCharges}</span>
</div>

<div class="summary-divider"></div>

<div class="summary-row summary-total">
<span>Total Paid:</span>
<span>${order.total + order.deliveryCharges}</span>
</div>
</div>
</div>
</div>
`;

ordersList.appendChild(orderDiv);

})
}

function toggleOrderDetails(orderId){
    const detailsDiv=document.getElementById(`details-${orderId}`)
    const arrowIcon=detailsDiv.previousElementSibling.querySelector(".arrow-icon");

    if(detailsDiv.style.display==="none"){
        detailsDiv.style.display="black";
        arrowIcon.style.transform ="rotate(180deg)";
    }else{
        detailsDiv.style.display="none";
        arrowIcon.style.transform="rotate(0deg)";

    }
}



function saveOrdersData(){
localStorage.setItem["ordersData",JSON.stringify(orders)];

}


function  saveCart(){
localStorage.setItem["cartData",JSON.stringify(currentUser)];
}

function loadUserAccountPage(){
    document.getElementById("userName").value = currentUser.name || "";
    document.getElementById("userEmail").value = currentUser.email || "";
    document.getElementById("userPhone").value = currentUser.phone || "";
    document.getElementById("userAddress").value = currentUser.address || "";

}





//save user information
function saveUserInfo(){
const name=document.getElementById("userName").value.trim();
const email=document.getElementById("userEmail").value.trim();
const phone=document.getElementById("userPhone").value.trim();
const address=document.getElementById("userAddress").value.trim();
// saveUserData();
loadUserData();
alert("Information saved successfully..");

if(name && !validateName(name)){
 alert('please enter a valid name (2-50 charactors,latters only.') ;
 return;  
}

if(email && !validateEmail(email)){
    alert('please enter  a valide email address.');
    return;
}

if(phone && !validatePhone(phone)){
    alert('please enter a valide  10-digits phone numbers.');
    return;
}
if(address && !validateAddress(address)){
    alert('please enter a valid address!');
    return;
}

currentUser.name=name;
currentUser.email=email;
currentUser.phone=phone;
currentUser.address=address;



// saveUserData();
loadUserData();
alert("Information saved SuccessFully!");




}

// function saveUserData(userData) {
//   // Example: store data in localStorage or send to server
//   console.log("Saving user data:", userData);
// }


//remove Cart from index 

function removeFromCart(index){
    cart.splice(index,1);
    updateCartCount();
    saveCartData();
    renderCart();
}


function proceedToCheckout(){
    currentOrderStaps=1;
    showPage('order');
}

//update Cart count
function updateCartCount(){
    const cartCount=cart.reduce((total,item)=>total+item.quantity,0)
    document.getElementById("cartCount").textContent=cartCount;
}


//save cart data
function saveCartData(){
   localStorage.setItem("cartData",JSON.stringify(cart));
}

//save date in local strorage
function  saveRecentlyViewed(){
 localStorage.setItem("recentlyViewedData",JSON.stringify(recentlyViewed));
}



function loadUserData(){

const userData=localStorage.getItem("userData");
if(userData){
    currentUser=JSON.parse(userData);
}


}



// function loadUserData(){
//     try{
//         if(window.userData){
//             currentUser=window.userData
//         }
//     }catch(e){
//         console.log("Storage not avaailable.");
//     }
// }

function loadCardData(){
const cartData=localStorage.getItem("cartData");
if(cartData){
    cart=JSON.parse(cartData)
    updateCartCount();
}
}



// function loadCartData(){
//     try{
//         if(window.cartData){
//             cart=window.cartData;
//             updateCartCount();
//         }
//     }catch(e){
//         console.log("Storage is not available.");
//     }
// }

function loadOrdersData(){
 const ordersData=localStorage.getItem("ordersData");
 if(ordersData){
    orders=JSON.parse(ordersData);
 }
}


// function loadOrdersData(){
//     try{
//         if(window.ordersData){
//             window=window.ordersData;
//         }
//     }catch(e){
//         console.log("Storage is not available.");
//     }
// }


function loadRecentlyViewed(){
  const recentlyViewedData=localStorage.getItem("recentlyViewedData");
  if(recentlyViewedData){
    recentlyViewed=JSON.parse(recentlyViewedData);
  }
}


// function loadRecentlyViewed(){
//     try{
//         if(window.recentlyViewedData){
//             recentlyViewed=window.recentlyViewedData;
//         }

//     }catch(e){
//         console.log("Storage not available");
//     }
// }