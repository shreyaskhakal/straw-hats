const fs = require('fs');
const files = ['landing', 'login', 'dashboard', 'mandates', 'agent', 'requests', 'payment-methods', 'passport', 'activity', 'security', 'settings'];
const imgs = new Set();
files.forEach(f => {
  const content = fs.readFileSync('stitch_exports/' + f + '.html', 'utf8');
  const regex = /src=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (!match[1].includes('cdn.tailwind')) {
      imgs.add(match[1]);
    }
  }
});
console.log('Unique images:');
imgs.forEach(img => console.log(img));
