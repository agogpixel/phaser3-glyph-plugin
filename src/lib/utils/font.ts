export type FontStyle = 'normal' | 'italic' | 'oblique';

export type FontVariant = 'normal' | 'small-caps';

export type FontWeight =
  | 'normal'
  | 'bold'
  | 'bolder'
  | 'lighter'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

export type FontFamily =
  | 'sans-serif'
  | 'Arial, sans-serif'
  | 'Helvetica, sans-serif'
  | 'Verdana, sans-serif'
  | 'Trebuchet MS, sans-serif'
  | 'Gill Sans, sans-serif'
  | 'Noto Sans, sans-serif'
  | 'Avantgarde, TeX Gyre Adventor, URW Gothic L, sans-serif'
  | 'Optima, sans-serif'
  | 'Arial Narrow, sans-serif'
  | 'serif'
  | 'Times, Times New Roman, serif'
  | 'Didot, serif'
  | 'Georgia, serif'
  | 'Palatino, URW Palladio L, serif'
  | 'Bookman, URW Bookman L, serif'
  | 'New Century Schoolbook, TeX Gyre Schola, serif'
  | 'American Typewriter, serif'
  | 'monospace'
  | 'Andale Mono, monospace'
  | 'Courier New, monospace'
  | 'Courier, monospace'
  | 'FreeMono, monospace'
  | 'OCR A Std, monospace'
  | 'DejaVu Sans Mono, monospace'
  | 'cursive'
  | 'Comic Sans MS, Comic Sans, cursive'
  | 'Apple Chancery, cursive'
  | 'Bradley Hand, cursive'
  | 'Brush Script MT, Brush Script Std, cursive'
  | 'Snell Roundhand, cursive'
  | 'URW Chancery L, cursive'
  | 'fantasy'
  | 'Impact, fantasy'
  | 'Luminari, fantasy'
  | 'Chalkduster, fantasy'
  | 'Jazz LET, fantasy'
  | 'Blippo, fantasy'
  | 'Stencil Std, fantasy'
  | 'Marker Felt, fantasy'
  | 'Trattatello, fantasy';

export class Font {
  get css() {
    return `${this.style} ${this.variant} ${this.weight} ${this.size}px ${this.family}`;
  }

  get args(): FontArgs {
    return [this.size, this.family, this.weight, this.style, this.variant];
  }

  constructor(
    public size: number,
    public family: FontFamily,
    public weight: FontWeight = 'normal',
    public style: FontStyle = 'normal',
    public variant: FontVariant = 'normal'
  ) {}

  toString() {
    return `Font: ${this.css}`;
  }
}

export type FontArgs = ConstructorParameters<typeof Font>;
