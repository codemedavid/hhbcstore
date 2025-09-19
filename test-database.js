// Test database connection and data fetching
const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test 1: Check if we can connect
    console.log('\n1. Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('menu_items')
      .select('id, name')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection error:', testError);
      return;
    }
    
    console.log('✅ Connection successful');
    console.log('📊 Sample data:', testData);
    
    // Test 2: Check table structure
    console.log('\n2. Checking table structure...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'menu_items' });
    
    if (columnsError) {
      console.log('⚠️  Could not get column info via RPC, trying direct query...');
      
      // Try direct query
      const { data: directData, error: directError } = await supabase
        .from('menu_items')
        .select('*')
        .limit(1);
      
      if (directError) {
        console.error('❌ Direct query error:', directError);
        return;
      }
      
      console.log('📋 Available columns:', Object.keys(directData[0] || {}));
    } else {
      console.log('📋 Table columns:', columns);
    }
    
    // Test 3: Check if stock column exists
    console.log('\n3. Checking for stock column...');
    const { data: stockTest, error: stockError } = await supabase
      .from('menu_items')
      .select('id, name, stock, available')
      .limit(3);
    
    if (stockError) {
      console.error('❌ Stock column error:', stockError);
      console.log('💡 This means the stock column does not exist in the database');
    } else {
      console.log('✅ Stock column exists');
      console.log('📊 Stock data:', stockTest);
    }
    
    // Test 4: Try the exact query from useMenu
    console.log('\n4. Testing exact useMenu query...');
    const { data: exactData, error: exactError } = await supabase
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
      .order('created_at', { ascending: true })
      .limit(2);
    
    if (exactError) {
      console.error('❌ Exact query error:', exactError);
    } else {
      console.log('✅ Exact query successful');
      console.log('📊 Exact data:', exactData);
      if (exactData && exactData.length > 0) {
        console.log('🔍 First item stock:', exactData[0].stock, 'Type:', typeof exactData[0].stock);
        console.log('🔍 First item available:', exactData[0].available, 'Type:', typeof exactData[0].available);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDatabase();
