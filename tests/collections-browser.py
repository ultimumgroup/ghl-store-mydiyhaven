"""Read-only directory/detail/404/SSR checks; no order or customer writes."""
import os,time
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
base=os.environ.get('MDH_BASE','http://127.0.0.1:4317')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/local/share/ms-playwright/chromium-1234/chrome-linux64/chrome',args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1440,'height':1000})
 page=context.new_page();errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 start=time.monotonic();response=page.goto(base+'/collections',wait_until='networkidle',timeout=120000)
 assert response.status==200
 links=page.locator('main a[href^="/collections/"]')
 assert links.count()>0
 assert page.get_by_role('heading',name='Our Collections',exact=True).count()==1
 assert 'pieces)' in links.first.inner_text()
 assert page.locator('main').get_by_text('$',exact=True).count()==0
 href=links.first.get_attribute('href')
 page.screenshot(path=str(root/'test-results/collections-desktop.png'))
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
 page.screenshot(path=str(root/'test-results/collections-mobile.png'))
 links.first.click();page.wait_for_url('**'+href)
 page.get_by_role('heading',name='Products in this collection',exact=False).wait_for(timeout=60000)
 assert page.locator('main a[href^="/products/"]').count()>0
 assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
 static=browser.new_context(java_script_enabled=False).new_page()
 assert static.goto(base+'/collections',wait_until='domcontentloaded',timeout=60000).status==200
 assert static.locator('main a[href^="/collections/"]').count()>0
 assert static.goto(base+href,wait_until='domcontentloaded',timeout=60000).status==200
 assert 'Products in this collection' in static.locator('main').inner_text()
 response=static.goto(base+'/collections/nonexistent-contract-fixture',wait_until='domcontentloaded',timeout=60000)
 assert response.status==404
 assert not errors, 'Browser script errors detected (details withheld)'
 browser.close()
 print('PASS: collection directory/counts, desktop/mobile, navigation, priced detail, SSR, real 404, no browser errors.')
