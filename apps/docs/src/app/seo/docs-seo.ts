import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TECTRA_VERSION } from '../../generated/version';
import { DESCRIPTION_LENGTH, PAGE_META, REPOSITORY_URL, SITE_IMAGE, SITE_NAME, SITE_URL, componentMeta } from '../data/seo.data';
import { DocComponent } from '../types/doc-component.interface';
import { DocBreadcrumb, DocPageMeta } from '../types/seo.interface';

const NOT_FOUND: DocPageMeta = { name: 'Not found', title: 'Page not found — tectra', description: 'This page does not exist in the tectra docs.' };
const STRUCTURED_DATA_ID = 'docs-structured-data';

function shorten(text: string, length: number): string {
  if (text.length <= length) {
    return text;
  }
  const cut = text.slice(0, length - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:—–-]+$/, '')}…`;
}

function deepest(snapshot: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  return snapshot.firstChild ? deepest(snapshot.firstChild) : snapshot;
}

@Injectable({ providedIn: 'root' })
export class DocsSeo extends TitleStrategy {
  private title = inject(Title);
  private meta = inject(Meta);
  private document = inject(DOCUMENT);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const route = deepest(snapshot.root);
    const path = snapshot.url.split(/[?#]/)[0] || '/';
    const doc = route.data['doc'] as DocComponent | null | undefined;
    const page = doc ? componentMeta(doc.title, doc.summary) : PAGE_META[path];
    if (page) {
      this.apply(path, page, path === '/' ? [] : [{ name: page.name, path }]);
    } else {
      this.apply(path, NOT_FOUND, [], false);
    }
  }

  private apply(path: string, page: DocPageMeta, breadcrumbs: DocBreadcrumb[], indexable = true): void {
    const url = `${SITE_URL}${path === '/' ? '/' : path}`;
    const description = shorten(page.description, DESCRIPTION_LENGTH);
    const image = `${SITE_URL}${SITE_IMAGE.path}`;
    this.title.setTitle(page.title);
    this.setLink('canonical', indexable ? url : null);
    const tags: [string, string, string][] = [
      ['name', 'description', description],
      ['name', 'robots', indexable ? 'index, follow' : 'noindex'],
      ['property', 'og:type', 'website'],
      ['property', 'og:site_name', SITE_NAME],
      ['property', 'og:title', page.title],
      ['property', 'og:description', description],
      ['property', 'og:url', url],
      ['property', 'og:image', image],
      ['property', 'og:image:width', String(SITE_IMAGE.width)],
      ['property', 'og:image:height', String(SITE_IMAGE.height)],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', page.title],
      ['name', 'twitter:description', description],
      ['name', 'twitter:image', image],
    ];
    for (const [attribute, name, content] of tags) {
      this.meta.updateTag({ [attribute]: name, content }, `${attribute}="${name}"`);
    }
    this.setStructuredData(indexable ? this.structuredData(url, description, breadcrumbs) : null);
  }

  private structuredData(url: string, description: string, breadcrumbs: DocBreadcrumb[]): object {
    const library = {
      '@type': 'SoftwareSourceCode',
      '@id': `${SITE_URL}/#library`,
      name: SITE_NAME,
      description: PAGE_META['/'].description,
      url: `${SITE_URL}/`,
      codeRepository: REPOSITORY_URL,
      programmingLanguage: 'TypeScript',
      runtimePlatform: 'Angular',
      license: 'https://opensource.org/licenses/MIT',
      version: TECTRA_VERSION,
      image: `${SITE_URL}${SITE_IMAGE.path}`,
    };
    const website = {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: ['tectra-ng', 'tectra UI kit'],
      url: `${SITE_URL}/`,
    };
    const page = {
      '@type': 'WebPage',
      '@id': url,
      url,
      description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#library` },
    };
    const trail = breadcrumbs.length
      ? [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [{ name: 'Docs', path: '/' }, ...breadcrumbs].map((crumb, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: crumb.name,
              item: `${SITE_URL}${crumb.path}`,
            })),
          },
        ]
      : [];
    return { '@context': 'https://schema.org', '@graph': [website, library, page, ...trail] };
  }

  private setLink(rel: string, href: string | null): void {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!href) {
      link?.remove();
      return;
    }
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', rel);
      head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private setStructuredData(data: object | null): void {
    const head = this.document.head;
    let script = head.querySelector<HTMLScriptElement>(`#${STRUCTURED_DATA_ID}`);
    if (!data) {
      script?.remove();
      return;
    }
    if (!script) {
      script = this.document.createElement('script');
      script.id = STRUCTURED_DATA_ID;
      script.type = 'application/ld+json';
      head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }
}
