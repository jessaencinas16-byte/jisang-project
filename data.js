



const CURRENCY = '₱';

const USERS = [
  { id: 'u1', name: 'Jezel Dela Cruz', email: 'owner@brewpos.com', pass: 'owner123', role: 'Owner', color: '#6F4E37' },
  { id: 'u2', name: 'Jelyn Balidoy', email: 'admin@brewpos.com', pass: 'admin123', role: 'Admin', color: '#7C3AED' },
  { id: 'u3', name: 'Lucky Dagta', email: 'manager@brewpos.com', pass: 'manager123', role: 'Manager', color: '#0EA5E9' },
  { id: 'u4', name: 'Jessa Encinas', email: 'cashier@brewpos.com', pass: 'cashier123', role: 'Cashier', color: '#F59E0B' },
  { id: 'u5', name: 'Arfaxad Mabilin', email: 'barista@brewpos.com', pass: 'barista123', role: 'Barista', color: '#22C55E' },
  { id: 'u6', name: 'Maria Fatima Macasinag', email: 'inventory@brewpos.com', pass: 'inventory123', role: 'Inventory Staff', color: '#EF4444' },
  { id: 'u7', name: 'Yesha Principe', email: 'accountant@brewpos.com', pass: 'accountant123', role: 'Accountant', color: '#0EA5A4' },
];

const ROLE_PERMISSIONS = {
  'Owner':        ['dashboard','pos','orders','customers','reports','users','settings','activity'],
  'Admin':        ['dashboard','pos','orders','menu','inventory','customers','promotions','reports','users','settings','kitchen','activity'],
  'Manager':      ['dashboard','pos','orders','menu','inventory','customers','promotions','reports','settings','kitchen'],
  'Cashier':      ['dashboard','pos','orders','customers','promotions'],
  'Barista':      ['kitchen','orders','dashboard'],
  'Inventory Staff': ['dashboard','inventory','menu','orders'],
  'Accountant':   ['dashboard','orders','customers','reports','activity'],
};

const CATEGORIES = ['Coffee','Espresso','Latte','Cappuccino','Mocha','Milk Tea','Frappes','Smoothies','Pastries','Cakes','Sandwiches'];

const IMG = (id, w=400) => `https://images.unsplash.com/${id}?w=${w}&h=${w}&fit=crop&auto=format&q=80`;

