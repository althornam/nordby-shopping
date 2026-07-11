
const STORES={all:["Alle varer","🛒"],maximat:["MaxiMat","🥩"],gottebiten:["Gottebiten","🥤"],sbg:["SBG","🟫"],local:["Lokalt senere","📍"],home:["Har fra før","🏠"]};
let ITEMS=[],activeStore="all",hideDone=false;
const checked=JSON.parse(localStorage.getItem("nordby-checked")||"{}");
async function init(){
  ITEMS=await fetch("data/shopping-list.json").then(r=>r.json());
  const tabs=document.getElementById("tabs");
  Object.entries(STORES).forEach(([key,[label,icon]])=>{
    const b=document.createElement("button");b.textContent=`${icon} ${label}`;b.dataset.store=key;
    b.onclick=()=>{activeStore=key;renderTabs();render()};tabs.appendChild(b);
  });
  document.getElementById("search").addEventListener("input",render);
  document.getElementById("hideDone").onclick=()=>{hideDone=!hideDone;document.getElementById("hideDone").textContent=hideDone?"Vis kjøpt":"Skjul kjøpt";render()};
  document.getElementById("showAll").onclick=()=>{activeStore="all";hideDone=false;document.getElementById("search").value="";renderTabs();render();scrollTo({top:0,behavior:"smooth"})};
  document.getElementById("reset").onclick=()=>{if(confirm("Nullstille alle avkrysninger?")){Object.keys(checked).forEach(k=>delete checked[k]);localStorage.setItem("nordby-checked","{}");render()}};
  renderTabs();render();
  if("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js");
}
function renderTabs(){[...document.getElementById("tabs").children].forEach(b=>b.classList.toggle("active",b.dataset.store===activeStore))}
function render(){
  const q=document.getElementById("search").value.trim().toLowerCase();
  const filtered=ITEMS.filter(x=>(activeStore==="all"||x.store===activeStore)&&(!q||`${x.name} ${x.qty} ${x.category}`.toLowerCase().includes(q))&&(!hideDone||!checked[x.id]));
  const list=document.getElementById("list");list.innerHTML="";
  const order=["maximat","gottebiten","sbg","local","home"];
  order.forEach(store=>{
    const storeItems=filtered.filter(x=>x.store===store); if(!storeItems.length)return;
    const h=document.createElement("h2");h.className="store-title";h.textContent=`${STORES[store][1]} ${STORES[store][0]}`;list.appendChild(h);
    [...new Set(storeItems.map(x=>x.category))].forEach(cat=>{
      const c=document.createElement("div");c.className="category";c.textContent=cat;list.appendChild(c);
      storeItems.filter(x=>x.category===cat).forEach(x=>{
        const label=document.createElement("label");label.className="item"+(checked[x.id]?" done":"");
        label.innerHTML=`<input type="checkbox" ${checked[x.id]?"checked":""}><div><div class="name">${x.name}</div><div class="qty">${x.qty}</div></div>`;
        label.querySelector("input").onchange=e=>{checked[x.id]=e.target.checked;localStorage.setItem("nordby-checked",JSON.stringify(checked));render()};
        list.appendChild(label);
      });
    });
  });
  const done=ITEMS.filter(x=>checked[x.id]).length;document.getElementById("count").textContent=`${done} / ${ITEMS.length}`;document.getElementById("bar").style.width=`${done/ITEMS.length*100}%`;
}
init();
