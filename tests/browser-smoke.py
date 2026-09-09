"""Read-only GHL integration and local browser cart checks. No checkout writes."""
import json,os
from pathlib import Path
from urllib.parse import unquote
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
base=os.environ.get('MDH_BASE','http://127.0.0.1:4317')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/local/share/ms-playwright/chromium-1234/chrome-linux64/chrome',args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1280,'height':900})
 page=context.new_page();errors=[]
 page.on('pageerror',lambda e:errors.append(str(e).splitlines()[0]))
 assert page.goto(base+'/store-diagnostics',wait_until='networkidle',timeout=120000).status==200
 data=json.loads(page.locator('pre').first.inner_text())
 page.goto(base+'/products',wait_until='networkidle',timeout=120000)
 href=page.locator('a[href^="/products/"]').first.get_attribute('href')
 assert href
 page.goto(base+href,wait_until='networkidle',timeout=120000)
 if page.get_by_role('combobox').count():
  page.get_by_role('combobox').click()
  page.get_by_role('option').filter(has_not_text='Sold out').first.click()
 page.get_by_role('button',name='Add to cart',exact=True).click()
 page.get_by_role('link',name='Review cart',exact=True).click()
 page.get_by_role('button',name='Check current prices and stock').wait_for()
 cookie=next(c for c in context.cookies() if c['name']=='mdh_cart')
 saved=json.loads(unquote(cookie['value']))
 assert saved['v']==2 and len(saved['lines'])==1
 assert set(saved['lines'][0])=={'productId','variantId','quantity'}
 page.reload(wait_until='networkidle',timeout=120000)
 page.get_by_role('button',name='Check current prices and stock').click()
 page.get_by_text('Current item subtotal:',exact=False).wait_for(timeout=60000)
 page.get_by_text('Online payment is not available yet',exact=False).wait_for()
 assert page.locator('input[autocomplete="cc-number"]').count()==0
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
 (root/'test-results').mkdir(exist_ok=True)
 page.screenshot(path=str(root/'test-results/cart-mobile.png'),full_page=True)
 assert next(c for c in context.cookies() if c['name']=='mdh_cart')['value']==cookie['value']
 # SSR content remains readable when JavaScript is disabled.
 plain=browser.new_context(java_script_enabled=False)
 static=plain.new_page();static.goto(base+href,wait_until='domcontentloaded',timeout=120000)
 assert static.locator('h1').inner_text().strip()
 assert '$' in static.locator('body').inner_text()
 for line in (root/'.env.local').read_text().splitlines():
  if '=' in line and not line.lstrip().startswith('#'):
   value=line.split('=',1)[1].strip().strip('\"\'')
   if value:errors=[e.replace(value,'[redacted]') for e in errors]
 assert not errors,errors
 print('PASS: catalog diagnostics, product option selection, compact cookie, cart reload, quote interaction, mobile width, JS-disabled product SSR, zero page errors; no payment writes.')
 browser.close()
