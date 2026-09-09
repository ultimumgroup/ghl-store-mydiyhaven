"""Offline endpoint audit against the user's local v3 Toolkit snapshot."""
import json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
toolkit = root.parent / 'ultimum-ghl-master-toolkit'
source = toolkit / 'api-docs/_meta/endpoints.json'
catalog = json.loads(source.read_text())
endpoints = catalog['endpoints']
selected = [e for e in endpoints if e['section'] in {'ghl/payments','ghl/invoices','ghl/store','ghl/objects'} or e['path'] in {'/contacts/upsert','/opportunities/upsert'}]
result = {
    'source': str(source), 'snapshotGenerated': catalog['generated'],
    'endpointCount': catalog['endpoint_count'], 'webhookCount': catalog['webhook_count'],
    'orderCollectionCreateEndpoints': [e for e in endpoints if e['method']=='POST' and e['path'].rstrip('/')=='/payments/orders'],
    'checkoutCartPaymentLinkPathMatches': [e for e in endpoints if any(term in e['path'].lower() for term in ['checkout','cart','payment-link','payment_link'])],
    'candidateEndpoints': selected,
    'invoiceAndOrderWebhooks': [e for e in catalog['webhooks'] if e['name'].startswith(('Invoice','Order'))],
    'limits': ['Snapshot evidence, not a claim about undocumented/internal routes or later releases.', 'Missing scopes in the catalog are unknown, not scope-free endpoints.', 'SaaS generate-payment-link filenames resolve to subscription update endpoints in this snapshot.']
}
out = root / 'docs/checkout-endpoint-audit.json'
out.write_text(json.dumps(result, indent=2)+'\n')
print(f"Audited {len(endpoints)} catalog entries; selected {len(selected)} candidates; order-create matches: {len(result['orderCollectionCreateEndpoints'])}; checkout/cart/payment-link path matches: {len(result['checkoutCartPaymentLinkPathMatches'])}.")
