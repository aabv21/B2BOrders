import { OrderService } from './src/services/order.service.js';
import db from './src/config/database.js';

console.log('🧪 Testing 10-minute cancellation rule for CONFIRMED orders\n');

async function testCancelRule() {
  try {
    // 1. Create an order
    console.log('1️⃣ Creating order...');
    const order = await OrderService.createOrder({
      customer_id: 1,
      items: [{ product_id: 1, qty: 1 }]
    });
    console.log(`   ✅ Order created: ${order.id} (status: ${order.status})`);

    // 2. Confirm the order
    console.log('\n2️⃣ Confirming order...');
    const confirmedOrder = await OrderService.confirmOrder(order.id, `test-${Date.now()}`);
    console.log(`   ✅ Order confirmed: ${confirmedOrder.id} (status: ${confirmedOrder.status})`);

    // 3. Try to cancel immediately (should work)
    console.log('\n3️⃣ Attempting to cancel immediately (within 10 min)...');
    try {
      const canceledOrder = await OrderService.cancelOrder(confirmedOrder.id, `cancel-${Date.now()}`);
      console.log(`   ✅ SUCCESS: Order canceled: ${canceledOrder.id} (status: ${canceledOrder.status})`);
    } catch (error) {
      console.log(`   ❌ FAILED: ${error.message}`);
    }

    // 4. Test with an old order (simulate > 10 minutes)
    console.log('\n4️⃣ Testing with order older than 10 minutes...');
    console.log('   📝 To test this, you need to:');
    console.log('      1. Manually update an order\'s updated_at to 11 minutes ago');
    console.log('      2. Try to cancel it');
    console.log('      3. Should receive error: "Cannot cancel confirmed order after 10 minutes"');
    
    console.log('\n   SQL to test manually:');
    console.log('   ```sql');
    console.log('   UPDATE orders SET updated_at = DATE_SUB(NOW(), INTERVAL 11 MINUTE) WHERE id = <order_id>;');
    console.log('   ```');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await db.end();
  }
}

testCancelRule();
