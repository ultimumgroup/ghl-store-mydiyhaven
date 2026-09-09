"""Read-only checkout capability probes. Outputs allowlisted summaries only.
Never creates contacts, invoices, orders, messages or payments. No raw responses saved.
"""
import json, urllib.request, urllib.error
from pathlib import Path
from urllib.parse import urlencode
root = Path(__file__).resolve().parents[1]
env = {}
for line in (root / '.env.local').read_text().splitlines():
    if '=' in line and not line.lstrip().startswith('#'):
        k, v = line.split('=', 1); env[k.strip()] = v.strip().strip('\"\'')
location, pit = env['GHL_LOCATION_ID'], env['GHL_PIT']
def get(path, query, version='v3'):
    request = urllib.request.Request('https://services.leadconnectorhq.com' + path + '?' + urlencode(query), headers={'Authorization': 'Bearer ' + pit, 'Version': version, 'Accept': 'application/json', 'User-Agent': 'MyDIYHaven-Diagnostics/1.0'})
    try:
        with urllib.request.urlopen(request, timeout=25) as response: return response.status, json.load(response)
    except urllib.error.HTTPError as error: return error.code, {}
    except Exception: return 0, {}
def run():
    result = {'requestVersion': 'v3', 'mode': 'GET-only', 'probes': {}}
    common = {'altId': location, 'altType': 'location'}
    for name, path, query in [
        ('storeSettings', '/store/store-setting', common),
        ('shippingZones', '/store/shipping-zone', {**common, 'limit': 100, 'offset': 0, 'withShippingRate': 'true'}),
        ('invoiceSettings', '/invoices/settings', common),
        ('whiteLabelProviders', '/payments/integrations/provider/whitelabel', {**common, 'limit': 100, 'offset': 0}),
        ('customProvider', '/payments/custom-provider/connect', {'locationId': location}),
    ]:
        status, data = get(path, query); summary = {'httpStatus': status}
        if name == 'shippingZones' and status == 200:
            zones = data.get('data', []); rates = [r for z in zones for r in z.get('shippingRates', [])]
            summary.update(zoneCount=len(zones), rateCount=len(rates), carrierRateCount=sum(bool(r.get('isCarrierRate')) for r in rates))
        if name == 'storeSettings' and status == 200:
            origin = (data.get('data') or {}).get('shippingOrigin') or {}
            summary['shippingOriginHasCountry'] = bool(origin.get('country'))
        if name == 'whiteLabelProviders' and status == 200:
            rows = data.get('providers', []); summary['providerCount'] = len(rows) if isinstance(rows, list) else None
        result['probes'][name] = summary
    status, data = get('/products/', {'locationId': location, 'limit': 1, 'offset': 0})
    result['probes']['products'] = {'httpStatus': status}
    products = data.get('products', [])
    if products:
        product = products[0]
        status, prices = get('/products/' + product['_id'] + '/price', {'locationId': location, 'limit': 100, 'offset': 0})
        rows = prices.get('prices', [])
        def count_stripe_refs(value):
            if isinstance(value, dict): return sum(count_stripe_refs(v) for v in value.values())
            if isinstance(value, list): return sum(count_stripe_refs(v) for v in value)
            return int(isinstance(value, str) and value.startswith(('prod_', 'price_', 'acct_')))
        result['probes']['samplePrices'] = {'httpStatus': status, 'samplePriceCount': len(rows), 'stripeStyleReferencesInSampleProductAndPrices': count_stripe_refs(product) + count_stripe_refs(rows)}
    print(json.dumps(result, indent=2))
if __name__ == '__main__': run()
