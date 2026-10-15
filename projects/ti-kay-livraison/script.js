const products = [
  {id:1,name:"Poulet boucané",category:"plats",price:12.90,tag:"Le préféré",rating:"4,9",description:"Poulet mariné, riz parfumé et petite sauce créole.",image:"https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=85"},
  {id:2,name:"Colombo de poulet",category:"plats",price:13.50,tag:"Tradition",rating:"4,8",description:"Un colombo parfumé, légumes fondants et riz blanc.",image:"https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=85"},
  {id:3,name:"Accras de morue",category:"snacks",price:6.50,tag:"À partager",rating:"4,9",description:"Petits beignets croustillants, relevés juste comme il faut.",image:"https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=85"},
  {id:4,name:"Jus de maracudja",category:"boissons",price:3.50,tag:"Bien frais",rating:"4,7",description:"Une boisson fruitée aux notes acidulées et ensoleillées.",image:"https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=85"},
  {id:5,name:"Bokit gourmand",category:"snacks",price:8.90,tag:"Généreux",rating:"4,8",description:"Pain doré et garniture savoureuse pour une pause complète.",image:"https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=85"},
  {id:6,name:"Flan coco",category:"desserts",price:4.50,tag:"La douceur",rating:"4,8",description:"Une douceur délicate à la noix de coco, tout simplement.",image:"https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=85"}
];
const cart = new Map();
let activeCategory = "all";
const grid = document.querySelector("#product-grid");
const search = document.querySelector("#search");
const count = document.querySelector("#cart-count");
const drawerCount = document.querySelector("#drawer-count");
const drawer = document.querySelector("#cart-drawer");
const overlay = document.querySelector("#cart-overlay");
const toast = document.querySelector("#toast");
let toastTimer;

const euro = value => value.toLocaleString("fr-FR",{style:"currency",currency:"EUR"});
function renderProducts(){
  const term = search.value.trim().toLocaleLowerCase("fr");
  const shown = products.filter(p => (activeCategory === "all" || p.category === activeCategory) && (p.name+" "+p.description).toLocaleLowerCase("fr").includes(term));
  grid.innerHTML = shown.length ? shown.map(p => `
    <article class="product-card">
      <div class="product-image"><img src="${p.image}" alt="${p.name}" loading="lazy"><span class="product-tag">${p.tag}</span></div>
      <div class="product-body"><div class="product-title-row"><h3>${p.name}</h3><span class="product-price">${euro(p.price)}</span></div>
      <p>${p.description}</p><div class="product-footer"><span class="rating"><span>★</span> ${p.rating} <span style="color:#8a9083">· note illustrative</span></span><button class="add-button" data-add="${p.id}" aria-label="Ajouter ${p.name} au panier">+</button></div></div>
    </article>`).join("") : '<div class="no-results"><h3>Aucun plat trouvé</h3><p>Essayez une autre recherche ou catégorie.</p></div>';
}
function showToast(message){
  toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(()=>toast.classList.remove("show"),2400);
}
function updateCart(){
  const totalCount = [...cart.values()].reduce((sum,item)=>sum+item.quantity,0);
  count.textContent = totalCount; drawerCount.textContent = `(${totalCount})`;
  document.querySelector("#subtotal").textContent = euro([...cart.values()].reduce((sum,item)=>sum+item.product.price*item.quantity,0));
  const items = document.querySelector("#cart-items");
  if(!cart.size){items.innerHTML='<div class="empty-cart"><span>🧺</span><h3>Votre panier est tout léger</h3><p>Ajoutez un petit quelque chose de bon.</p></div>';return;}
  items.innerHTML = [...cart.values()].map(({product,quantity})=>`
    <div class="cart-item"><img src="${product.image}" alt=""><div><h4>${product.name}</h4><small>${euro(product.price)} / pièce</small><div class="quantity"><button data-quantity="${product.id}" data-delta="-1" aria-label="Retirer un ${product.name}">−</button><span>${quantity}</span><button data-quantity="${product.id}" data-delta="1" aria-label="Ajouter un ${product.name}">+</button></div></div><span class="cart-item-price">${euro(product.price*quantity)}</span></div>`).join("");
}
function openCart(){drawer.classList.add("open");drawer.setAttribute("aria-hidden","false");overlay.hidden=false;document.body.style.overflow="hidden";document.querySelector("#close-cart").focus();}
function closeCart(){drawer.classList.remove("open");drawer.setAttribute("aria-hidden","true");overlay.hidden=true;document.body.style.overflow="";}
grid.addEventListener("click",event=>{
  const button=event.target.closest("[data-add]");if(!button)return;
  const product=products.find(p=>p.id===Number(button.dataset.add));
  const existing=cart.get(product.id);cart.set(product.id,{product,quantity:(existing?.quantity||0)+1});
  updateCart();showToast(product.name+" ajouté au panier");
});
document.querySelector("#cart-items").addEventListener("click",event=>{
  const button=event.target.closest("[data-quantity]");if(!button)return;
  const id=Number(button.dataset.quantity),item=cart.get(id);if(!item)return;
  item.quantity+=Number(button.dataset.delta);if(item.quantity<=0)cart.delete(id);else cart.set(id,item);updateCart();
});
document.querySelectorAll(".filter").forEach(button=>button.addEventListener("click",()=>{
  document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b===button));
  activeCategory=button.dataset.category;renderProducts();
}));
search.addEventListener("input",renderProducts);
document.querySelector("#open-cart").addEventListener("click",openCart);
document.querySelector("#close-cart").addEventListener("click",closeCart);
overlay.addEventListener("click",closeCart);
document.addEventListener("keydown",event=>{if(event.key==="Escape")closeCart();});
const checkoutModal = document.querySelector("#checkout-modal");
const checkoutForm = document.querySelector("#checkout-form");
const trackingPanel = document.querySelector("#tracking-panel");
function openCheckout(){
  if(!cart.size){showToast("Votre panier est vide pour le moment.");return;}
  document.querySelector("#checkout-total").textContent=document.querySelector("#subtotal").textContent;
  trackingPanel.hidden=true;checkoutForm.hidden=false;checkoutModal.hidden=false;
  document.body.style.overflow="hidden";document.querySelector("#checkout-close").focus();
}
function closeCheckout(){checkoutModal.hidden=true;document.body.style.overflow="";}
document.querySelector("#checkout").addEventListener("click",openCheckout);
document.querySelector("#checkout-close").addEventListener("click",closeCheckout);
document.querySelector("#tracking-close").addEventListener("click",()=>{closeCheckout();closeCart();});
checkoutModal.addEventListener("click",event=>{if(event.target===checkoutModal)closeCheckout();});
checkoutForm.addEventListener("submit",event=>{
  event.preventDefault();
  if(!checkoutForm.reportValidity())return;
  checkoutForm.hidden=true;trackingPanel.hidden=false;
  document.querySelector("#tracking-message").textContent="Merci "+checkoutForm.elements.name.value.trim()+" ! Votre commande de démonstration est affichée ici uniquement.";
  trackingPanel.querySelectorAll(".tracking-steps li").forEach((step,index)=>step.classList.toggle("complete",index===0));
  showToast("Commande de démonstration créée — aucun envoi réel.");
});
document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!checkoutModal.hidden)closeCheckout();});
renderProducts();updateCart();