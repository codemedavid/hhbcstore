// Test the exact product transformation like in the browser
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables
const envContent = readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function testProductTransformation() {
  console.log('🔍 Testing product transformation exactly like frontend...');
  
  try {
    // Use the exact same query as useMenu.ts
    const { data: items, error: itemsError } = await supabase
      .from('menu_items')
      .select(`
        id,
        name,
        description,
        base_price,
        discounted_price,
        category,
        subcategory,
        image_url,
        popular,
        available,
        stock,
        sku,
        brand,
        weight,
        ingredients,
        created_at,
        updated_at,
        variations (*),
        add_ons (*)
      `)
      .order('created_at', { ascending: true });
    
    if (itemsError) {
      console.error('❌ Query error:', itemsError);
      return;
    }
    
    console.log(`\n📊 Raw database items: ${items.length}`);
    if (items.length > 0) {
      console.log('🔍 First raw item:');
      console.log('  Name:', items[0].name);
      console.log('  Stock:', items[0].stock, '(type:', typeof items[0].stock, ')');
      console.log('  Available:', items[0].available, '(type:', typeof items[0].available, ')');
      console.log('  Has stock property:', 'stock' in items[0]);
      console.log('  All properties:', Object.keys(items[0]));
    }
    
    // Now do the exact transformation like in useMenu.ts
    console.log('\n🔧 Starting transformation...');
    const formattedItems = items?.map(item => {
      console.log(`\n🔧 Transforming item: ${item.name}`);
      console.log('  Raw stock:', item.stock, 'Type:', typeof item.stock);
      console.log('  Raw available:', item.available, 'Type:', typeof item.available);
      
      const transformedItem = {
        id: item.id,
        name: item.name,
        description: item.description,
        basePrice: item.base_price,
        discountedPrice: item.discounted_price || undefined,
        category: item.category,
        subcategory: item.subcategory || undefined,
        images: item.image_url ? [item.image_url] : [],
        popular: item.popular,
        available: item.available ?? true,
        stock: (item.stock !== null && item.stock !== undefined) ? item.stock : 50,
        sku: item.sku || undefined,
        brand: item.brand || undefined,
        weight: item.weight || undefined,
        variations: item.variations?.map((v) => ({
          id: v.id,
          name: v.name,
          price: v.price,
          images: v.image_url ? [v.image_url] : [],
          image_url: v.image_url,
          sku: v.sku,
          stock: v.stock,
          sort_order: v.sort_order,
          created_at: v.created_at,
          updated_at: v.updated_at
        })) || [],
        addOns: item.add_ons?.map((a) => ({
          id: a.id,
          name: a.name,
          price: a.price,
          category: a.category,
          image: a.image,
          description: a.description
        })) || []
      };
      
      console.log('  Final stock:', transformedItem.stock, 'Type:', typeof transformedItem.stock);
      console.log('  Final available:', transformedItem.available, 'Type:', typeof transformedItem.available);
      console.log('  Has stock property:', 'stock' in transformedItem);
      console.log('  All properties:', Object.keys(transformedItem));
      
      return transformedItem;
    }) || [];
    
    console.log(`\n📊 Formatted items: ${formattedItems.length}`);
    if (formattedItems.length > 0) {
      console.log('\n🔍 First formatted item (like in browser console):');
      const firstItem = formattedItems[0];
      console.log(JSON.stringify(firstItem, null, 2));
      
      console.log('\n🔍 Property check:');
      console.log('  Has stock property:', 'stock' in firstItem);
      console.log('  Stock value:', firstItem.stock);
      console.log('  Stock type:', typeof firstItem.stock);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testProductTransformation();
