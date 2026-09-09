"""Read-only GHL diagnostics. Credentials stay in process; no raw responses saved."""
import json,os,urllib.request,urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
for line in (ROOT/'.env.local').read_text().splitlines():
 if '=' in line and not line.lstrip().startswith('#'):
  k,v=line.split('=',1);os.environ[k.strip()]=v.strip().strip('\"\'')
pit=os.environ['GHL_PIT'];location=os.environ['GHL_LOCATION_ID']
def get(path):
 try:
  req=urllib.request.Request('https://services.leadconnectorhq.com'+path,headers={'Authorization':'Bearer '+pit,'Version':'2021-07-28','User-Agent':'MyDIYHaven-Diagnostics/1.0','Accept':'application/json'})
  with urllib.request.urlopen(req,timeout=20) as res:return res.status,json.load(res)
 except urllib.error.HTTPError as e:
  body=e.read().decode(errors='replace')
  for secret in [pit,location]:body=body.replace(secret,'[redacted]')
  print('HTTP failure',e.code,body[:250])
  return e.code,{}
 except Exception:return 0,{}
def shape(v,depth=0):
 if isinstance(v,dict):return {k:shape(x,depth+1) for k,x in v.items()} if depth<3 else list(v)
 if isinstance(v,list):return {'count':len(v),'first_shape':shape(v[0],depth+1) if v else None}
 return type(v).__name__
if __name__ == '__main__':
 status,products=get('/products/?locationId='+location+'&limit=100');print('products',status,json.dumps(shape(products)))
 items=products.get('products',[])
 for p in items[:3]:
  id=p.get('_id') or p.get('id');s,d=get('/products/'+id+'/price?locationId='+location+'&limit=100')
  print('product price probe',s,json.dumps(shape(d)))
  # Product identities, names, values are public catalog data; location never printed.
  print('price amounts',[{'name':x.get('name'),'amount':x.get('amount'),'currency':x.get('currency'),'availableQuantity':x.get('availableQuantity'),'options':x.get('variantOptionIds')} for x in d.get('prices',[])][:8])
 for label,path in [('collections','/products/collections?altId='+location+'&altType=location&limit=100'),('inventory','/products/inventory?altId='+location+'&altType=location&limit=100'),('coupons','/payments/coupon/list?altId='+location+'&altType=location&limit=10')]:
  s,d=get(path);print(label,s,json.dumps(shape(d)))
 if items:
  p=items[0];print('product mapping sample',json.dumps({k:v for k,v in p.items() if k in ['name','variants','collectionIds','collections','availableInStore','price','hasPrices','productType']}))
