(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const SAVE_KEY = "mapleLifeSaveV1";
  const initialState = {
    name: "", avatar: "🧑🏽", province: "Saskatchewan", cash: 1000, job: null, home: "starter",
    day: 1, hunger: 82, energy: 90, happiness: 76, inventory: [],
    visited: [], rentPaid: false, tasks: []
  };
  let state = loadState();
  let toastTimer;
  let currentPlace = null;
  let editingProfile = false;

  const jobs = {
    retail: { title: "Store Associate", wage: 18, place: "Maple Market" },
    cafe: { title: "Café Crew Member", wage: 17, place: "Northstar Café" },
    delivery: { title: "Delivery Rider", wage: 20, place: "City-wide" },
    office: { title: "Office Assistant", wage: 22, place: "Downtown" }
  };
  const homes = {
    starter: { title: "Starter Apartment", rent: 650, type: "Apartment", description: "A simple, comfortable place to begin your Canadian story." },
    condo: { title: "Downtown Condo", rent: 1150, type: "Condo", description: "A modern space close to downtown shops, cafés, and city life." },
    house: { title: "Suburban House", rent: 1750, type: "House", description: "A little more room, a quiet street, and a backyard to enjoy." }
  };
  const products = {
    sandwich: { name: "Sandwich", price: 12, hunger: 28, happiness: 2, icon: "🥪" },
    coffee: { name: "Hot Coffee", price: 4.5, energy: 14, happiness: 3, icon: "☕" },
    soup: { name: "Soup & Bread", price: 9, hunger: 22, happiness: 3, icon: "🍲" },
    scarf: { name: "Warm Scarf", price: 24, happiness: 8, icon: "🧣" },
    book: { name: "Paperback Book", price: 16, happiness: 7, energy: 2, icon: "📚" },
    plant: { name: "Little Houseplant", price: 18, happiness: 9, icon: "🪴" }
  };
  const places = {
    cafe: { name: "Northstar Café", type: "FOOD & DRINK", icon: "☕", description: "A cosy neighbourhood café. Grab a coffee, enjoy a snack, and take a little break.", actions: [{ label: "Buy a coffee · $4.50", action: "coffee" }, { label: "Have a sandwich · $12", action: "sandwich" }] },
    park: { name: "Evergreen Park", type: "OUTDOORS", icon: "🌲", description: "A peaceful green space with walking paths and room to enjoy the fresh Canadian air.", actions: [{ label: "Take a walk · Free", action: "walk" }, { label: "Relax on a bench · Free", action: "relax" }] },
    market: { name: "Maple Market", type: "SHOPPING", icon: "🛒", description: "Your local stop for groceries, everyday essentials, and a few treats.", actions: [{ label: "Buy a sandwich · $12", action: "sandwich" }, { label: "Browse marketplace", action: "shop" }] },
    gym: { name: "Community Centre", type: "FITNESS", icon: "🏋️", description: "A friendly place to move, unwind, and feel part of the community.", actions: [{ label: "Work out · Free", action: "workout" }, { label: "Take a break · Free", action: "relax" }] },
    library: { name: "Public Library", type: "COMMUNITY", icon: "📚", description: "Find a quiet corner, discover a new book, or spend some time learning.", actions: [{ label: "Read for a while · Free", action: "read" }, { label: "Rest · Free", action: "rest" }] },
    square: { name: "City Square", type: "DOWNTOWN", icon: "🏙️", description: "The heart of Maplewood. Take in the city, meet people, and see what's happening.", actions: [{ label: "Explore downtown · Free", action: "walk" }, { label: "Enjoy the view · Free", action: "relax" }] }
  };

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      return saved && typeof saved === "object" ? { ...initialState, ...saved } : { ...initialState };
    } catch { return { ...initialState }; }
  }
  function saveState() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* local storage may be unavailable */ }
  }
  function money(amount) {
    return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 2 }).format(amount);
  }
  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }
  function clamp(value) { return Math.max(0, Math.min(100, value)); }
  function changeNeed(key, amount) { state[key] = clamp(state[key] + amount); }
  function setText(selector, value) { const el = $(selector); if (el) el.textContent = value; }
  function render() {
    const home = homes[state.home] || homes.starter;
    setText("#sideName", state.name || "New Resident");
    setText("#sideAvatar", state.avatar);
    setText("#sideProvince", state.province || "Canada");
    setText("#topCash", money(state.cash));
    setText("#balanceStat", money(state.cash));
    setText("#jobsCash", money(state.cash));
    setText("#shopCash", money(state.cash));
    setText("#housingStat", home.title);
    setText("#housingSub", home.type + " · " + money(home.rent) + "/mo");
    setText("#careerStat", state.job ? state.job.title : "Unemployed");
    setText("#careerSub", state.job ? money(state.job.wage) + " per hour" : "Find your first job");
    setText("#dayStat", "Day " + state.day);
    setText("#seasonStat", seasonName() + " in Maplewood");
    setText("#homeTitle", home.title);
    setText("#homeDescription", home.description);
    setText("#rentValue", money(home.rent));
    setText("#homeType", home.type);
    setText("#greeting", state.name ? "A new chapter\nbegins, " + state.name + "." : "A new chapter\nbegins, today.");
    setText("#dateLabel", dateLabel());
    ["hunger", "energy", "happiness"].forEach(key => {
      setText("#" + key + "Value", Math.round(state[key]) + "%");
      const bar = $("#" + key + "Bar");
      if (bar) bar.style.width = state[key] + "%";
    });
    const mood = state.happiness >= 65 ? "Doing well ✨" : state.happiness >= 35 ? "Could use a boost" : "Needs a little care";
    setText("#moodBadge", mood);
    setText("#needTip", state.hunger < 35 ? "You're getting hungry. Pick up something to eat." : state.energy < 35 ? "You're running low on energy. Take a rest at home." : state.happiness < 35 ? "Try a walk in the park or a little treat." : "A good meal and a little rest can make all the difference.");
    setText("#topLocation", "Maplewood, Canada");
    setText("#weatherLabel", weather().label);
    setText("#weatherIcon", weather().icon);
    setText("#weatherTemp", weather().temp + "°C · " + seasonName());
    updateJobButtons();
    updateHomeButtons();
    updateTaskCards();
    saveState();
    if (!state.name) $("#welcomeModal").classList.add("open");
    else $("#welcomeModal").classList.remove("open");
  }

  function openProfileEditor() {
    editingProfile = true;
    $("#playerName").value = state.name || "";
    $("#playerProvince").value = state.province || "Saskatchewan";
    const selectedAvatar = $('input[name="avatar"][value="' + (state.avatar || "🧑🏽") + '"]');
    if (selectedAvatar) selectedAvatar.checked = true;
    $("#profileEyebrow").textContent = "YOUR CHARACTER";
    $("#profileModalTitle").textContent = "Edit your character.";
    $("#profileModalDescription").textContent = "Update your name, avatar, or home province. Your game progress will stay the same.";
    $("#profileSubmit").innerHTML = "Save character <span>→</span>";
    $(".welcome-modal").classList.add("editing");
    $("#welcomeModal").classList.add("open");
  }
  function closeProfileEditor() {
    if (!state.name) return;
    $("#welcomeModal").classList.remove("open");
    $(".welcome-modal").classList.remove("editing");
    editingProfile = false;
  }
  function seasonName() {
    const month = new Date().getMonth();
    if ([11, 0, 1].includes(month)) return "Winter";
    if ([2, 3, 4].includes(month)) return "Spring";
    if ([5, 6, 7].includes(month)) return "Summer";
    return "Autumn";
  }
  function weather() {
    const season = seasonName();
    if (season === "Winter") return { icon: "❄️", label: "Snowy skies", temp: -8 };
    if (season === "Summer") return { icon: "☀️", label: "Clear skies", temp: 24 };
    if (season === "Autumn") return { icon: "🍂", label: "Crisp & cool", temp: 9 };
    return { icon: "🌤️", label: "Partly cloudy", temp: 18 };
  }
  function dateLabel() {
    const d = new Date();
    return new Intl.DateTimeFormat("en-CA", { weekday: "long", month: "long", day: "numeric" }).format(d).toUpperCase();
  }
  function navigate(view) {
    const id = view === "home-life" ? "home-lifeView" : view + "View";
    $$(".view").forEach(el => el.classList.toggle("active-view", el.id === id));
    $$(".nav-item").forEach(el => el.classList.toggle("active", el.dataset.view === view));
    $(".sidebar").classList.remove("mobile-open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function updateJobButtons() {
    $("[data-job]").forEach(button => {
      const job = jobs[button.dataset.job];
      const isCurrent = state.job && state.job.title === job.title;
      button.textContent = isCurrent ? "Work 4-hour shift" : state.job ? "Already employed" : "Apply now";
      button.disabled = !!state.job && !isCurrent;
      button.style.opacity = button.disabled ? ".65" : "1";
    });
  }
  function updateHomeButtons() {
    $$("[data-home]").forEach(button => {
      const home = homes[button.dataset.home];
      button.textContent = state.home === button.dataset.home ? "Current home" : "Move in";
      button.disabled = state.home === button.dataset.home;
      button.style.opacity = button.disabled ? ".65" : "1";
    });
    setText("#payRentButton", state.rentPaid ? "Rent paid this month ✓" : "Pay monthly rent →");
    $("#payRentButton").disabled = state.rentPaid;
  }
  function updateTaskCards() {
    const tasks = [
      { title: "Find a job", sub: state.job ? "You're employed — nice work!" : "Start earning your own money", done: !!state.job, view: "jobs" },
      { title: "Explore downtown", sub: state.visited.includes("square") ? "You've visited City Square" : "See what's around you", done: state.visited.includes("square"), view: "city" },
      { title: "Settle into your home", sub: state.home !== "starter" ? "You've found a new home" : "Make your place feel like yours", done: state.home !== "starter", view: "home-life" }
    ];
    const list = $("#taskList");
    if (!list) return;
    list.innerHTML = tasks.map((task, i) => '<button class="task-card" data-go="' + task.view + '"><span class="task-check">' + (task.done ? "✓" : i + 1) + '</span><span><strong>' + task.title + '</strong><small>' + task.sub + '</small></span><span>→</span></button>').join("");
  }
  function earnShift() {
    if (!state.job) return;
    if (state.energy < 20) { toast("You're too tired for a shift. Get some rest first."); return; }
    const hours = 4;
    const earned = state.job.wage * hours;
    state.cash += earned;
    changeNeed("energy", -24);
    changeNeed("hunger", -12);
    changeNeed("happiness", 3);
    state.day += 1;
    state.rentPaid = false;
    render();
    toast("Shift complete! You earned " + money(earned) + " for " + hours + " hours of work.");
  }
  function buyProduct(id) {
    const item = products[id];
    if (!item) return;
    if (state.cash < item.price) { toast("Not enough money for that item."); return; }
    state.cash -= item.price;
    state.inventory.push({ id, name: item.name, icon: item.icon });
    if (item.hunger) changeNeed("hunger", item.hunger);
    if (item.energy) changeNeed("energy", item.energy);
    if (item.happiness) changeNeed("happiness", item.happiness);
    render();
    toast(item.name + " purchased. Thanks for shopping locally!");
  }
  function activity(action) {
    switch (action) {
      case "eat": buyProduct("sandwich"); return;
      case "coffee": buyProduct("coffee"); return;
      case "sandwich": buyProduct("sandwich"); return;
      case "rest": changeNeed("energy", 35); changeNeed("happiness", 2); toast("You had a good rest. Energy restored."); break;
      case "relax": changeNeed("happiness", 12); changeNeed("energy", 5); toast("That was a lovely way to unwind."); break;
      case "walk": changeNeed("happiness", 13); changeNeed("energy", -7); changeNeed("hunger", -4); toast("A refreshing walk around Maplewood!"); break;
      case "workout": changeNeed("happiness", 9); changeNeed("energy", -15); changeNeed("hunger", -8); toast("Nice workout! You feel accomplished."); break;
      case "read": changeNeed("happiness", 8); changeNeed("energy", 4); toast("A little reading time did you good."); break;
      case "shop": navigate("shop"); return;
      default: return;
    }
    render();
  }
  function openPlace(id) {
    const place = places[id];
    if (!place) return;
    currentPlace = id;
    if (!state.visited.includes(id)) state.visited.push(id);
    setText("#placeModalIcon", place.icon);
    setText("#placeModalType", place.type);
    setText("#placeModalTitle", place.name);
    setText("#placeModalDescription", place.description);
    $("#placeActions").innerHTML = place.actions.map(item => '<button class="primary-button" data-place-action="' + item.action + '">' + item.label + '</button>').join("");
    $("#placeModal").classList.add("open");
    render();
  }
  function moveHome(id) {
    const home = homes[id];
    if (!home || state.home === id) return;
    if (state.cash < home.rent) { toast("You'll need at least one month's rent (" + money(home.rent) + ") to move in."); return; }
    state.cash -= home.rent;
    state.home = id;
    state.rentPaid = true;
    render();
    toast("Welcome to your new home! First month's rent paid.");
  }
  function payRent() {
    const rent = homes[state.home].rent;
    if (state.rentPaid) return;
    if (state.cash < rent) { toast("You need " + money(rent) + " to pay your monthly rent."); return; }
    state.cash -= rent;
    state.rentPaid = true;
    render();
    toast("Monthly rent paid. Your home is all yours for now.");
  }

  document.addEventListener("click", event => {
    const nav = event.target.closest("[data-view]");
    if (nav) { navigate(nav.dataset.view); return; }
    const go = event.target.closest("[data-go]");
    if (go) { navigate(go.dataset.go); return; }
    const actionButton = event.target.closest("[data-action]");
    if (actionButton) { activity(actionButton.dataset.action); return; }
    const placeButton = event.target.closest("[data-place]");
    if (placeButton) { openPlace(placeButton.dataset.place); return; }
    const jobButton = event.target.closest("[data-job]");
    if (jobButton) {
      const job = jobs[jobButton.dataset.job];
      if (state.job && job && state.job.title === job.title) { earnShift(); return; }
      if (!job || state.job) { toast(state.job ? "You already have a job. Work a shift at your current workplace." : "That job is unavailable."); return; }
      state.job = job;
      render();
      toast("You're hired! Welcome aboard as a " + job.title + ".");
      return;
    }
    const homeButton = event.target.closest("[data-home]");
    if (homeButton) { moveHome(homeButton.dataset.home); return; }
    const buyButton = event.target.closest("[data-buy]");
    if (buyButton) { buyProduct(buyButton.dataset.buy); return; }
    const placeAction = event.target.closest("[data-place-action]");
    if (placeAction) {
      const action = placeAction.dataset.placeAction;
      $("#placeModal").classList.remove("open");
      activity(action);
      return;
    }
  });

  $("#startForm").addEventListener("submit", event => {
    event.preventDefault();
    const name = $("#playerName").value.trim();
    if (!name) { toast("Please enter your name to begin."); return; }
    state.name = name;
    state.avatar = $('input[name="avatar"]:checked')?.value || "🧑🏽";
    state.province = $("#playerProvince").value || "Saskatchewan";
    const wasEditing = editingProfile;
    editingProfile = false;
    $(".welcome-modal").classList.remove("editing");
    render();
    toast(wasEditing ? "Character updated! Your progress is safe." : "Welcome to Maplewood, " + state.name + "! Your story starts now.");
  });
  $("#editProfileButton").addEventListener("click", openProfileEditor);
  $("#closeProfileModal").addEventListener("click", closeProfileEditor);
  $("#payRentButton").addEventListener("click", payRent);
  $("#closePlace").addEventListener("click", () => $("#placeModal").classList.remove("open"));
  $("#placeModal").addEventListener("click", event => { if (event.target === $("#placeModal")) $("#placeModal").classList.remove("open"); });
  $("#welcomeModal").addEventListener("click", event => { if (event.target === $("#welcomeModal")) closeProfileEditor(); });
  $("#resetButton").addEventListener("click", () => {
    if (!window.confirm("Start over? This will erase your Maple Life save on this device.")) return;
    state = { ...initialState };
    saveState();
    render();
    navigate("home");
    $("#playerName").value = "";
    toast("A fresh start! Welcome to Maple Life.");
  });
  $("#mobileMenu").addEventListener("click", () => $(".sidebar").classList.toggle("mobile-open"));
  $("#taskList").addEventListener("click", event => {
    const button = event.target.closest("[data-go]");
    if (button) navigate(button.dataset.go);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      $("#placeModal").classList.remove("open");
      if (state.name) closeProfileEditor();
    }
  });

  function gameToast(message){const el=$("#gameToast");if(!el)return;el.textContent=message;el.classList.add("show");clearTimeout(gameToast.timer);gameToast.timer=setTimeout(()=>el.classList.remove("show"),2400);}
  function renderGameHud(){const put=(id,v)=>{const e=$("#"+id);if(e)e.textContent=v;};put("gameCash",money(state.cash));put("gameProvince",state.province||"Saskatchewan");put("gameDate","MAPLEWOOD · DAY "+state.day);[["Happy","happiness"],["Hunger","hunger"],["Energy","energy"]].forEach(([n,k])=>{put("game"+n+"Value",Math.round(state[k])+"%");const b=$("#game"+n+"Bar");if(b)b.style.width=clamp(state[k])+"%";});}
  function openGamePanel(type){const panel=$("#gamePanel"),content=$("#gamePanelContent");if(!panel||!content)return;const btn=(label,action)=>'<button class="panel-choice" data-panel-action="'+action+'">'+label+'</button>';let body="";if(type==="phone")body="<h2>📱 My phone</h2><p>Your Maple Life pocket helper.</p>"+btn("💼 Careers & jobs","jobs")+btn("🛍️ Marketplace","shop")+btn("🏠 My home","home-life")+btn("💳 Wallet & bank","wallet");else if(type==="inventory")body="<h2>🎒 Inventory</h2><p>"+(state.inventory.length?state.inventory.map(x=>x.icon+" "+x.name).join("<br>"):"Your backpack is empty. Visit the marketplace to pick up supplies.")+"</p>"+btn("Visit marketplace","shop");else if(type==="profile")body="<h2>🙂 "+(state.name||"Your character")+"</h2><p>"+(state.province||"Saskatchewan")+" · "+(state.job?state.job.title:"Unemployed")+"</p>"+btn("Edit character","profile-edit");else body="<h2>🍁 Maple Life menu</h2><p>Where would you like to go?</p>"+btn("💼 Careers & jobs","jobs")+btn("🏠 My home","home-life")+btn("🛍️ Marketplace","shop")+btn("💳 Wallet & bank","wallet")+btn("📱 Character profile","profile");content.innerHTML=body;panel.classList.add("open");}
  document.addEventListener("click",e=>{const t=e.target.closest("[data-game-panel]");if(t){openGamePanel(t.dataset.gamePanel);return;}const hot=e.target.closest("[data-hotbar]");if(hot){const a=hot.dataset.hotbar;if(a==="eat")activity("eat");else if(a==="coffee")activity("coffee");else if(a==="rest")activity("rest");else openGamePanel(a);return;}const a=e.target.closest("[data-panel-action]");if(a){const v=a.dataset.panelAction;$("#gamePanel").classList.remove("open");if(v==="profile-edit"){openProfileEditor();return;}navigate(v);}});
  $("#gamePanelClose")?.addEventListener("click",()=>$("#gamePanel").classList.remove("open"));
  document.addEventListener("maple:interact",e=>{const id=e.detail?.id;if(["jobs","home-life","shop","wallet"].includes(id)){navigate(id);gameToast("Welcome!");}else if(["cafe","park","market","library","square"].includes(id)){openPlace(id);}else if(id==="police")gameToast("Maplewood Police Station");});
  document.addEventListener("maple:game-toast",e=>gameToast(e.detail?.message||""));
  const oldRender=render;render=function(){oldRender();renderGameHud();};

  render();
  if (state.name) $("#welcomeModal").classList.remove("open");
})();