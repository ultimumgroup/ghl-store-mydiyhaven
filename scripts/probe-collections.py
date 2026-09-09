import importlib.util
s=importlib.util.spec_from_file_location('probe','scripts/probe-ghl.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
status,prods=m.get('/products/?locationId='+m.location+'&limit=100')
print('product total',prods.get('total'))
_,cols=m.get('/products/collections?altId='+m.location+'&altType=location&limit=100')
for c in cols.get('data',[])[:5]:
 _,d=m.get('/products/?locationId='+m.location+'&collectionIds='+c['_id']+'&limit=100')
 print('collection',c.get('name'),'stats',c.get('stats'),'actual matches',len(d.get('products',[])),'total',d.get('total'))
