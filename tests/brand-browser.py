"""Page, navigation, SSR and responsive checks. No GHL writes or form submission."""
import os,json
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1];base=os.environ.get('MDH_BASE','http://127.0.0.1:4317')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/local/share/ms-playwright/chromium-1234/chrome-linux64/chrome',args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':1440,'height':1000},reduced_motion='reduce')
 page=context.new_page();errors=[]
 page.on('pageerror',lambda e:errors.append(str(e).splitlines()[0]))
 (root/'test-results').mkdir(exist_ok=True)
 for path in ['/','/about','/studio']:
  response=page.goto(base+path,wait_until='networkidle',timeout=120000);assert response.status==200
  page.evaluate('document.fonts.ready')
  assert page.locator('h1').count()==1
  assert page.locator('link[rel="canonical"]').get_attribute('href')=='https://mydiyhaven.com'+path
  assert page.locator('main').inner_text().strip()
  assert not page.locator('nav a[href^="/#"]').count()
  assert page.locator('a[href="https://ultimumgroup.com/solutions/dev/smart-websites"]').count()==1
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  for img in page.locator('header img, main img').all():
   if img.is_visible():
    img.scroll_into_view_if_needed()
    img.evaluate('(el) => el.decode()')
  page.evaluate('window.scrollTo(0,0)')
  for script in page.locator('script[type="application/ld+json"]').all():json.loads(script.inner_text())
  name=path.strip('/') or 'home'
  page.screenshot(path=str(root/f'test-results/{name}-desktop.png'),full_page=True)
  if path=='/':page.screenshot(path=str(root/'test-results/home-hero.png'))
  page.set_viewport_size({'width':390,'height':844})
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  page.screenshot(path=str(root/f'test-results/{name}-mobile.png'),full_page=True)
  page.get_by_role('button',name='Open menu',exact=True).click()
  mobile=page.get_by_role('navigation',name='Mobile navigation')
  assert mobile.is_visible()
  assert mobile.get_by_role('link',name='Meet Larry').get_attribute('href')=='/about'
  page.get_by_role('button',name='Close menu',exact=True).click()
  page.set_viewport_size({'width':1440,'height':1000})
 # Actual mobile route navigation closes menu.
 page.set_viewport_size({'width':390,'height':844});page.get_by_role('button',name='Open menu',exact=True).click()
 page.get_by_role('navigation',name='Mobile navigation').get_by_role('link',name='Meet Larry').click()
 page.wait_for_url('**/about');assert not page.get_by_role('navigation',name='Mobile navigation').count()
 plain=browser.new_context(java_script_enabled=False)
 static=plain.new_page()
 for path,text in [('/','Make something'),('/about','Army medic'),('/studio','Candle making')]:
  assert static.goto(base+path,wait_until='domcontentloaded').status==200
  assert text in static.locator('main').inner_text()
 # No identifiable customer data collected; sanitize any exception strings before reporting.
 for line in (root/'.env.local').read_text().splitlines():
  if '=' in line and not line.lstrip().startswith('#'):
   value=line.split('=',1)[1].strip().strip('\"\'')
   if value:errors=[e.replace(value,'[redacted]') for e in errors]
 assert not errors,errors
 browser.close()
 print('PASS: home/about/studio desktop and mobile, images, canonicals, JSON-LD, menu navigation, Ultimum link, no overflow, JS-disabled content, no page errors.')