const PRODUCTS = [
  
{ id:'p1', cat:'Coffee', name:'Classic Brew', price:80, sizePrices:{S:60,M:80,L:95}, emoji:'☕', img:IMG('photo-1509042239860-f550ce710b93'), popular:true, available:true, desc:'Slow-brewed house blend' },
  { id:'p2', cat:'Coffee', name:'Barako Strong', price:95, sizePrices:{S:75,M:95,L:110}, emoji:'🫘', img:IMG('photo-1447933601403-0c6688de566e'), popular:false, available:true, desc:'Bold Filipino Barako beans' },
  { id:'p3', cat:'Coffee', name:'Americano', price:85, sizePrices:{S:65,M:85,L:100}, emoji:'🥃', img:IMG('photo-1495474472287-4d71bcdd2085'), new:true, available:true, desc:'Espresso + hot water' },
  
  { id:'p4', cat:'Espresso', name:'Espresso Shot', price:70, sizePrices:{S:55,M:70,L:85}, emoji:'⚡', img:IMG('photo-1514432324607-a09d9b4aefdd'), popular:true, available:true, desc:'Double shot, intense' },
  { id:'p5', cat:'Espresso', name:'Espresso Macchiato', price:90, sizePrices:{S:70,M:90,L:105}, emoji:'☕', img:IMG('photo-1510591509098-f4fdc6d0ff04'), available:true, desc:'Espresso with milk foam' },
  { id:'p6', cat:'Espresso', name:'Affogato', price:120, sizePrices:{S:100,M:120,L:140}, emoji:'🍨', img:IMG('photo-1563805042-7684c019e1cb'), available:false, desc:'Espresso over vanilla gelato' },
  
  { id:'p7', cat:'Latte', name:'Classic Latte', price:110, sizePrices:{S:90,M:110,L:130}, emoji:'🥛', img:IMG('photo-1541167760496-1628856ab772'), popular:true, available:true, desc:'Smooth & creamy' },
  { id:'p8', cat:'Latte', name:'Vanilla Latte', price:120, sizePrices:{S:100,M:120,L:140}, emoji:'🍦', img:IMG('photo-1461023058943-07fcbe16d735'), popular:true, available:true, desc:'With vanilla syrup' },
  { id:'p9', cat:'Latte', name:'Hazelnut Latte', price:125, sizePrices:{S:105,M:125,L:145}, emoji:'🌰', img:IMG('photo-1518479937681-03319e1e1e9a'), available:true, desc:'Toasty hazelnut flavor' },
  { id:'p10', cat:'Latte', name:'Caramel Latte', price:125, sizePrices:{S:105,M:125,L:145}, emoji:'🍮', img:IMG('photo-1570968915860-54d5c301fa9f'), available:true, desc:'Rich caramel drizzle' },
  { id:'p11', cat:'Latte', name:'Coconut Latte', price:130, sizePrices:{S:110,M:130,L:150}, emoji:'🥥', img:IMG('photo-1515823064-d6e0c04616a7'), new:true, available:true, desc:'Tropical coconut milk' },
  
  { id:'p12', cat:'Cappuccino', name:'Classic Cappuccino', price:105, sizePrices:{S:85,M:105,L:125}, emoji:'☕', img:IMG('photo-1572442388796-11668a67e53d'), popular:true, available:true, desc:'Equal parts espresso, milk, foam' },
  { id:'p13', cat:'Cappuccino', name:'Cinnamon Cappuccino', price:120, sizePrices:{S:100,M:120,L:140}, emoji:'🍂', img:IMG('photo-1507133750040-4a8f57021571'), available:true, desc:'Dusted with cinnamon' },
  
  { id:'p14', cat:'Mocha', name:'Classic Mocha', price:125, sizePrices:{S:105,M:125,L:145}, emoji:'🍫', img:IMG('photo-1544787219-7f47ccb76574'), popular:true, available:true, desc:'Chocolate + espresso' },
  { id:'p15', cat:'Mocha', name:'White Mocha', price:130, sizePrices:{S:110,M:130,L:150}, emoji:'🤍', img:IMG('photo-1513483460609-1c8a505ea990'), available:true, desc:'White chocolate mocha' },
  { id:'p16', cat:'Mocha', name:'Peppermint Mocha', price:135, sizePrices:{S:115,M:135,L:155}, emoji:'🍃', img:IMG('photo-1497534446932-c925b458314e'), new:true, available:true, desc:'Seasonal holiday favorite' },
  
  { id:'p17', cat:'Milk Tea', name:'Classic Milk Tea', price:95, sizePrices:{S:75,M:95,L:115}, emoji:'🧋', img:IMG('photo-1558857563-b371033873b8'), popular:true, available:true, desc:'With tapioca pearls' },
  { id:'p18', cat:'Milk Tea', name:'Taro Milk Tea', price:105, sizePrices:{S:85,M:105,L:125}, emoji:'🟣', img:IMG('photo-1556679343-c7306c1976bc'), available:true, desc:'Creamy taro flavor' },
  { id:'p19', cat:'Milk Tea', name:'Matcha Milk Tea', price:115, sizePrices:{S:95,M:115,L:135}, emoji:'🍵', img:IMG('photo-1515823064-d6e0c04616a7'), available:true, desc:'Ceremonial matcha' },
  { id:'p20', cat:'Milk Tea', name:'Buko Pandan Milk Tea', price:110, sizePrices:{S:90,M:110,L:130}, emoji:'🌴', img:IMG('photo-1544145945-f90425340c7e'), new:true, available:true, desc:'Filipino classic twist' },
  
  { id:'p21', cat:'Frappes', name:'Caramel Frappe', price:145, sizePrices:{S:125,M:145,L:165}, emoji:'🧊', img:IMG('photo-1572490122747-3968b75cc699'), popular:true, available:true, desc:'Blended caramel over ice' },
  { id:'p22', cat:'Frappes', name:'Mocha Frappe', price:145, sizePrices:{S:125,M:145,L:165}, emoji:'🍫', img:IMG('photo-1562077772-3a5f316e5e2a'), available:true, desc:'Blended chocolate coffee' },
  { id:'p23', cat:'Frappes', name:'Cookies & Cream Frappe', price:150, sizePrices:{S:130,M:150,L:170}, emoji:'🍪', img:IMG('photo-1579954115545-a95591f28bfc'), available:true, desc:'With cookie crumbs' },
  
  { id:'p24', cat:'Smoothies', name:'Mango Smoothie', price:130, sizePrices:{S:110,M:130,L:150}, emoji:'🥭', img:IMG('photo-1622597467836-f3285f2131b8'), popular:true, available:true, desc:'Fresh Philippine mango' },
  { id:'p25', cat:'Smoothies', name:'Strawberry Smoothie', price:135, sizePrices:{S:115,M:135,L:155}, emoji:'🍓', img:IMG('photo-1553530666-ba11a7da3888'), available:true, desc:'Strawberry & yogurt' },
  { id:'p26', cat:'Smoothies', name:'Avocado Smoothie', price:140, sizePrices:{S:120,M:140,L:160}, emoji:'🥑', img:IMG('photo-1543362906-acfc16c67564'), available:true, desc:'Creamy avocado w/ condensed milk' },
  { id:'p27', cat:'Smoothies', name:'Matcha Banana Smoothie', price:140, sizePrices:{S:120,M:140,L:160}, emoji:'🍌', img:IMG('photo-1502741224143-90386d7f8c82'), new:true, available:true, desc:'Matcha + banana blend' },
  
  { id:'p28', cat:'Pastries', name:'Butter Croissant', price:65, emoji:'🥐', img:IMG('photo-1555507036-ab1f4038808a'), popular:true, available:true, desc:'Flaky & buttery' },
  { id:'p29', cat:'Pastries', name:'Cinnamon Roll', price:75, emoji:'🍥', img:IMG('photo-1509365465985-25d11c17e812'), available:true, desc:'Freshly baked' },
  { id:'p30', cat:'Pastries', name:'Blueberry Muffin', price:70, emoji:'🫐', img:IMG('photo-1607958996333-41aef7caefaa'), available:true, desc:'Loaded with berries' },
  { id:'p31', cat:'Pastries', name:'Garlic Bread', price:60, emoji:'🍞', img:IMG('photo-1573140247632-f8fd74997d5c'), available:true, desc:'Toasted with garlic butter' },
  
  { id:'p32', cat:'Cakes', name:'Chocolate Cake', price:95, emoji:'🍰', img:IMG('photo-1578985545062-69928b1d9587'), popular:true, available:true, desc:'Slice, rich chocolate' },
  { id:'p33', cat:'Cakes', name:'Sans Rival', price:110, emoji:'🎂', img:IMG('photo-1464349095431-e9a21285b5f3'), new:true, available:true, desc:'Filipino layered cake' },
  { id:'p34', cat:'Cakes', name:'Cheesecake', price:100, emoji:'🍮', img:IMG('photo-1533134242443-d4fd215305ad'), available:true, desc:'Classic NY cheesecake' },
  { id:'p35', cat:'Cakes', name:'Ube Cheese Cake', price:115, emoji:'🟣', img:IMG('photo-1535141192574-5d4897c12636'), available:true, desc:'Ube chiffon + cheese' },
  
  { id:'p36', cat:'Sandwiches', name:'Chicken Sandwich', price:120, emoji:'🥪', img:IMG('photo-1528735602780-2552fd46c7af'), popular:true, available:true, desc:'Grilled chicken w/ veggies' },
  { id:'p37', cat:'Sandwiches', name:'Tuna Melt', price:105, emoji:'🧀', img:IMG('photo-1481070414801-51fd732d7184'), available:true, desc:'Toasted tuna & cheese' },
  { id:'p38', cat:'Sandwiches', name:'BLT', price:115, emoji:'🥓', img:IMG('photo-1527613426441-4da17471b66d'), available:true, desc:'Bacon, lettuce, tomato' },
  { id:'p39', cat:'Sandwiches', name:'Ham & Cheese', price:95, emoji:'🧀', img:IMG('photo-1553909489-cd47e0907980'), available:true, desc:'Toasted ham & cheese' },
];

