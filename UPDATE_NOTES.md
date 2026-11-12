# BrewPOS — Update: Void, Audit Log, Restore, Alerts, Receipt Fit

Bago ito sa naunang buong package — palitan mo lang ang mga file mo ng mga nasa
folder na ito (parehong pangalan/lokasyon), tapos patakbuhin ulit ang `setup.php`
dahil may **bagong table** (`activity_log`).

## ✅ Bago dito

1. **Bug fix — Voided orders hindi na binibilang sa revenue.** Dati, kahit
   na-void na ang isang order, nabibilang pa rin siya sa Dashboard/Reports sales.
   Na-fix na.

2. **Activity Log (audit trail) — bago, kumpleto.**
   - Bagong `activity_log` table.
   - Awtomatikong naka-log: login, void order, create/update/delete product,
     add ingredient/stock-in, create/update/delete staff account, add/update
     customer (kasama kung loyalty points lang ang binago), create/update/
     delete promotion.
   - Bagong **"Activity Log"** sa sidebar — makikita lang ng **Owner/Admin**
     (parehong hidden sa UI AT naka-block sa server side kung sinuman pa man
     ang susubukang direktang tumawag sa API).

3. **Restore — dati dummy lang, ngayon totoong gumagana.** I-upload mo ang
   `brewpos-backup.json` (mula sa Backup button), ire-import ulit nito ang
   products/inventory/customers/promotions pabalik sa database (order history
   hindi kasama, sadyang hindi kinokontra dahil delikado i-restore ang
   transactional records).

4. **Low Stock Notifications — bago.** Awtomatikong may lalabas na notification
   + toast kapag may ingredient na bumaba sa minimum stock nito, kasabay ng
   bawat checkout — hindi lang bilang sa Dashboard, aktibong abiso na ngayon.

5. **Receipt printing — na-verify at na-clean up.** May Thermal (58/80mm) at
   A4/Letter na toggle sa Print Receipt modal — pumili ka lang base sa printer
   mo bago i-print, at automatic na mag-a-adjust ang sukat (centered, hindi
   naka-cut off, hindi rin sobrang liit sa buong A4 page).

## 📦 Paano i-install ang update

1. I-overwrite ang mga sumusunod sa `htdocs/brewpos/` mo:
   `config/auth.php`, `config/db.php`, `api/*.php` (kasama ang **bagong**
   `api/activity_log.php`), `js/app.js`, `js/pages.js`, `js/data.js`,
   `css/styles.css`, `brewpos_schema.sql`, `setup.php`.
2. Buksan ulit ang `http://localhost/brewpos/setup.php` — click "Sige, gawin
   ang database" (buburahin at gagawin ulit ang tables, kasama na ang bagong
   `activity_log` — normal lang ito, hindi nangangahulugan ng error kahit
   ganito palagi ang setup mo).
3. Itago/burahin ulit ang `setup.php` pagkatapos.
4. Mag-login bilang Owner o Admin — makikita mo na ang "Activity Log" sa
   sidebar.

## 🧪 Paano i-demo/subukan

- Mag-checkout ng order → tignan ang Activity Log → dapat may bagong entry.
- I-void ang isang order (Owner/Admin/Manager) → i-check ang Inventory (dapat
  bumalik ang stock) at ang Dashboard (dapat bumaba ang revenue) → i-check ang
  Activity Log (dapat may "Voided order" entry).
- Mag-Stock In sa Inventory hanggang bumaba pababa sa minimum ang isang item
  (o mag-checkout hanggang maubos) → dapat lumabas ang Low Stock notification.
- I-download ang Backup, tapos i-Restore ito → dapat may toast na
  "Restore complete" na may bilang ng na-update na records.
- I-print ang isang resibo, subukan pareho ang Thermal at A4 toggle.

## Natitira pa (kung may oras pa)

- ERD / system flowchart / user manual bilang hiwalay na dokumento
  (documentation, hindi code — sabihin mo lang kung gusto mo gawin ko ito).
- Logging sa `customers.php`/`promotions.php` GET (hindi ginawa dahil hindi
  naman "action" ang basta pagtingin — tama lang na hindi ito naka-log).
