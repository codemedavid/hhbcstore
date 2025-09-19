// Script to add stock column to menu_items table
// Run this with: node add-stock-column.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addStockColumn() {
  try {
    console.log('🚀 Adding stock column to menu_items table...');

    // First, let's check if the column already exists
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'menu_items' });

    if (columnsError) {
      console.log('Could not check existing columns, proceeding with addition...');
    } else {
      console.log('Existing columns:', columns);
    }

    // Add stock column
    console.log('Adding stock column...');
    const { error: stockError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;' 
      });

    if (stockError) {
      console.log('Stock column error:', stockError);
    } else {
      console.log('✅ Stock column added successfully');
    }

    // Add sku column
    console.log('Adding sku column...');
    const { error: skuError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS sku TEXT;' 
      });

    if (skuError) {
      console.log('SKU column error:', skuError);
    } else {
      console.log('✅ SKU column added successfully');
    }

    // Add brand column
    console.log('Adding brand column...');
    const { error: brandError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS brand TEXT;' 
      });

    if (brandError) {
      console.log('Brand column error:', brandError);
    } else {
      console.log('✅ Brand column added successfully');
    }

    // Add weight column
    console.log('Adding weight column...');
    const { error: weightError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS weight TEXT;' 
      });

    if (weightError) {
      console.log('Weight column error:', weightError);
    } else {
      console.log('✅ Weight column added successfully');
    }

    // Add ingredients column
    console.log('Adding ingredients column...');
    const { error: ingredientsError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS ingredients TEXT[];' 
      });

    if (ingredientsError) {
      console.log('Ingredients column error:', ingredientsError);
    } else {
      console.log('✅ Ingredients column added successfully');
    }

    // Test by fetching a menu item to see if stock is now available
    console.log('Testing stock column...');
    const { data: testItem, error: testError } = await supabase
      .from('menu_items')
      .select('id, name, stock, sku, brand, weight, ingredients')
      .limit(1);

    if (testError) {
      console.error('❌ Error testing stock column:', testError);
    } else {
      console.log('✅ Test successful! Sample item:', testItem);
    }

    console.log('🎉 Stock column addition completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addStockColumn();
