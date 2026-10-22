import { join } from 'node:path';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
const input=process.argv[2]||'backend/target/dependencies.json';
const output=process.argv[3]||'backend/target/dependency-audit.json';
const tree=JSON.parse(readFileSync(input,'utf8'));
const packages=new Map();
function walk(node){if(['test','provided','system'].includes(node.scope))return; if(node.groupId&&node.artifactId&&node.version&&node!==tree){const name=node.groupId+':'+node.artifactId;packages.set(name+'@'+node.version,{package:{ecosystem:'Maven',name},version:node.version});}for(const child of node.children||[])walk(child)}
walk(tree);
async function json(url,body){const r=await fetch(url,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(60000)});if(!r.ok)throw new Error('OSV request failed: '+r.status);return r.json()}
const queries=[...packages.values()];const findings=[];
for(let start=0;start<queries.length;start+=100){const chunk=queries.slice(start,start+100);const batch=await json('https://api.osv.dev/v1/querybatch',{queries:chunk});for(let i=0;i<chunk.length;i++){let result=batch.results[i];const ids=new Set((result.vulns||[]).map(v=>v.id));while(result.next_page_token){result=await json('https://api.osv.dev/v1/query',{...chunk[i],page_token:result.next_page_token});for(const v of result.vulns||[])ids.add(v.id)}if(ids.size)findings.push({name:chunk[i].package.name,version:chunk[i].version,advisories:[...ids]})}}
function sourceFiles(directory) {
  return readdirSync(directory, {withFileTypes:true}).flatMap(entry => {
    const path=join(directory,entry.name);
    return entry.isDirectory()?sourceFiles(path):[path];
  });
}
const sources=sourceFiles('backend/src/main').map(path=>readFileSync(path,'utf8')).join('\n');
const policy=JSON.parse(readFileSync('security/osv-exceptions.json','utf8'));
const reviewed=findings.flatMap(finding=>finding.advisories.map(id=>{
  const exception=policy.exceptions.find(item=>item.id===id&&item.package===finding.name&&item.version===finding.version);
  const accepted=exception&&Date.parse(exception.expires)>Date.now()&&exception.absentSymbols.every(symbol=>!sources.includes(symbol));
  return {name:finding.name,version:finding.version,id,status:accepted?'reviewed-not-applicable':'unresolved',...(accepted?{reason:exception.reason,expires:exception.expires}:{})};
}));
const unresolved=reviewed.filter(item=>item.status==='unresolved').length;
const report={source:'https://api.osv.dev',checkedAt:new Date().toISOString(),packages:queries.length,unresolved,findings:reviewed};
writeFileSync(output,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(unresolved)process.exitCode=1;
