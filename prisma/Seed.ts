import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.receipt.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.table.deleteMany();
  await prisma.menuItem.deleteMany();
  console.log('🗑 Cleared old data');

  const branches = await prisma.branch.findMany();
  const getBranch = (name: string) => branches.find((b) => b.name === name)!;

  // ============================================
  // 👑 HQ LONDON — Premium Fine Dining Menu
  // ============================================
  await prisma.menuItem.createMany({
    data: [
      // Breakfast
      { name: 'Royal English Breakfast', description: 'Premium eggs, truffle sausage, smoked bacon, sourdough toast and grilled tomato', price: 18.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Eggs Benedict', description: 'Poached eggs on brioche with hollandaise sauce and smoked ham', price: 14.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Smoked Salmon Royale', description: 'Scottish smoked salmon with cream cheese, capers and toasted bagel', price: 16.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Lobster Omelette', description: 'Three egg omelette with fresh lobster, herbs and gruyere cheese', price: 24.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Avocado Royale', description: 'Smashed avocado on sourdough with poached eggs and black caviar', price: 19.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'French Crepes', description: 'Delicate crepes with grand marnier butter and fresh berries', price: 12.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&fit=crop', branchId: getBranch('HQ London').id },
      // Starters
      { name: 'Foie Gras Terrine', description: 'Duck foie gras with brioche toast and fig chutney', price: 22.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1571167530149-c1105da4c2ca?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Truffle Burrata', description: 'Fresh burrata with black truffle, cherry tomatoes and basil oil', price: 19.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Oysters Rockefeller', description: 'Six oysters baked with spinach, herbs and parmesan', price: 24.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1606731219412-4cd7d5f08a38?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Seared Scallops', description: 'Pan seared scallops with cauliflower puree and crispy pancetta', price: 21.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Tuna Tartare', description: 'Fresh bluefin tuna with avocado, sesame and ponzu dressing', price: 18.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Wagyu Beef Carpaccio', description: 'Thinly sliced A5 wagyu with truffle oil and parmesan shavings', price: 26.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&fit=crop', branchId: getBranch('HQ London').id },
      // Soups
      { name: 'Lobster Bisque', description: 'Rich and creamy lobster soup with cognac and cream', price: 18.99, category: 'Soup', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'French Onion Soup', description: 'Caramelised onion soup with gruyere crouton', price: 12.99, category: 'Soup', imageUrl: 'https://images.unsplash.com/photo-1600803907087-f56d462fd26b?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Wild Mushroom Velouté', description: 'Silky wild mushroom soup with truffle oil and chives', price: 14.99, category: 'Soup', imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&fit=crop', branchId: getBranch('HQ London').id },
      // Lunch
      { name: 'Wagyu Beef Burger', description: 'A5 Wagyu beef patty with truffle mayo, aged cheddar and brioche bun', price: 32.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Lobster Pasta', description: 'Fresh tagliatelle with half lobster in a rich bisque sauce', price: 38.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91798d9a09?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Black Truffle Pizza', description: 'Thin crust pizza with black truffle, fontina and wild mushrooms', price: 28.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Saffron Risotto', description: 'Creamy saffron risotto with langoustines and parmesan', price: 29.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Club Royal', description: 'Triple decker with lobster, avocado, truffle mayo and caviar', price: 34.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&fit=crop', branchId: getBranch('HQ London').id },
      // Dinner
      { name: 'Wagyu Tomahawk Steak', description: '32oz A5 Wagyu tomahawk with bone marrow butter and truffle fries', price: 120.00, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Beef Wellington', description: 'Prime beef fillet wrapped in mushroom duxelles and golden puff pastry', price: 54.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Whole Roasted Lobster', description: 'Fresh Atlantic lobster with garlic butter, herbs and seasonal vegetables', price: 89.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Pan Seared Duck Breast', description: 'Magret duck breast with cherry reduction and dauphinoise potatoes', price: 42.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Rack of Lamb', description: 'French trimmed rack of lamb with pistachio crust and red wine jus', price: 48.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Pan Seared Turbot', description: 'Wild turbot with champagne beurre blanc and caviar', price: 62.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Roasted Suckling Pig', description: 'Whole roasted suckling pig with apple compote and crackling', price: 75.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&fit=crop', branchId: getBranch('HQ London').id },
      // Desserts
      { name: 'Chocolate Soufflé', description: 'Dark chocolate soufflé with vanilla bean ice cream', price: 14.99, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Crème Brûlée', description: 'Classic French vanilla custard with caramelised sugar crust', price: 12.99, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Cheese Board', description: 'Selection of fine British and French cheeses with grapes and crackers', price: 18.99, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Mille-Feuille', description: 'Layers of puff pastry with vanilla cream and raspberry coulis', price: 13.99, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Gold Leaf Cheesecake', description: 'New York cheesecake with edible gold leaf and champagne jelly', price: 16.99, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&fit=crop', branchId: getBranch('HQ London').id },
      // Drinks
      { name: 'Dom Pérignon Champagne', description: 'Glass of vintage Dom Pérignon champagne', price: 45.00, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Fresh Pressed Juice', description: 'Seasonal fresh pressed juice blend', price: 6.99, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Artisan Coffee', description: 'Single origin pour over coffee', price: 5.99, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Vintage Bordeaux', description: 'Glass of selected vintage Bordeaux red wine', price: 35.00, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&fit=crop', branchId: getBranch('HQ London').id },
      { name: 'Rare Whisky Flight', description: 'Selection of three rare single malt whiskies', price: 55.00, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&fit=crop', branchId: getBranch('HQ London').id },
    ],
  });
  console.log('✅ HQ London menu added');

  // ============================================
  // 🏙 MANCHESTER — Northern Soul Food
  // ============================================
  await prisma.menuItem.createMany({
    data: [
      { name: 'Manchester Breakfast', description: 'Black pudding, bacon, eggs, beans, mushrooms and toast', price: 10.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Buttermilk Pancakes', description: 'Fluffy pancakes with maple syrup and crispy bacon', price: 8.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Eggs Florentine', description: 'Poached eggs on spinach and toasted muffin with hollandaise', price: 9.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Granola Bowl', description: 'Homemade granola with Greek yogurt and seasonal fruits', price: 7.49, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Mushy Pea Soup', description: 'Traditional Northern mushy pea soup with crusty bread', price: 5.99, category: 'Soup', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Tomato and Basil Soup', description: 'Roasted tomato soup with fresh basil and sourdough', price: 5.49, category: 'Soup', imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Chicken Wings', description: 'Crispy wings tossed in BBQ sauce with blue cheese dip', price: 9.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Garlic Mushrooms', description: 'Pan fried mushrooms in garlic butter on toasted bread', price: 6.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Prawn Cocktail', description: 'King prawns with marie rose sauce and brown bread', price: 7.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Lancashire Hotpot', description: 'Slow cooked lamb with potatoes and root vegetables', price: 14.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92a03a05?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Manchester Burger', description: 'Double beef patty with Manchester cheddar, pickles and fries', price: 13.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Fish and Chips', description: 'Beer battered cod with chips, mushy peas and tartare sauce', price: 12.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Club Sandwich', description: 'Triple decker with chicken, bacon, lettuce and mayo', price: 11.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Pasta Bolognese', description: 'Rich beef ragu with spaghetti and parmesan', price: 12.49, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91798d9a09?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Steak and Ale Pie', description: 'Rich beef and ale pie with mashed potato and gravy', price: 16.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92a03a05?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Slow Roast Pork Belly', description: 'Crispy pork belly with apple sauce and roasted vegetables', price: 18.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Grilled Ribeye Steak', description: '10oz ribeye with peppercorn sauce and chunky chips', price: 26.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Roast Chicken', description: 'Whole roasted chicken with stuffing, roasties and gravy', price: 19.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1567529692333-de9fd6772897?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Lamb Shank', description: 'Braised lamb shank with minted mash and red wine gravy', price: 21.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Sticky Toffee Pudding', description: 'Classic Northern sticky toffee pudding with custard', price: 6.99, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Apple Crumble', description: 'Warm apple crumble with vanilla ice cream', price: 5.99, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Chocolate Brownie', description: 'Warm chocolate brownie with clotted cream', price: 5.49, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Lemonade', description: 'Homemade lemonade with fresh mint', price: 2.99, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Cappuccino', description: 'Espresso with steamed milk and foam', price: 3.49, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'English Breakfast Tea', description: 'Classic English tea with milk', price: 2.49, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&fit=crop', branchId: getBranch('Manchester').id },
      { name: 'Hot Chocolate', description: 'Rich creamy hot chocolate with marshmallows', price: 3.49, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1542990253-a781e3ec9f26?w=600&fit=crop', branchId: getBranch('Manchester').id },
    ],
  });
  console.log('✅ Manchester menu added');

  // ============================================
  // 🏰 EDINBURGH — Scottish Inspired Menu
  // ============================================
  await prisma.menuItem.createMany({
    data: [
      { name: 'Scottish Breakfast', description: 'Haggis, square sausage, eggs, beans and tattie scone', price: 11.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Smoked Salmon Bagel', description: 'Scottish smoked salmon with cream cheese and capers', price: 10.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Porridge with Whisky', description: 'Traditional oat porridge with a dash of Scotch whisky and honey', price: 7.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Scots Pancakes', description: 'Traditional drop scones with butter and raspberry jam', price: 6.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Cullen Skink', description: 'Traditional Scottish smoked haddock and potato soup', price: 7.99, category: 'Soup', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Cock a Leekie', description: 'Classic Scottish chicken and leek soup with prunes', price: 6.99, category: 'Soup', imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Haggis Bon Bons', description: 'Crispy haggis balls with whisky cream sauce', price: 8.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Smoked Mackerel Pate', description: 'Scottish smoked mackerel pate with oatcakes', price: 7.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Deep Fried Brie', description: 'Golden fried brie with cranberry sauce', price: 7.49, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1571167530149-c1105da4c2ca?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Scottish Beef Burger', description: 'Aberdeen Angus beef with Scottish cheddar and fries', price: 14.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Smoked Haddock Fish Cakes', description: 'Scottish haddock cakes with tartare sauce and salad', price: 12.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Haggis Neeps and Tatties', description: 'Traditional haggis with turnip and potato', price: 13.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92a03a05?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Stovies', description: 'Traditional Scottish potato stew with corned beef', price: 11.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92a03a05?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Roasted Highland Venison', description: 'Scottish venison with root vegetables and red wine sauce', price: 28.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Pan Seared Salmon', description: 'Fresh Scottish salmon with lemon butter and asparagus', price: 22.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Aberdeen Angus Steak', description: '8oz Aberdeen Angus sirloin with whisky sauce and chips', price: 29.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Slow Cooked Lamb Shank', description: 'Highland lamb shank with mashed neeps and rosemary gravy', price: 23.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Cranachan', description: 'Traditional Scottish dessert with raspberries, cream and whisky oats', price: 7.99, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Clootie Dumpling', description: 'Traditional Scottish steamed pudding with custard', price: 6.99, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Shortbread and Ice Cream', description: 'Homemade Scottish shortbread with vanilla ice cream', price: 5.99, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Scottish Tea', description: 'Traditional Scottish blend tea with shortbread', price: 2.99, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Irn Bru', description: "Scotland's famous fizzy drink", price: 2.49, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Single Malt Whisky', description: 'Glass of selected Highland single malt whisky', price: 8.99, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
      { name: 'Scottish Ale', description: 'Pint of local Scottish craft ale', price: 5.49, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&fit=crop', branchId: getBranch('Edinburgh').id },
    ],
  });
  console.log('✅ Edinburgh menu added');

  // ============================================
  // 🌊 BRISTOL — Coastal & Creative Menu
  // ============================================
  await prisma.menuItem.createMany({
    data: [
      { name: 'Avocado Toast', description: 'Sourdough with smashed avocado, poached egg and chilli flakes', price: 9.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Acai Bowl', description: 'Blended acai with granola, fresh fruits and honey', price: 8.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Vegan Breakfast', description: 'Tofu scramble, roasted tomatoes, mushrooms and sourdough', price: 10.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Smashed Avo Eggs', description: 'Avocado and feta on rye with soft boiled eggs', price: 9.49, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Seafood Chowder', description: 'Creamy soup with fresh local seafood and crusty bread', price: 8.99, category: 'Soup', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Gazpacho', description: 'Chilled Spanish tomato soup with cucumber and peppers', price: 6.99, category: 'Soup', imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Calamari', description: 'Crispy fried squid with lemon aioli', price: 9.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Prawn Skewers', description: 'Grilled tiger prawns with garlic butter and herbs', price: 10.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Crab Cakes', description: 'Fresh Cornish crab cakes with sweet chilli sauce', price: 11.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Fish Tacos', description: 'Grilled fish in soft tacos with slaw and chipotle sauce', price: 12.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Lobster Roll', description: 'Fresh lobster in a toasted brioche bun with lemon mayo', price: 18.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Vegan Buddha Bowl', description: 'Quinoa, roasted vegetables, hummus and tahini dressing', price: 11.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Grilled Mackerel Sandwich', description: 'Fresh grilled mackerel with horseradish cream on ciabatta', price: 10.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Grilled Sea Bass', description: 'Whole sea bass with herb butter and seasonal vegetables', price: 24.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'King Prawn Linguine', description: 'Fresh pasta with king prawns, cherry tomatoes and white wine', price: 19.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91798d9a09?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Bouillabaisse', description: 'Traditional French seafood stew with rouille and crusty bread', price: 26.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Grilled Swordfish', description: 'Fresh swordfish steak with mango salsa and coconut rice', price: 23.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Lemon Tart', description: 'Classic French lemon tart with raspberry coulis', price: 6.99, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Vegan Chocolate Mousse', description: 'Rich dark chocolate mousse made with coconut cream', price: 6.49, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Tropical Fruit Pavlova', description: 'Meringue topped with cream and exotic fruits', price: 7.49, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Mango Smoothie', description: 'Fresh mango blended with yogurt and honey', price: 4.49, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Sparkling Water', description: 'Chilled sparkling mineral water', price: 1.99, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Cold Brew Coffee', description: 'Smooth cold brew coffee with oat milk', price: 4.49, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&fit=crop', branchId: getBranch('Bristol').id },
      { name: 'Elderflower Lemonade', description: 'Homemade elderflower and lemon fizz', price: 3.49, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&fit=crop', branchId: getBranch('Bristol').id },
    ],
  });
  console.log('✅ Bristol menu added');

  // ============================================
  // 🏭 BIRMINGHAM — Balti & Fusion Menu
  // ============================================
  await prisma.menuItem.createMany({
    data: [
      { name: 'Full English Breakfast', description: 'Eggs, bacon, sausage, beans, toast and grilled tomato', price: 9.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Spiced French Toast', description: 'Brioche with cardamom and cinnamon, served with mango chutney', price: 8.49, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Masala Omelette', description: 'Three egg omelette with green chillies, onions and spices', price: 8.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Paratha and Eggs', description: 'Flaky flatbread with scrambled eggs and pickle', price: 7.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Mulligatawny Soup', description: 'Spiced lentil and chicken soup with naan bread', price: 6.99, category: 'Soup', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Dal Soup', description: 'Spiced red lentil soup with crispy shallots', price: 5.99, category: 'Soup', imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Onion Bhaji', description: 'Crispy spiced onion fritters with mint yogurt dip', price: 5.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Samosas', description: 'Crispy pastry filled with spiced potato and peas', price: 5.49, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Chicken Tikka Starter', description: 'Tandoori chicken tikka with mint chutney and salad', price: 8.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1567529692333-de9fd6772897?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Seekh Kebab', description: 'Spiced minced lamb kebab with raita and naan', price: 9.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Birmingham Balti', description: 'Authentic Birmingham balti with naan bread and rice', price: 15.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92a03a05?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Masala Burger', description: 'Spiced beef burger with mango chutney and masala fries', price: 12.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Chicken Biryani', description: 'Fragrant basmati rice with spiced chicken and saffron', price: 13.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Paneer Wrap', description: 'Grilled paneer with mint chutney in a tandoori roti', price: 10.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Lamb Rogan Josh', description: 'Slow cooked lamb in rich spiced sauce with pilau rice', price: 17.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92a03a05?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Chicken Tikka Masala', description: 'Classic creamy tomato curry with basmati rice and naan', price: 15.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1567529692333-de9fd6772897?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'King Prawn Balti', description: 'King prawns in a rich Birmingham balti sauce', price: 19.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Lamb Seekh Kebab Platter', description: 'Mixed grill platter with seekh kebabs, tikka and naan', price: 22.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Vegetable Korma', description: 'Mild creamy vegetable curry with pilau rice', price: 13.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Gulab Jamun', description: 'Sweet milk dumplings in rose syrup with ice cream', price: 5.99, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Kheer', description: 'Traditional rice pudding with cardamom and pistachios', price: 5.49, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Gajar Ka Halwa', description: 'Warm carrot pudding with almonds and cream', price: 5.99, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Mango Lassi', description: 'Chilled yogurt and mango drink', price: 3.99, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Masala Tea', description: 'Traditional spiced Indian tea with milk', price: 2.99, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Rose Sharbat', description: 'Chilled rose water drink with basil seeds', price: 3.49, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&fit=crop', branchId: getBranch('Birmingham').id },
      { name: 'Fresh Lime Soda', description: 'Fresh lime with sparkling water and salt or sugar', price: 2.99, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&fit=crop', branchId: getBranch('Birmingham').id },
    ],
  });
  console.log('✅ Birmingham menu added');

  // ============================================
  // 🌹 LEEDS — Yorkshire Classics Menu
  // ============================================
  await prisma.menuItem.createMany({
    data: [
      { name: 'Yorkshire Breakfast', description: 'Eggs, Yorkshire sausage, bacon, black pudding and toast', price: 10.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Porridge with Honey', description: 'Creamy oats with Yorkshire honey and fresh berries', price: 6.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Smashed Eggs on Toast', description: 'Scrambled eggs on thick white toast with butter', price: 7.49, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Bacon Sandwich', description: 'Thick cut bacon in a soft white bap with brown sauce', price: 5.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Yorkshire Pudding Soup', description: 'Rich beef broth served in a giant Yorkshire pudding', price: 7.99, category: 'Soup', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Leek and Potato Soup', description: 'Creamy leek and potato soup with crusty bread', price: 5.99, category: 'Soup', imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Prawn Cocktail', description: 'King prawns with marie rose sauce on lettuce', price: 7.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Melon and Parma Ham', description: 'Fresh cantaloupe melon with Italian parma ham', price: 7.49, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Pate on Toast', description: 'Smooth chicken liver pate with toast and chutney', price: 6.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1571167530149-c1105da4c2ca?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Yorkshire Roast Beef Sandwich', description: 'Slow roasted beef with horseradish and Yorkshire pudding', price: 11.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Fish and Chips', description: 'Beer battered haddock with chunky chips and mushy peas', price: 13.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: "Ploughman's Lunch", description: 'Yorkshire cheddar, pickle, ham, crusty bread and salad', price: 10.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Cheese and Onion Pie', description: 'Shortcrust pastry pie with Yorkshire cheddar and onion', price: 11.49, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92a03a05?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Sunday Roast', description: 'Roast beef with Yorkshire pudding, roasties and all the trimmings', price: 18.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1567529692333-de9fd6772897?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Braised Beef Short Rib', description: 'Slow braised beef rib with mash and red wine gravy', price: 22.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Pan Fried Trout', description: 'Fresh Yorkshire trout with almonds and new potatoes', price: 18.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Chicken and Leek Pie', description: 'Creamy chicken and leek in puff pastry with mash', price: 16.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92a03a05?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Pork Tenderloin', description: 'Yorkshire pork with apple and cider sauce and roasties', price: 19.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Yorkshire Curd Tart', description: 'Traditional Yorkshire curd tart with clotted cream', price: 5.99, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Treacle Sponge', description: 'Warm treacle sponge pudding with custard', price: 5.49, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Bakewell Tart', description: 'Almond and cherry jam tart with icing', price: 4.99, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Yorkshire Tea', description: 'Famous Yorkshire blend tea with milk', price: 2.49, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Rhubarb Lemonade', description: 'Yorkshire rhubarb lemonade with ice', price: 3.49, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Flat White', description: 'Double espresso with steamed milk', price: 3.49, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&fit=crop', branchId: getBranch('Leeds').id },
      { name: 'Ginger Beer', description: 'Spicy homemade ginger beer', price: 2.99, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&fit=crop', branchId: getBranch('Leeds').id },
    ],
  });
  console.log('✅ Leeds menu added');

  // ============================================
  // 🎭 LIVERPOOL — Scouse & International Menu
  // ============================================
  await prisma.menuItem.createMany({
    data: [
      { name: 'Liverpool Breakfast', description: 'Scouse sausage, eggs, beans, toast and grilled tomato', price: 9.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Avocado Eggs Benedict', description: 'Poached eggs with avocado and hollandaise on toasted muffin', price: 11.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Smoked Kipper', description: 'Traditional smoked kipper with butter and brown bread', price: 9.49, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Breakfast Bap', description: 'Soft bap with sausage, egg and bacon', price: 6.99, category: 'Breakfast', imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Scouse Soup', description: 'Traditional Liverpool lamb and vegetable stew', price: 6.99, category: 'Soup', imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Minestrone', description: 'Italian vegetable soup with pasta and parmesan', price: 5.99, category: 'Soup', imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Salt and Pepper Squid', description: 'Crispy squid with sweet chilli dipping sauce', price: 8.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Chicken Liver Pate', description: 'Smooth chicken liver pate with toast and red onion jam', price: 7.49, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1571167530149-c1105da4c2ca?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Baked Camembert', description: 'Baked camembert with rosemary, garlic and crusty bread', price: 8.99, category: 'Starter', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Blind Scouse', description: "Vegetarian version of Liverpool's famous stew with bread", price: 10.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92a03a05?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Chicken Caesar Wrap', description: 'Grilled chicken with caesar dressing in a flour tortilla', price: 10.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Scouse Burger', description: 'Beef burger with Liverpool cheddar and scouse relish', price: 12.99, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Spaghetti Carbonara', description: 'Classic pasta with pancetta, egg and parmesan', price: 12.49, category: 'Lunch', imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91798d9a09?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Slow Cooked Lamb Scouse', description: 'Traditional Liverpool scouse with pickled red cabbage', price: 15.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Grilled Seabass', description: 'Fresh seabass with lemon butter sauce and new potatoes', price: 21.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Chicken Supreme', description: 'Stuffed chicken breast with mushroom sauce and dauphinoise', price: 18.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1567529692333-de9fd6772897?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Beef Sirloin Steak', description: '8oz sirloin steak with peppercorn sauce and fries', price: 24.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Vegetable Wellington', description: 'Roasted vegetables in puff pastry with red wine jus', price: 15.99, category: 'Dinner', imageUrl: 'https://images.unsplash.com/photo-1574484284002-952d92a03a05?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Bread and Butter Pudding', description: 'Classic pudding with custard and raisins', price: 5.99, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Eton Mess', description: 'Meringue, strawberries and whipped cream', price: 5.49, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Chocolate Fudge Cake', description: 'Rich chocolate cake with fudge frosting and ice cream', price: 6.49, category: 'Dessert', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Hot Chocolate', description: 'Rich creamy hot chocolate with marshmallows', price: 3.49, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1542990253-a781e3ec9f26?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Fresh Orange Juice', description: 'Freshly squeezed orange juice', price: 3.99, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Iced Latte', description: 'Espresso with cold milk over ice', price: 3.99, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&fit=crop', branchId: getBranch('Liverpool').id },
      { name: 'Strawberry Milkshake', description: 'Thick strawberry milkshake with whipped cream', price: 4.49, category: 'Drinks', imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&fit=crop', branchId: getBranch('Liverpool').id },
    ],
  });
  console.log('✅ Liverpool menu added');

  console.log('🎉 All branches now have unique menus with images!');

  // Create tables per branch:
  //   table 0  = Online Orders (virtual, for web orders with no physical table)
  //   tables 1–15 = dine-in tables (mix of 2, 4, 6 seats)
  for (const branch of branches) {
    await prisma.table.createMany({
      data: [
        { number: 0, seats: 0, branchId: branch.id }, // online orders slot
        ...Array.from({ length: 15 }, (_, i) => ({
          number: i + 1,
          seats: i < 5 ? 2 : i < 11 ? 4 : 6,
          branchId: branch.id,
        })),
      ],
    });
  }
  console.log(`✅ Created tables (0–15) for each of the ${branches.length} branches`);

  // ─── Staff accounts ───────────────────────────────────────────────────────
  // One waiter, chef, cashier and branch manager per branch.
  // Login password for ALL staff: Password123!
  const pw = await bcrypt.hash('Password123!', 10);

  // One global account per branch-level role.
  // Branch is selected at login time — no branch stored on these accounts.
  const GLOBAL_STAFF = [
    { name: 'Waiter',          email: 'waiter@streakz.co.uk',   role: 'WAITER'         },
    { name: 'Chef',            email: 'chef@streakz.co.uk',     role: 'CHEF'           },
    { name: 'Cashier',         email: 'cashier@streakz.co.uk',  role: 'CASHIER'        },
    { name: 'Branch Manager',  email: 'bm@streakz.co.uk',       role: 'BRANCH_MANAGER' },
  ] as const;

  for (const acc of GLOBAL_STAFF) {
    await prisma.user.upsert({
      where: { email: acc.email },
      update: {},
      create: { name: acc.name, email: acc.email, password: pw, role: acc.role },
    });
  }

  // One global admin + one HQ Manager
  await prisma.user.upsert({
    where: { email: 'admin@streakz.co.uk' },
    update: {},
    create: { name: 'System Admin', email: 'admin@streakz.co.uk', password: pw, role: 'ADMIN' },
  });
  await prisma.user.upsert({
    where: { email: 'hq.manager@streakz.co.uk' },
    update: {},
    create: { name: 'HQ Manager', email: 'hq.manager@streakz.co.uk', password: pw, role: 'HQ_MANAGER', branchId: getBranch('HQ London').id },
  });

  console.log('✅ Staff accounts created for all branches (password: Password123!)');
  console.log('   e.g. waiter.manchester@streakz.co.uk / Password123!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });