"""Build a reviewable handoff from an original ZIP and a pinned Git revision.
No live service calls. Secret values are never logged or shipped. Before-text is
redacted when necessary; hashes always refer to original bytes. Full replacement
files, not the rendered diff, are the import source of truth.
"""
import argparse,base64,difflib,hashlib,html,json,mimetypes,subprocess,zipfile
from pathlib import Path,PurePosixPath
parser=argparse.ArgumentParser();parser.add_argument('--base-zip',required=True);parser.add_argument('--out',required=True);parser.add_argument('--revision',default='HEAD');args=parser.parse_args()
root=Path(__file__).resolve().parents[1];out=Path(args.out).resolve();out.mkdir(parents=True,exist_ok=True)
def git(*args):return subprocess.check_output(['git',*args],cwd=root)
def digest(data):return hashlib.sha256(data).hexdigest()
revision=git('rev-parse',args.revision).decode().strip()
secrets=[]
for line in (root/'.env.local').read_text().splitlines():
 if '=' in line and not line.lstrip().startswith('#'):
  value=line.split('=',1)[1].strip().strip('\"\'')
  if value:secrets.append(value)
def safe_path(name):
 p=PurePosixPath(name)
 return not p.is_absolute() and '..' not in p.parts and '\\' not in name and not any(part in ['.git','node_modules','.output','dist','test-results','__pycache__'] or part.startswith('.env') for part in p.parts)
before={}
with zipfile.ZipFile(args.base_zip) as z:
 for entry in z.infolist():
  if entry.is_dir():continue
  name=entry.filename.removeprefix('mydiyhaven/')
  if not safe_path(name):raise SystemExit('Unsafe or excluded path in baseline; review archive privately.')
  if name in before:raise SystemExit('Duplicate baseline path.')
  before[name]=z.read(entry)
after={}
for name in git('ls-tree','-r','--name-only',revision).decode().splitlines():
 if safe_path(name):after[name]=git('show',revision+':'+name)
def group(name):
 if name.startswith('.vibe/'):return 'preserve project metadata'
 if name=='src/routeTree.gen.ts':return 'generated route tree'
 if name.startswith('public/images/'):return 'binary assets' if not name.endswith('.svg') else 'text asset'
 if name.startswith(('src/','public/')) or name=='vite.config.ts':return 'runtime source'
 if name in ['package.json','package-lock.json','bun.lock','bunfig.toml']:return 'dependency tooling'
 return 'reference and development'
def as_text(data):
 if data is None:return ''
 if b'\0' in data:return None
 try:return data.decode('utf-8')
 except UnicodeDecodeError:return None
def redact(text):
 for value in secrets:text=text.replace(value,'[REDACTED CONFIGURED VALUE]')
 return text
rows=[]
for name in sorted(set(before)|set(after)):
 b=before.get(name);a=after.get(name)
 if a==b:continue
 status='added' if b is None else 'deleted' if a is None else 'modified'
 bt=as_text(b);at=as_text(a)
 if a is not None and any(v.encode() in a for v in secrets):raise SystemExit('Configured value found in current snapshot; aborting handoff.')
 row={'path':name,'status':status,'category':group(name),'beforeSha256':digest(b) if b is not None else None,'afterSha256':digest(a) if a is not None else None,'beforeBytes':len(b or b''),'afterBytes':len(a or b''),'text':bt is not None and at is not None}
 if row['text']:
  delta=list(difflib.ndiff((bt or '').splitlines(),(at or '').splitlines()));row.update(addedLines=sum(l.startswith('+ ') for l in delta),removedLines=sum(l.startswith('- ') for l in delta),beforeDisplayRedacted=redact(bt)!=bt)
 rows.append(row)
required=[r for r in rows if r['category'] in ['runtime source','binary assets','text asset','generated route tree'] or r['path']=='AGENTS.md']
# package.json is optional because its changes are local scripts, not dependencies.
for row in rows:row['transfer']='required' if row in required else 'optional'
manifest={'schemaVersion':1,'baselineZipName':Path(args.base_zip).name,'baselineZipSha256':digest(Path(args.base_zip).read_bytes()),'targetCommit':revision,'baselineFiles':len(before),'targetFiles':len(after),'changedFiles':len(rows),'requiredFiles':len(required),'files':rows,'preserve':['.env.local','AI Studio server secret values','.vibe/ project identity'],'deletes':[r['path'] for r in rows if r['status']=='deleted'],'note':'Original-byte hashes. Rendered before text may be redacted. Apply complete replacement files; the HTML is a review document.'}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
# Full target snapshot contains source/config assets only, no project identity or internal docs.
project_names=[n for n in after if not n.startswith(('.vibe/','docs/reference/'))]
for filename,names in [('changed-files.zip',[r['path'] for r in required if r['status']!='deleted']),('current-project.zip',project_names),('reference-files.zip',[r['path'] for r in rows if r not in required and r['status']!='deleted' and not r['path'].startswith('docs/reference/')])]:
 with zipfile.ZipFile(out/filename,'w',zipfile.ZIP_DEFLATED) as z:
  for name in names:
   if any(v.encode() in after[name] for v in secrets):raise SystemExit('Configured value found; handoff aborted.')
   z.writestr(name,after[name])
  z.writestr('HANDOFF-MANIFEST.json',json.dumps(manifest,indent=2))