const SIZE_OPTIONS = [ {key:'S',label:'Small'}, {key:'M',label:'Medium'}, {key:'L',label:'Large'} ];
const TEMP_OPTIONS = ['Hot','Iced'];
const SUGAR_OPTIONS = ['0%','25%','50%','75%','100%'];
const ICE_OPTIONS = ['None','Less','Normal','Extra'];
const MILK_OPTIONS = [
  { key:'Whole', label:'Whole', price:0 },
  { key:'Oat', label:'Oat', price:20 },
  { key:'Soy', label:'Soy', price:15 },
  { key:'Almond', label:'Almond', price:20 },
];
const EXTRA_OPTIONS = [
  { key:'Extra Espresso Shot', label:'Extra Shot', price:30 },
  { key:'Whipped Cream', label:'Whip Cream', price:15 },
  { key:'Vanilla Syrup', label:'Vanilla Syrup', price:20 },
  { key:'Caramel Syrup', label:'Caramel Syrup', price:20 },
  { key:'Hazelnut Syrup', label:'Hazelnut Syrup', price:20 },
];

const INVENTORY = [
  { id:'i1', name:'Coffee Beans (Arabica)', category:'Beans', stock:18, min:10, unit:'kg', expiry:'2025-08-15', supplier:'Highland Beans Co.', cost:850 },
  { id:'i2', name:'Espresso Beans (Robusta)', category:'Beans', stock:6, min:8, unit:'kg', expiry:'2025-07-30', supplier:'Mt. Apo Roasters', cost:780 },
  { id:'i3', name:'Whole Milk', category:'Dairy', stock:42, min:20, unit:'L', expiry:'2025-06-02', supplier:'Dairy Fresh PH', cost:95 },
  { id:'i4', name:'Oat Milk', category:'Dairy', stock:12, min:10, unit:'L', expiry:'2025-05-28', supplier:'Oatly PH', cost:180 },
  { id:'i5', name:'Soy Milk', category:'Dairy', stock:15, min:10, unit:'L', expiry:'2025-06-05', supplier:'Dairy Fresh PH', cost:110 },
  { id:'i6', name:'Almond Milk', category:'Dairy', stock:8, min:10, unit:'L', expiry:'2025-05-26', supplier:'Natures Best', cost:190 },
  { id:'i7', name:'Vanilla Syrup', category:'Syrups', stock:22, min:8, unit:'bot', expiry:'2026-01-10', supplier:'Flavor Craft Inc.', cost:320 },
  { id:'i8', name:'Caramel Syrup', category:'Syrups', stock:7, min:8, unit:'bot', expiry:'2026-01-15', supplier:'Flavor Craft Inc.', cost:320 },
  { id:'i9', name:'Hazelnut Syrup', category:'Syrups', stock:14, min:8, unit:'bot', expiry:'2026-02-01', supplier:'Flavor Craft Inc.', cost:320 },
  { id:'i10', name:'Matcha Powder', category:'Tea', stock:4, min:5, unit:'kg', expiry:'2025-09-20', supplier:'Zen Leaf Imports', cost:1200 },
  { id:'i11', name:'Tea Leaves (Black)', category:'Tea', stock:25, min:10, unit:'kg', expiry:'2025-12-01', supplier:'Tea House PH', cost:450 },
  { id:'i12', name:'Cocoa Powder', category:'Chocolate', stock:16, min:8, unit:'kg', expiry:'2025-10-05', supplier:'Cocoa Rich', cost:650 },
  { id:'i13', name:'White Chocolate', category:'Chocolate', stock:9, min:6, unit:'kg', expiry:'2025-09-12', supplier:'Cocoa Rich', cost:720 },
  { id:'i14', name:'Paper Cups (12oz)', category:'Packaging', stock:320, min:200, unit:'pcs', expiry:'—', supplier:'FreshPack PH', cost:5.5 },
  { id:'i15', name:'Cups (16oz)', category:'Packaging', stock:150, min:200, unit:'pcs', expiry:'—', supplier:'FreshPack PH', cost:6 },
  { id:'i16', name:'Lids', category:'Packaging', stock:410, min:200, unit:'pcs', expiry:'—', supplier:'FreshPack PH', cost:2.5 },
  { id:'i17', name:'Straws (Boba)', category:'Packaging', stock:90, min:150, unit:'pcs', expiry:'—', supplier:'FreshPack PH', cost:1.8 },
  { id:'i18', name:'Whipped Cream', category:'Dairy', stock:11, min:6, unit:'can', expiry:'2025-06-20', supplier:'Dairy Fresh PH', cost:145 },
  { id:'i19', name:'White Sugar', category:'Pantry', stock:28, min:10, unit:'kg', expiry:'2025-11-01', supplier:'SugarMax', cost:70 },
  { id:'i20', name:'Tapioca Pearls', category:'Pantry', stock:9, min:8, unit:'kg', expiry:'2025-07-15', supplier:'Boba World', cost:280 },
  { id:'i21', name:'Mango Puree', category:'Fruit', stock:6, min:8, unit:'kg', expiry:'2025-06-25', supplier:'Tropical Delight', cost:260 },
  { id:'i22', name:'Cinnamon', category:'Pantry', stock:5, min:3, unit:'kg', expiry:'2026-03-01', supplier:'Spice Rack', cost:340 },
];

