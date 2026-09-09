"""Compare a fresh AI Studio export with a handoff manifest. No file contents logged."""
import argparse,hashlib,json,zipfile
from pathlib import PurePosixPath
p=argparse.ArgumentParser();p.add_argument('--manifest',required=True);p.add_argument('--zip',required=True);a=p.parse_args()
m=json.load(open(a.manifest));expected={r['path']:r for r in m['files'] if r['transfer']=='required'}
with zipfile.ZipFile(a.zip) as z:
 entries=[i for i in z.infolist() if not i.is_dir()]
 # GHL exports have one wrapper folder; our flat transfer bundles have none.
 names=[i.filename for i in entries]
 roots={n.split('/')[0] for n in names}
 wrapper=next(iter(roots))+'/' if len(roots)==1 and all('/' in n for n in names) else ''
 data={}
 for entry in entries:
  name=entry.filename.removeprefix(wrapper);path=PurePosixPath(name)
  if path.is_absolute() or '..' in path.parts or '\\' in name:raise SystemExit('Unsafe archive path.')
  if any(part.startswith('.env') or part=='.git' for part in path.parts):continue
  if name in data:raise SystemExit('Duplicate archive path.')
  data[name]=entry
 results=[]
 for name,row in expected.items():
  if row['status']=='deleted':state='matches' if name not in data else 'unexpectedly present'
  elif name not in data:state='missing'
  else:state='matches' if hashlib.sha256(z.read(data[name])).hexdigest()==row['afterSha256'] else 'different bytes'
  results.append({'path':name,'result':state,'generated':row['category']=='generated route tree'})
 mismatches=[r for r in results if r['result']!='matches']
 print(json.dumps({'scope':'Required changed files only; unchanged files and optional tooling are not certified by this check.','expectedCommit':m['targetCommit'],'checked':len(results),'matched':len(results)-len(mismatches),'mismatches':mismatches},indent=2))
 raise SystemExit(1 if mismatches else 0)