prompt='''Apply the attached My DIY Haven files to this EXISTING AI Studio project as exact file replacements, preserving paths and bytes. Work in the project snapshot/duplicate first. Do not redesign, paraphrase or reconstruct the code from a screenshot. Do not publish.

First confirm that you can actually read the archive contents and create/replace project files, including binary images. List accessible paths before changing anything. If ZIP access or binary file placement is unsupported, stop and report that limitation; do not invent the missing assets or claim an import succeeded.

Use changed-files.zip as the authoritative required delta. Use HANDOFF-MANIFEST.json for expected paths and SHA-256 values. Preserve the existing .vibe project identity and GHL_LOCATION_ID/GHL_PIT secret settings. Do not request, print, change or embed their values. The runtime-source files must be applied together. Include new modules and routes. Preserve the VIBE history notice in AGENTS.md.

If the route generator rewrites src/routeTree.gen.ts, list that deviation. Do not enable payment recording or simulate a paid order: /checkout intentionally provides cart review and a fresh quote, with online payment disabled. Studio reservations are coming soon.

Run the available build/type checks and preview /, /about, /studio, /products, a variant product, a collection and /checkout. Check mobile navigation, missing-page 404s, images, cart reload and a read-only price quote. Do not create orders, invoices, messages or payments. Report each applied path, errors, and any deviations. Export the resulting codebase ZIP so the outside agent can compare it against the expected manifest before publication.
'''
(out/'IMPORT-PROMPT.md').write_text(prompt)
parts=[]
for i,row in enumerate(rows):
 name=row['path'];b=before.get(name);a=after.get(name);bt=as_text(b);at=as_text(a)
 content=''
 if row['text']:
  diff=''.join(difflib.unified_diff(redact(bt).splitlines(True),redact(at).splitlines(True),fromfile='export/'+name,tofile='current/'+name))
  content='<h3>Diff for review</h3><pre class="diff">'+''.join('<span class="'+('add' if line.startswith('+') and not line.startswith('+++') else 'del' if line.startswith('-') and not line.startswith('---') else '')+'">'+html.escape(line)+'</span>' for line in diff.splitlines(True))+'</pre>'
  if a is not None:content+='<h3>Complete current file</h3><button onclick="copyFile('+str(i)+',this)">Copy complete current file</button><button onclick="downloadFile('+str(i)+')">Download file</button><textarea id="source-'+str(i)+'" readonly spellcheck="false">'+html.escape(at)+'</textarea>'
 else:
  content='<p>Binary file. Transfer the original bytes from the ZIP; pasting a filename or image preview does not install an asset.</p>'
  if a is not None and name.startswith('public/images/'):
   mime=mimetypes.guess_type(name)[0] or 'application/octet-stream';content+='<img loading="lazy" class="asset" alt="'+html.escape(name)+'" src="data:'+mime+';base64,'+base64.b64encode(a).decode()+'">'
 content+='<p class="hash">Expected target SHA-256: '+str(row['afterSha256'])+'</p>'
 parts.append('<details data-path="'+html.escape(name)+'" data-transfer="'+row['transfer']+'"><summary><span class="badge">'+row['status']+'</span> '+html.escape(name)+' <small>'+row['category']+' · '+row['transfer']+' · '+str(row['afterBytes'])+' bytes</small></summary>'+content+'</details>')
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My DIY Haven | AI Studio handoff diff</title><style>
body{font:15px/1.6 system-ui;background:#f8f5ed;color:#29352c;margin:0}main{max-width:1200px;margin:auto;padding:40px 24px}h1{font:44px Georgia;margin:12px 0}header{border-bottom:1px solid #c9c8ba;padding-bottom:25px;margin-bottom:25px}input,select,button{font:inherit;padding:9px;margin:4px;border:1px solid #9b9f8d;border-radius:5px;background:white}input{width:min(400px,80%)}details{background:white;border:1px solid #d5d4ca;border-radius:5px;margin:12px 0;padding:15px}summary{cursor:pointer;overflow-wrap:anywhere}small{display:block;color:#687160}.badge{font-size:11px;text-transform:uppercase;color:#75462d}pre{overflow:auto;max-height:600px;font:12px/1.5 monospace;white-space:pre;background:#f4f4ef;padding:15px}pre span{display:block;min-height:1em}.add{background:#dcebdc}.del{background:#f4dfda}textarea{display:block;width:100%;height:300px;box-sizing:border-box;font:12px/1.5 monospace;white-space:pre;overflow:auto;margin-top:10px}.asset{max-width:360px;max-height:260px;object-fit:contain;background:#e6e5dc}.hash{font:11px monospace;overflow-wrap:anywhere}.toolbar{position:sticky;top:0;background:#f8f5ed;z-index:2;padding:10px 0}.stats{display:flex;gap:25px;flex-wrap:wrap}.stats b{font-size:26px}a{color:#774c32}#notice{font-size:13px}details[hidden]{display:none}</style><main><header><p>My DIY Haven / export-to-repo comparison</p><h1>The exact work to bring back.</h1><p>Compared directly with the supplied mydiyhaven.zip. Complete current files are available below for copy/paste; binary assets are in the transfer ZIP. No secret values are included.</p><div class="stats">STATS</div><p>Target commit: COMMIT<br>Baseline ZIP SHA-256: BASEHASH</p><p>Before-text containing configured values is redacted for review. File hashes still describe the original bytes. This page is not an executable patch.</p></header><div class="toolbar"><input id="filter" aria-label="Filter files" placeholder="Filter by path"><select id="scope" aria-label="Transfer scope"><option value="all">All changed files</option><option value="required">Required transfer</option><option value="optional">Optional references/tooling</option></select><button onclick="document.querySelectorAll('details:not([hidden])').forEach(e=>e.open=true)">Expand visible</button><button onclick="document.querySelectorAll('details').forEach(e=>e.open=false)">Collapse all</button><p id="notice" role="status"></p></div>PARTS</main><script>
const names=NAMES;
function filter(){document.querySelectorAll('details').forEach(e=>e.hidden=!e.dataset.path.toLowerCase().includes(document.querySelector('#filter').value.toLowerCase())||(document.querySelector('#scope').value!=='all'&&e.dataset.transfer!==document.querySelector('#scope').value));}document.querySelector('#filter').addEventListener('input',filter);document.querySelector('#scope').addEventListener('change',filter);
async function copyFile(i,button){const area=document.querySelector('#source-'+i);try{await navigator.clipboard.writeText(area.value);button.textContent='Copied';}catch{area.focus();area.select();document.querySelector('#notice').textContent='Clipboard access is unavailable here. The full file is selected; press Ctrl+C or Command+C.';}}
function downloadFile(i){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([document.querySelector('#source-'+i).value],{type:'text/plain;charset=utf-8'}));a.download=names[i].split('/').pop();a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
</script></html>'''
counts={s:sum(r['status']==s for r in rows) for s in ['added','modified','deleted']}
stats=''.join('<span><b>'+str(v)+'</b> '+k+'</span>' for k,v in counts.items())+'<span><b>'+str(len(required))+'</b> required files</span>'
page=page.replace('STATS',stats).replace('COMMIT',revision).replace('BASEHASH',manifest['baselineZipSha256']).replace('PARTS',''.join(parts)).replace('NAMES',json.dumps([r['path'] for r in rows]).replace('<','\\u003c'))
(out/'diff.html').write_text(page)
print(json.dumps({'revision':revision,'baselineFiles':len(before),'targetFiles':len(after),'changes':counts,'required':len(required),'textRequired':sum(r['text'] for r in required),'binaryRequired':sum(not r['text'] for r in required),'output':str(out)},indent=2))
# The shared-file viewer serves HTML but not ZIP directly. This page downloads
# the exact verified archive as a Blob, without a separate upload service.
archive=(out/'changed-files.zip').read_bytes()
download_page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>My DIY Haven transfer bundle</title><style>body{font:16px/1.7 system-ui;background:#faf7f0;color:#303b2d;max-width:760px;margin:60px auto;padding:24px}button{background:#303b2d;color:white;border:0;border-radius:5px;padding:16px 24px;font:inherit;cursor:pointer}textarea{width:100%;height:370px;margin-top:15px;box-sizing:border-box;padding:12px}code{overflow-wrap:anywhere;font-size:12px}</style><h1>My DIY Haven transfer bundle</h1><p>44 required files: 35 text files and 9 raster images, plus a manifest. No configured secrets. Download the ZIP, then attach it to the snapshot project if AI Studio supports archive attachments.</p><button id="download">Download changed-files.zip (3.3 MB)</button><p id="status" role="status"></p><p>ZIP SHA-256: <code>HASH</code></p><h2>Prompt to paste with the attachment</h2><textarea aria-label="Import prompt" readonly>PROMPT</textarea><p>Select the prompt above and copy it. Ask the builder to confirm archive access and exact file placement before applying. Do not publish until the re-export is verified.</p><script>const payload='PAYLOAD';document.querySelector('#download').onclick=()=>{const bytes=Uint8Array.from(atob(payload),c=>c.charCodeAt(0));const url=URL.createObjectURL(new Blob([bytes],{type:'application/zip'}));const a=document.createElement('a');a.href=url;a.download='changed-files.zip';a.click();document.querySelector('#status').textContent='Download requested. Check your browser downloads.';setTimeout(()=>URL.revokeObjectURL(url),10000);};</script></html>'''
(out/'download.html').write_text(download_page.replace('HASH',digest(archive)).replace('PROMPT',html.escape(prompt)).replace('PAYLOAD',base64.b64encode(archive).decode()))