const CUSTOMERS = [
  { id:'c1', name:'Princess Marie Velasco', phone:'0917 555 1234', email:'princess.dc@gmail.com', points:90, level:'Member', favorite:'Caramel Latte', visits:84, spent:8450 },
  { id:'c2', name:'Mark Genesis Espejo', phone:'0918 555 2211', email:'tabi tabi po.s@yahoo.com', points:350, level:'Silver', favorite:'Classic Milk Tea', visits:31, spent:3120 },
  { id:'c3', name:'Rizalito Nudo', phone:'0920 555 3322', email:'nudo.m@gmail.com', points:1200, level:'Platinum', favorite:'Classic Brew', visits:112, spent:12450 },
  { id:'c4', name:'Jhon Lawrence Andes', phone:'0916 555 4455', email:'kyo.b@outlook.com', points:985, level:'Gold', favorite:'Mango Smoothie', visits:12, spent:980 },
  { id:'c5', name:'Mark Jan Dixesne', phone:'0927 555 5566', email:'emji.t@gmail.com', points:640, level:'Gold', favorite:'Affogato', visits:52, spent:5230 },
  { id:'c6', name:'Prince John Felix Vargas', phone:'0915 555 6677', email:'prince.f@gmail.com', points:75, level:'Member', favorite:'Taro Milk Tea', visits:9, spent:760 },
  { id:'c7', name:'Odeza Garbo', phone:'0919 555 7788', email:'odeza.g@gmail.com', points:430, level:'Gold', favorite:'Hazelnut Latte', visits:38, spent:3870 },
  { id:'c8', name:'Zander Estanislao', phone:'0939 555 8899', email:'zander.e@gmail.com', points:210, level:'Silver', favorite:'Butter Croissant', visits:90, spent:9210 },
];

