import { ChangeDetectionStrategy, Component, DOCUMENT, ElementRef, computed, inject, input, numberAttribute, viewChild } from '@angular/core';
import { uniqueId } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraQrCodeTokens, toStyleObject } from '@tectra-ng/themes';
import {
  TxQrDotStyle,
  TxQrErrorCorrection,
  TxQrEyeBallStyle,
  TxQrEyeFrameStyle,
  TxQrGradient,
  TxQrImageFormat,
  TxQrLayout,
  qrGradientLine,
  qrLayout,
  svgDataUrl,
  svgToPng,
  inlineSvgImages,
} from '@tectra-ng/qr';
import { TxQrCodePart } from './qr-code.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { QR_CODE_ICON_DEFAULTS } from './qr-code.icons';
import { QR_CODE_THEME } from './qr-code.theme';

const SVG_NS = 'http://www.w3.org/2000/svg';
const PAINTED = '.tx-qr-code__background, .tx-qr-code__dots, .tx-qr-code__eye-frames, .tx-qr-code__eye-balls';

@Component({
  selector: 'tx-qr-code',
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-qr-code',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
  viewProviders: [provideTxIconDefaults(QR_CODE_ICON_DEFAULTS)],
})
export class TxQrCode {
  private readonly qrCodeTheme = injectTokens(QR_CODE_THEME);

  private readonly document = inject(DOCUMENT);
  private readonly svg = viewChild<ElementRef<SVGSVGElement>>('svg');

  readonly data = input.required<string>();
  readonly size = input<number, unknown>(200, { transform: numberAttribute });
  readonly margin = input<number, unknown>(1, { transform: numberAttribute });
  readonly errorCorrection = input<TxQrErrorCorrection | undefined>(undefined);
  readonly dotStyle = input<TxQrDotStyle>('square');
  readonly eyeFrameStyle = input<TxQrEyeFrameStyle>('square');
  readonly eyeBallStyle = input<TxQrEyeBallStyle>('square');
  readonly color = input<string | undefined>(undefined);
  readonly background = input<string | undefined>(undefined);
  readonly eyeColor = input<string | undefined>(undefined);
  readonly eyeBallColor = input<string | undefined>(undefined);
  readonly gradient = input<TxQrGradient | undefined>(undefined);
  readonly logo = input<string | undefined>(undefined);
  readonly logoSize = input<number, unknown>(0.22, { transform: numberAttribute });
  readonly logoMargin = input<number, unknown>(1, { transform: numberAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraQrCodeTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxQrCodePart, TxQrCode> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('qrCode', this, this.pt, this.ptOptions);
  protected readonly translations = injectTranslations();
  protected readonly gradientId = uniqueId('tx-qr-code-gradient');
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-qr-code'), ...this.passThrough().root?.style }));

  readonly layout = computed<TxQrLayout | null>(() => {
    const data = this.data();
    if (!data) {
      return null;
    }
    try {
      return qrLayout(data, {
        margin: this.margin(),
        errorCorrection: this.errorCorrection(),
        dotStyle: this.dotStyle(),
        eyeFrameStyle: this.eyeFrameStyle(),
        eyeBallStyle: this.eyeBallStyle(),
        logo: this.logo(),
        logoSize: this.logoSize(),
        logoMargin: this.logoMargin(),
      });
    } catch {
      return null;
    }
  });
  readonly matrix = computed(() => this.layout()?.matrix ?? null);
  readonly hasError = computed(() => !!this.data() && !this.layout());
  protected readonly gradientLine = computed(() => {
    const gradient = this.gradient();
    const matrix = this.matrix();
    return gradient && matrix ? qrGradientLine(gradient, matrix.size) : null;
  });

  protected readonly dotFill = computed(() => (this.gradient() ? `url(#${this.gradientId})` : (this.color() ?? null)));
  protected readonly label = computed(() => this.ariaLabel() ?? this.translations().qrCode);

  toSvgString(): string {
    const svg = this.svg()?.nativeElement;
    const view = this.document.defaultView;
    if (!svg || !view) {
      return '';
    }
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const source = Array.from(svg.querySelectorAll<SVGElement>(PAINTED));
    Array.from(clone.querySelectorAll<SVGElement>(PAINTED)).forEach((element, index) => {
      const fill = view.getComputedStyle(source[index]).fill;
      element.setAttribute('fill', fill.startsWith('url(') ? `url(#${this.gradientId})` : fill);
    });
    clone.querySelectorAll('*').forEach((element) => {
      element.removeAttribute('class');
      element.removeAttribute('style');
      Array.from(element.attributes)
        .filter((attribute) => attribute.name.startsWith('_ng'))
        .forEach((attribute) => element.removeAttribute(attribute.name));
    });
    clone.removeAttribute('class');
    clone.removeAttribute('style');
    clone.removeAttribute('role');
    clone.removeAttribute('aria-label');
    Array.from(clone.attributes)
      .filter((attribute) => attribute.name.startsWith('_ng'))
      .forEach((attribute) => clone.removeAttribute(attribute.name));
    const comments = this.document.createTreeWalker(clone, NodeFilter.SHOW_COMMENT);
    const found: Node[] = [];
    while (comments.nextNode()) {
      found.push(comments.currentNode);
    }
    found.forEach((comment) => comment.parentNode?.removeChild(comment));
    clone.setAttribute('xmlns', SVG_NS);
    return new view.XMLSerializer().serializeToString(clone);
  }

  async toDataUrl(format: TxQrImageFormat = 'png', pixelSize = 1024): Promise<string> {
    const svg = this.toSvgString();
    return format === 'svg' ? svgDataUrl(await inlineSvgImages(svg)) : svgToPng(svg, pixelSize);
  }

  async download(format: TxQrImageFormat = 'png', fileName = 'qr-code', pixelSize = 1024): Promise<void> {
    const link = this.document.createElement('a');
    link.href = await this.toDataUrl(format, pixelSize);
    link.download = `${fileName}.${format}`;
    link.click();
  }
}
