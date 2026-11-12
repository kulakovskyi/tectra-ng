import { ConsoleMessage, Page } from '@playwright/test';

const INTENTIONALLY_MISSING = /\/missing-[^/]*$/;

const isIntentionallyMissing = (message: ConsoleMessage) => INTENTIONALLY_MISSING.test(message.location().url);

export async function trackPage(page: Page): Promise<() => Promise<{ errors: string[]; layoutShift: number }>> {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => message.type() === 'error' && !isIntentionallyMissing(message) && errors.push(message.text()));
  await page.addInitScript(() => {
    const target = window as unknown as { __layoutShift: number };
    target.__layoutShift = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!entry.hadRecentInput) {
          target.__layoutShift += entry.value;
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  return async () => ({ errors, layoutShift: await page.evaluate(() => (window as unknown as { __layoutShift: number }).__layoutShift) });
}

export async function layoutViewport(page: Page): Promise<{ width: number; height: number }> {
  return page.evaluate(() => ({ width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }));
}

export async function setDarkMode(page: Page): Promise<void> {
  await page.evaluate(() => document.documentElement.setAttribute('data-tx-theme', 'dark'));
}

export async function unresolvedVariables(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const declared = new Set<string>();
    const used = new Map<string, string>();
    const visit = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule) {
          for (const property of Array.from(rule.style)) {
            if (property.startsWith('--')) {
              declared.add(property);
            }
          }
          const names = [...rule.style.cssText.matchAll(/var\((--tx-[a-z0-9-]+)\s*\)/g)].map((match) => match[1]);
          if (!names.length) {
            continue;
          }
          try {
            if (document.querySelector(rule.selectorText.replace(/::?(before|after|placeholder|marker|selection|backdrop|-webkit-[a-z-]+|-moz-[a-z-]+)(\([^)]*\))?/g, ''))) {
              names.forEach((name) => used.set(name, rule.selectorText.slice(0, 80)));
            }
          } catch {
            continue;
          }
        } else if ('cssRules' in rule) {
          visit((rule as CSSGroupingRule).cssRules);
        }
      }
    };
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        visit(sheet.cssRules);
      } catch {
        continue;
      }
    }
    for (const element of Array.from(document.querySelectorAll<HTMLElement>('[style*="--"]'))) {
      for (const property of Array.from(element.style)) {
        if (property.startsWith('--')) {
          declared.add(property);
        }
      }
    }
    return [...used].filter(([name]) => !declared.has(name)).map(([name, selector]) => `${name} (${selector})`).sort();
  });
}