const ORDERS = [
  {
    id:'ORD-1048', qnum:'A-1048', customer:'Princess Marie Velasco', type:'Dine-in', status:'Completed', items:[
      { name:'Caramel Latte', qty:2, price:125, cust:'Large · Hot · 50% sugar · Oat milk', },
      { name:'Butter Croissant', qty:1, price:65, cust:'' },
    ], total:315, payment:'GCash', cashier:'James Santos', time:'09:42 AM', date:'2025-05-23', hold:false,
  },
  {
    id:'ORD-1049', qnum:'B-1049', customer:'Walk-in', type:'Takeaway', status:'Preparing', items:[
      { name:'Classic Brew', qty:1, price:80, cust:'Medium · Hot' },
      { name:'Tuna Melt', qty:2, price:105, cust:'' },
    ], total:290, payment:'Cash', cashier:'James Santos', time:'09:55 AM', date:'2025-05-23', hold:false,
  },
  {
    id:'ORD-1050', qnum:'C-1050', customer:'Maria Santos', type:'Delivery', status:'Ready', items:[
      { name:'Caramel Frappe', qty:1, price:145, cust:'Large · Iced · 75% sugar · Extra whip' },
      { name:'Classic Milk Tea', qty:1, price:95, cust:'Medium · 50% sugar · 25% ice' },
    ], total:240, payment:'GCash', cashier:'James Santos', time:'10:02 AM', date:'2025-05-23', hold:false,
  },
  {
    id:'ORD-1051', qnum:'D-1051', customer:'Carlos Mendoza', type:'Dine-in', status:'Waiting', items:[
      { name:'Hazelnut Latte', qty:1, price:125, cust:'Large · Hot · 25% sugar· Almond milk' },
      { name:'Chocolate Cake', qty:2, price:95, cust:'' },
    ], total:315, payment:'Card', cashier:'James Santos', time:'10:08 AM', date:'2025-05-23', hold:false,
  },
  {
    id:'ORD-1052', qnum:'E-1052', customer:'Angela Bautista', type:'Dine-in', status:'Waiting', items:[
      { name:'Mango Smoothie', qty:1, price:130, cust:'Large · Extra mango' },
      { name:'Blueberry Muffin', qty:1, price:70, cust:'' },
    ], total:200, payment:'Maya', cashier:'James Santos', time:'10:11 AM', date:'2025-05-23', hold:false,
  },
  {
    id:'ORD-1053', qnum:'F-1053', customer:'Walk-in', type:'Takeaway', status:'Completed', items:[
      { name:'Classic Latte', qty:2, price:110, cust:'Medium · Iced · 25% sugar· Soy milk' },
    ], total:220, payment:'Cash', cashier:'James Santos', time:'08:15 AM', date:'2025-05-23', hold:false,
  },
  {
    id:'ORD-1054', qnum:'G-1054', customer:'Walk-in', type:'Takeaway', status:'Hold', items:[
      { name:'Espresso Shot', qty:3, price:70, cust:'Double shot' },
      { name:'Garlic Bread', qty:1, price:60, cust:'' },
    ], total:270, payment:'—', cashier:'James Santos', time:'10:16 AM', date:'2025-05-23', hold:true,
  },
];

