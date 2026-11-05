export interface DocNavLink {
  label: string;
  path: string;
}

export interface DocNavGroup {
  title: string;
  links: DocNavLink[];
}
