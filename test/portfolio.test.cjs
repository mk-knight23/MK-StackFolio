const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const pages=[path.join(root,'index.html')];
const pub=path.join(root,'public');
if(fs.existsSync(pub))for(const f of fs.readdirSync(pub))if(f.endsWith('.html'))pages.push(path.join(pub,f));
test('public pages retain valid JSON-LD and executable inline JavaScript',()=>{
 for(const p of pages){const html=fs.readFileSync(p,'utf8');
  for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
   if(/type=["']application\/ld\+json/.test(m[1]))assert.doesNotThrow(()=>JSON.parse(m[2]),p);
   else if(!/\bsrc=|type=["']module/.test(m[1])&&m[2].trim())assert.doesNotThrow(()=>new vm.Script(m[2]),p);
  }
 }
});
test('professional homepage exposes remote work, consulting and canonical identity',()=>{
 const html=fs.readFileSync(pages[0],'utf8');
 assert.match(html,/Remote AI engineering &amp; consulting/);
 assert.match(html,/USD and AED/);
 assert.match(html,/mailto:kazimusharraf1234@gmail.com/);
 assert.match(html,/<link rel="canonical" href="https:\/\//);
 assert.doesNotMatch(html,/Frontend Engineer with 5\+ years|80\+ successful deployments|Resume download coming soon|Hyderabad, India/);
});
test('biography references use deployed clean URL and social preview assets exist',()=>{
 for(const p of pages){const html=fs.readFileSync(p,'utf8');assert.doesNotMatch(html,/https:\/\/devtools\.mkazi\.live\/about\.html/);
  if(!p.includes('offline.html'))assert.match(html,/<meta (?:name|property)="(?:twitter|og):image"/);
 }
 if(fs.existsSync(pub)){
  const pdf=fs.readFileSync(path.join(pub,'resume','Musharraf-Kazi-Resume.pdf'));assert.equal(pdf.subarray(0,5).toString(),'%PDF-');
 }
});