const PROMOS = [
  { id:'pr1', name:'Happy Hour', type:'Happy Hour', desc:'20% off all drinks, 2–5 PM', code:'HAPPY20', status:'Active', discount:20, applies:'drinks' },
  { id:'pr2', name:'Buy 1 Get 1', type:'B1G1', desc:'Buy 1 frappe get 1 free', code:'BOGO', status:'Active', discount:50, applies:'frappes' },
  { id:'pr3', name:'Student Discount', type:'Student', desc:'10% off with valid ID', code:'STUDENT10', status:'Active', discount:10, applies:'all' },
  { id:'pr4', name:'Senior Discount', type:'Senior', desc:'15% off for senior citizens', code:'SENIOR15', status:'Active', discount:15, applies:'all' },
  { id:'pr5', name:'Seasonal: Peppermint', type:'Seasonal', desc:'Peppermint Mocha at ₱110', code:'PAYDAY', status:'Active', discount:20, applies:'peppermint' },
  { id:'pr6', name:'Monday Morning', type:'Promo Code', desc:'₱40 off before 10 AM', code:'MORNING40', status:'Inactive', discount:40, applies:'drinks' },
  { id:'pr7', name:'Social Media Check-in', type:'Promo Code', desc:'Free upgrade on check-in', code:'CHECKIN', status:'Active', discount:20, applies:'upgrade' },
];

const NOTIFICATIONS = [
  { id:'n1', type:'order', title:'New Order Received', msg:'ORD-1052 by Angela Bautista — ₱200', time:'2 min ago', read:false },
  { id:'n2', type:'ready', title:'Order Ready', msg:'C-1050 for Maria Santos is ready', time:'5 min ago', read:false },
  { id:'n3', type:'stock', title:'Low Stock Alert', msg:'Caramel Syrup below minimum', time:'18 min ago', read:false },
  { id:'n4', type:'payment', title:'Failed Payment', msg:'Card declined for user ****4451', time:'1 hr ago', read:false },
  { id:'n5', type:'sales', title:'Daily Sales Summary', msg:'Yesterday: ₱24,380 · 146 orders', time:'8 hrs ago', read:true },
  { id:'n6', type:'stock', title:'Low Stock Alert', msg:'Straws (Boba) below minimum', time:'1 day ago', read:true },
];

