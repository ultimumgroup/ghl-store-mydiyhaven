"""Generate canonical public URLs from GHL; no customer data or secrets in output."""
from pathlib import Path
import importlib.util
from urllib.parse import quote
from xml.sax.saxutils import escape
root=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('probe',root/'scripts/probe-ghl.py');probe=importlib.util.module_from_spec(spec);spec.loader.exec_module(probe)
urls=['/','/about','/studio','/products','/collections']
for path,key,prefix in [('/products/?locationId='+probe.location,'products','/products/'),('/products/collections?altId='+probe.location+'&altType=location','data','/collections/')]:
 seen=set()
 for offset in range(0,10000,100):
  status,body=probe.get(path+'&limit=100&offset='+str(offset))
  if status!=200:raise SystemExit('Sitemap generation failed; existing file preserved.')
  rows=body.get(key)
  if not isinstance(rows,list):raise SystemExit('Unexpected catalog shape; existing file preserved.')
  for row in rows:
   id=row.get('_id')
   if not id or id in seen:raise SystemExit('Repeated or invalid page; existing file preserved.')
   seen.add(id)
   if key=='products' and (row.get('availableInStore') is not True or row.get('status') not in [None,'active']):continue
   if key=='data' and row.get('name')=='Default':continue
   urls.append(prefix+quote(row.get('slug') or id,safe=''))
  if len(rows)<100:break
 else:raise SystemExit('Catalog exceeds limit; existing file preserved.')
xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('  <url><loc>'+escape('https://mydiyhaven.com'+url)+'</loc></url>\n' for url in dict.fromkeys(urls))+'</urlset>\n'
(root/'public/sitemap.xml').write_text(xml)
print('Sitemap generated:',len(set(urls)),'public URLs.')
