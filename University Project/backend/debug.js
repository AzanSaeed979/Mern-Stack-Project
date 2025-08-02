console.log('🔍 Debugging path-to-regexp error...');

// Test basic imports
try {
  console.log('Testing Express import...');
  const express = require('express');
  console.log('✅ Express imported successfully');
  
  const app = express();
  console.log('✅ Express app created');
  
  // Test basic middleware
  app.use(express.json());
  console.log('✅ JSON middleware added');
  
  // Test basic route
  app.get('/test', (req, res) => {
    res.json({ message: 'test route works' });
  });
  console.log('✅ Test route added');
  
  // Test route with parameter
  app.get('/test/:id', (req, res) => {
    res.json({ id: req.params.id });
  });
  console.log('✅ Parameter route added');
  
  // Test wildcard route using middleware
  app.use((req, res, next) => {
    if (req.path === '/wildcard-test') {
      res.json({ wildcard: true });
    } else {
      next();
    }
  });
  console.log('✅ Wildcard route added');
  
  // Test app.use routes
  app.use('/api/test', (req, res) => {
    res.json({ api: true });
  });
  console.log('✅ API route added');
  
  console.log('🎉 All route tests passed!');
  
} catch (error) {
  console.error('❌ Error found:', error.message);
  console.error('Stack:', error.stack);
}

// Now test actual route imports
console.log('\n📂 Testing route imports...');
try {
  const productionRoutes = require('./routes/production');
  console.log('✅ Production routes imported');
  
  const defectRoutes = require('./routes/defects');
  console.log('✅ Defect routes imported');
  
  const aiRoutes = require('./routes/ai');
  console.log('✅ AI routes imported');
  
  console.log('🎉 All route imports successful!');
  
} catch (error) {
  console.error('❌ Route import error:', error.message);
}