const SALES_HISTORY = { week:[4200,5100,4800,6900,7600,8900,5400], dayHr:[10,16,25,32,46,38,60,74,88,95,110,120,132,145,138,160,172,168,190,205,180,150,120,90] };

const RECENT_TRANSACTIONS = [
  { id:'TXN-8841', customer:'Juan Dela Cruz', amount:315, method:'GCash', time:'10:11 AM', status:'Success' },
  { id:'TXN-8840', customer:'Angela Bautista', amount:200, method:'Maya', time:'10:08 AM', status:'Success' },
  { id:'TXN-8839', customer:'Carlos Mendoza', amount:315, method:'Card', time:'10:02 AM', status:'Success' },
  { id:'TXN-8838', customer:'Maria Santos', amount:240, method:'GCash', time:'09:55 AM', status:'Success' },
  { id:'TXN-8837', customer:'Walk-in', amount:290, method:'Cash', time:'09:42 AM', status:'Success' },
  { id:'TXN-8836', customer:'Walk-in', amount:220, method:'Cash', time:'08:15 AM', status:'Failed' },
];

const TOP_DRINKS = [
  { name:'Classic Latte', qty:142, revenue:15620 },
  { name:'Caramel Latte', qty:118, revenue:14750 },
  { name:'Classic Milk Tea', qty:96, revenue:9120 },
  { name:'Caramel Frappe', qty:84, revenue:12180 },
  { name:'Butter Croissant', qty:73, revenue:4745 },
];

const CUSTOMER_ACTIVITY = [
  { name:'Carlos Mendoza', action:'Redeemed 500 points for Caramel Latte', time:'2 min ago' },
  { name:'Juan Dela Cruz', action:'Earned 30 loyalty points', time:'10 min ago' },
  { name:'Maria Santos', action:'Placed a delivery order', time:'25 min ago' },
  { name:'Karla Navarro', action:'Reached Gold membership', time:'1 hr ago' },
];

const EMPLOYEE_PERFORMANCE = [
  { name:'Jessa Encinas', role:'Cashier', orders:42, sales:7680, rating:4.8 },
  { name:'Arfaxad Mabilin', role:'Barista', orders:51, sales:8340, rating:4.9 },
  { name:'Maria Fatima Macasinag', role:'Inventory', orders:0, sales:0, rating:4.6 },
];

const STORE_INFO = {
  name:'Brew Coffee House', address:'Salvacion Pilar Sorsogon City, PH', phone:'(02) 8123 4567', email:'hello@brewcoffee.ph',
  receiptFooter:'Thank you for supporting local coffee! ☕', taxRate:0.12, tin:'000-123-456-789',
};

const CURRENT_USER_KEY = 'brewpos_user';
const THEME_KEY = 'brewpos_theme';
const ACCENT_KEY = 'brewpos_accent';


// Default destination encoded into the customer-facing QR code (Settings → QR Code).
// Change this to your real online menu / ordering / feedback URL once it's live —
// or override it per-install from the Settings page (persisted in QR_URL_KEY).
const QR_DESTINATION_URL = 'https://pin.it/FCu7NfIud';
const QR_URL_KEY = 'brewpos_qr_url';






const ACCENTS = [
  { id: 'coffee', name: 'Coffee', swatch: '#6F4E37' },
  { id: 'mint',   name: 'Mint',   swatch: '#1F9E6B' },
  { id: 'berry',  name: 'Berry',  swatch: '#8E3B72' },
  { id: 'ocean',  name: 'Ocean',  swatch: '#1D6FA3' },
  { id: 'rose',   name: 'Rose',   swatch: '#C4436B' },
  { id: 'slate',  name: 'Slate',  swatch: '#41546B' },
];


function money(n) {
  const v = Number(n) || 0;
  return CURRENCY + v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function nextOrderNumber() {
  const source = (typeof App !== 'undefined' && App.orders) ? App.orders : ORDERS;
  const used = source.map(o => parseInt(o.id.split('-')[1]));
  const max = used.length ? Math.max(...used) : 1047;
  return 'ORD-' + (max + 1);
}