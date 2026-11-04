# SafeClick privacy audit — 4 November 2026

## Scope and evidence
Repository katismie/SafeClick.de, main commit d66273419c196c6c55be66feaa99b21a371b4948. Read using the connected GitHub integration. Complete recursive tree inspected: index.html, experience.js, experience.css, local model-viewer bundle and image/model assets; no build manifest, backend, workflow or AGENTS.md present in that snapshot.
Static source audit, not a live browser/network/cookie audit. Binary GLB content was not returned by the connector, so model extensions and external URIs could not be inspected. Hosting configuration and contracts were not accessible from source.

## Findings
- index.html: Impressum and Datenschutz were placeholders. Product statement about location transmission is not a website privacy notice.
- Fonts: Arial/Helvetica/system sans-serif; no Google Fonts requests or font imports in authored HTML/CSS.
- Own code: no analytics, tag manager, Meta Pixel/fbq, Cookiebot, tracking pixels, geolocation API, cookie writes, Web Storage, beacon or event collection endpoint found.
- No submission forms or newsletter/lead capture. The range input is a local OFF/ON/SOS demonstration. Mehr erfahren invokes goTo(1), without a measurement event. Pointer/scroll handlers animate the view locally.
- Script sources: local assets/model-viewer.min.js, local experience.js and inline UI code. Images and model are relative local assets.
- Vendor bundle contains runtime defaults for https://www.gstatic.com/draco/versioned/decoders/1.5.6/, https://www.gstatic.com/basis-universal/versioned/2021-04-15-ba1c3e4/ and https://cdn.jsdelivr.net/npm/three@0.149.0/examples/jsm/loaders/LottieLoader.js. Generic fetch/image loading code is present. These are conditional loader paths, not evidence that all are requested. Documentation/license/schema URLs in a bundle are not themselves tracking.
- GitHub Pages processes visitor IPs for security independently of whether site analytics exists.

## Proposed changes
Dedicated German Impressum and Datenschutzerklärung; direct navigation/footer links; old fragment IDs retained as links for bookmarks; remove accordion-only JS handler. Legal pages have no scripts/model-viewer and are readable without JavaScript. Shared responsive system-font stylesheet. Both pages visibly marked as drafts and noindex until the unresolved facts below are confirmed.
Company details match https://cesus.tech/impressum/ as retrieved 4 November 2026. The site operator was confirmed by the user. No invented telephone number, DPO or retention period.
Do not copy the obsolete EU ODR platform paragraph from the corporate imprint: the platform was discontinued in 2025. The separate VSBG statement still needs company confirmation.

## Before merge/publication
1. CESUS.tech confirms current address, representatives, register/VAT details, any assigned Wirtschafts-ID, actual rapid/direct communication channel and VSBG statement.
2. Confirm whether a DPO exists and add contact if applicable.
3. Confirm GitHub contractual entity/address, controller/processor roles and applicable Art. 28 arrangement; actual log fields/retention and Art. 44 ff. transfer mechanism/means to obtain safeguards. Do not invent a 7/14/30-day retention period or assume an applicable DPF certification. Consider another host if requirements cannot be met.
4. Confirm mail provider/recipients, transfers, deletion policy and applicable legal retention periods.
5. In a clean browser profile with cache disabled, record network and cookie/storage state on initial load, model completion, scroll, Mehr erfahren and OFF/ON/SOS. Include redirects, decoder/texture requests and response Set-Cookie headers. Inspect the GLB JSON for extensions and external image/buffer URIs. Self-host any required decoder dependencies, retaining licenses, or disclose actual recipients/purposes/bases/transfers accurately. Re-test after changes.
6. Check desktop/mobile and no-JS legal links from initial load and deep links. Remove review paragraphs/draft banners and noindex only after factual/legal sign-off.

## Future Instagram measurement
Instagram advertising alone does not install a pixel on this site. If Meta Pixel is later added: assess Art. 6(1)(a) GDPR and §25 TDDDG consent requirements; block marketing scripts AND image/noscript beacons before opt-in; make refusal as easy as acceptance and provide persistent withdrawal; validate no pre-consent requests and no subsequent events after withdrawal. Describe actual Meta entity, events/identifiers, purposes, retention, transfers, applicable joint-controller arrangements and rights. Configure/test PageView and MehrErfahrenClick only after consent. Review Cookiebot separately if selected; it is currently absent and not added by this PR. Distinguish events from unique people. Do not add fictional Meta/Cookiebot sections now.

## Sources
- §5 DDG: https://www.gesetze-im-internet.de/ddg/__5.html
- §25 TDDDG: https://www.gesetze-im-internet.de/ttdsg/__25.html
- GDPR text / information duties and rights: https://www.bfdi.bund.de/SharedDocs/Downloads/DE/Broschueren/INFO1.pdf
- GitHub Pages data collection: https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- GitHub privacy/retention/international transfers: https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
- Company published details: https://cesus.tech/impressum/
- ODR repeal: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R3228

## Validation
Static link and source assertions checked on proposed content. No executable code introduced on legal pages. No build/test framework exists in this snapshot. Live runtime, browser layout, hosting contracts and cookie behavior remain unverified; this is not a certification of DSGVO compliance.
