// Quick test to check which table exists
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load environment variables from .env file
const envContent = readFileSync('.env', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

// Get credentials from environment
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing table existence...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTables() {
  try {
    // Test menu_items table
    console.log('\n1. Testing menu_items table...');
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name')
      .limit(1);
    
    if (menuError) {
      console.log('❌ menu_items error:', menuError.message);
    } else {
      console.log('✅ menu_items exists, count:', menuItems?.length);
    }
    
    // Test products table
    console.log('\n2. Testing products table...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);
    
    if (productsError) {
      console.log('❌ products error:', productsError.message);
    } else {
      console.log('✅ products exists, count:', products?.length);
    }
    
    // Test both with stock column
    console.log('\n3. Testing stock column in menu_items...');
    const { data: stockTest1, error: stockError1 } = await supabase
      .from('menu_items')
      .select('id, name, stock')
      .limit(1);
    
    if (stockError1) {
      console.log('❌ menu_items stock error:', stockError1.message);
    } else {
      console.log('✅ menu_items stock works:', stockTest1);
    }
    
    console.log('\n4. Testing stock column in products...');
    const { data: stockTest2, error: stockError2 } = await supabase
      .from('products')
      .select('id, name, stock')
      .limit(1);
    
    if (stockError2) {
      console.log('❌ products stock error:', stockError2.message);
    } else {
      console.log('✅ products stock works:', stockTest2);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testTables();
