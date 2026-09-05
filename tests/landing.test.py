import unittest, subprocess, pathlib, json, re, os
from html.parser import HTMLParser
ROOT = pathlib.Path(__file__).resolve().parents[1]
class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.tags=[]; self.text=text; self.feed(text)
    def handle_starttag(self, tag, attrs): self.tags.append((tag,dict(attrs)))
    def all(self, tag): return [a for t,a in self.tags if t==tag]
class Landing(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run(['node','scripts/build.mjs'],cwd=ROOT,check=True)
        cls.html=re.sub(r'\s+', ' ', (ROOT/'public/index.html').read_text()); cls.doc=Document(cls.html)
    def test_decision_first_content_is_prerendered(self):
        self.assertEqual(len(self.doc.all('h1')),1)
        self.assertIn('See what an ADU could change',self.html)
        for id in ['goals','sample','how-it-works','construction','professionals','story','pricing','faq','contact']:
            self.assertTrue(any(a.get('id')==id for _,a in self.doc.tags),id)
    def test_real_links_no_invented_new_app_route(self):
        ids={a.get('id') for _,a in self.doc.tags}
        for a in self.doc.all('a'):
            href=a.get('href',''); self.assertTrue(href)
            if href.startswith('#'): self.assertIn(href[1:],ids)
            if 'app.aduroi.com' in href: self.assertEqual(href,'https://app.aduroi.com/')
        self.assertNotRegex(self.html,r'imedadel|appstore|playstore|javascript:')
    def test_launch_copy_keeps_pricing_and_planning_boundaries(self):
        self.assertIn('Start an evaluation',self.html)
        self.assertNotRegex(self.html, r'(?i)current app|forthcoming|not live yet|before launch|coming with the redesign|planned construction|pending confirmation')
        self.assertNotRegex((ROOT/'public/404.html').read_text(), r'(?i)current app|forthcoming')
        for amount in ['$19','$200','$350']: self.assertIn(amount,self.html)
        self.assertIn('confirm the price and terms',self.html)
        self.assertIn('plan limits',self.html)
        self.assertIn('not a contractor quote',self.html)
    def test_founder_story_is_grant_singular(self):
        story = self.html.split('id="story"')[1].split('id="pricing"')[0]
        self.assertIn('Grant Olsen',story)
        self.assertNotRegex(story, r'(?i)\b(founders|we|our|us|they|their|wife)\b')
        self.assertIn('Southern California',story)
        self.assertIn('garage conversion',story)
    def test_sample_is_honest_and_reconciles(self):
        self.assertIn('Illustrative example',self.html)
        self.assertIn('not a forecast',self.html)
        data=json.loads((ROOT/'src/sample.json').read_text())
        self.assertEqual(data['withAdu']-data['withoutAdu'],data['impact'])
        self.assertEqual(sum(data['bridge'].values()),data['impact'])
        for value in ['−$1,850','−$2,400','+$550']: self.assertIn(value,self.html)
        for value in data['bridge'].values():
            formatted=('+' if value >= 0 else '−')+'$'+format(abs(value),',')
            self.assertIn(formatted,self.html)
        self.assertIn('not a payoff or investment-return calculation',self.html)
    def test_accessibility_and_no_data_capture(self):
        self.assertEqual(self.doc.all('html')[0].get('lang'),'en')
        self.assertEqual(len(self.doc.all('main')),1)
        self.assertIn('Skip to content',self.html)
        self.assertEqual(len(self.doc.all('details')),8)
        self.assertFalse(self.doc.all('form')); self.assertFalse(self.doc.all('iframe'))
        self.assertEqual(len(self.doc.all('input')),0)
        for img in self.doc.all('img'): self.assertIn('alt',img)
        ids=[a['id'] for _,a in self.doc.tags if 'id' in a]
        self.assertEqual(len(ids),len(set(ids)))
        controls=self.doc.all('button')
        self.assertEqual(len(controls),3)
        self.assertEqual(sum(a.get('aria-pressed')=='true' for a in controls),1)
        for a in controls:
            self.assertEqual(a.get('aria-controls'),'goal-insight')
            self.assertEqual(a.get('type'),'button')
        self.assertTrue(self.doc.all('noscript'))
    def test_seo_and_assets_exist(self):
        self.assertIn('<title>ADUroi',self.html)
        self.assertIn('https://aduroi.com/',self.html)
        self.assertIn('noindex, follow',self.html)
        self.assertIn('X-Robots-Tag: noindex, nofollow',(ROOT/'public/_headers').read_text())
        self.assertIn('Disallow: /',(ROOT/'public/robots.txt').read_text())
        png=(ROOT/'public/social-card.png').read_bytes()
        self.assertEqual(png[:8],b'\x89PNG\r\n\x1a\n')
        self.assertEqual(int.from_bytes(png[16:20],'big'),1200)
        self.assertEqual(int.from_bytes(png[20:24],'big'),630)
        for field in ['description','og:title','og:description','og:url','og:image','twitter:card']:
            self.assertTrue(any(a.get('name',a.get('property'))==field for a in self.doc.all('meta')),field)
        self.assertTrue((ROOT/'public/robots.txt').exists())
        self.assertIn('https://aduroi.com/',(ROOT/'public/sitemap.xml').read_text())
        self.assertIn('noindex',(ROOT/'public/404.html').read_text())
        for a in self.doc.all('link'):
            if a.get('href','').startswith('/'): self.assertTrue((ROOT/'public'/a['href'][1:]).is_file())
        for a in self.doc.all('script'):
            if 'src' in a: self.assertTrue((ROOT/'public'/a['src'].lstrip('/')).is_file())
    def test_structured_data_is_parseable_without_unverified_offers(self):
        schemas=re.findall(r'<script type="application/ld\+json">(.*?)</script>',self.html,re.S)
        self.assertTrue(schemas)
        data=json.loads(schemas[0]); self.assertEqual(data['@type'],'WebSite')
        self.assertNotIn('offers',data); self.assertNotIn('aggregateRating',data)
    def test_preview_context_rejects_production_indexing(self):
        result=subprocess.run(['node','scripts/build.mjs','--production'],cwd=ROOT,env={**os.environ,'CONTEXT':'deploy-preview'},capture_output=True,text=True)
        self.assertNotEqual(result.returncode,0)
        self.assertIn('Refusing production indexing',result.stderr)
        self.assertIn('noindex',(ROOT/'public/index.html').read_text())
    def test_production_mode_has_explicit_crawlable_artifacts(self):
        subprocess.run(['node','scripts/build.mjs','--production'],cwd=ROOT,env={**os.environ,'CONTEXT':'production'},check=True)
        try:
            page=(ROOT/'public/index.html').read_text()
            self.assertIn('index, follow',page); self.assertNotIn('noindex',page)
            self.assertIn('Allow: /',(ROOT/'public/robots.txt').read_text())
            self.assertNotIn('/404',(ROOT/'public/sitemap.xml').read_text())
            self.assertIn('noindex',(ROOT/'public/404.html').read_text())
        finally: subprocess.run(['node','scripts/build.mjs'],cwd=ROOT,check=True)
if __name__=='__main__': unittest.main()
