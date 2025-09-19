// Check actual stock values in database
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

async function checkStockValues() {
  console.log('🔍 Checking stock values in database...');
  
  try {
    // Get all items with stock info
    const { data: items, error } = await supabase
      .from('menu_items')
      .select('id, name, stock, available, popular')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`\n📊 Found ${items.length} items:`);
    console.log('='.repeat(80));
    
    items.forEach((item, index) => {
      const stockStatus = item.stock > 0 ? '✅' : '❌';
      const popularStatus = item.popular ? '⭐' : '  ';
      const availableStatus = item.available ? '🟢' : '🔴';
      
      console.log(`${index + 1}. ${stockStatus} ${popularStatus} ${availableStatus} ${item.name}`);
      console.log(`   Stock: ${item.stock} | Available: ${item.available}`);
    });
    
    // Summary
    const withStock = items.filter(item => item.stock > 0).length;
    const outOfStock = items.filter(item => item.stock === 0).length;
    const available = items.filter(item => item.available).length;
    
    console.log('\n📈 Summary:');
    console.log(`   Total items: ${items.length}`);
    console.log(`   With stock: ${withStock}`);
    console.log(`   Out of stock: ${outOfStock}`);
    console.log(`   Available: ${available}`);
    
    // Check if any items have good stock levels
    const goodStock = items.filter(item => item.stock >= 10).length;
    console.log(`   Good stock (≥10): ${goodStock}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

checkStockValues();
