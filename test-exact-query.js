// Test the exact query used in useMenu.ts
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

async function testExactQuery() {
  console.log('🔍 Testing exact useMenu query...');
  
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
    
    console.log(`\n📊 Query returned ${items.length} items`);
    console.log('='.repeat(80));
    
    if (items && items.length > 0) {
      const firstItem = items[0];
      console.log('🔍 First item raw data:');
      console.log('  Name:', firstItem.name);
      console.log('  Stock:', firstItem.stock, '(type:', typeof firstItem.stock, ')');
      console.log('  Available:', firstItem.available, '(type:', typeof firstItem.available, ')');
      console.log('  Has stock property:', 'stock' in firstItem);
      console.log('  All properties:', Object.keys(firstItem));
      
      // Test the transformation logic
      console.log('\n🔧 Testing transformation logic:');
      const transformedStock = (firstItem.stock !== null && firstItem.stock !== undefined) ? firstItem.stock : 50;
      console.log('  Original stock:', firstItem.stock);
      console.log('  Transformed stock:', transformedStock);
      console.log('  Available:', firstItem.available ?? true);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testExactQuery();
