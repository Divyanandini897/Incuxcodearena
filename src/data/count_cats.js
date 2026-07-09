const fs = require('fs');
const d = fs.readFileSync('src/data/data.ts', 'utf8');
const cats = {};
// JSON.stringify(null, 2) format → "category": "Algorithms"
const re = /"category":\s*"([^"]+)"/g;
let m;
while ((m = re.exec(d)) !== null) {
  cats[m[1]] = (cats[m[1]] || 0) + 1;
}
console.log('Category distribution:');
console.log(JSON.stringify(cats, null, 2));
console.log('Total:', Object.values(cats).reduce((a, b) => a + b, 0));
