export const DEPENDENCY_RULES = [
  { sourceTag: 'pkg:tokens', onlyDependOnLibsWithTags: [] },
  { sourceTag: 'pkg:themes', onlyDependOnLibsWithTags: ['pkg:tokens'] },
  { sourceTag: 'pkg:core', onlyDependOnLibsWithTags: ['pkg:tokens', 'pkg:themes'] },
  { sourceTag: 'pkg:brand-icons', onlyDependOnLibsWithTags: ['pkg:icons'] },
  { sourceTag: 'pkg:ui', onlyDependOnLibsWithTags: ['pkg:core', 'pkg:icons', 'pkg:themes', 'pkg:tokens'] },
  { sourceTag: 'pkg:blocks', onlyDependOnLibsWithTags: ['pkg:ui', 'pkg:core', 'pkg:icons', 'pkg:themes', 'pkg:tokens'] },
  { sourceTag: 'type:app', onlyDependOnLibsWithTags: ['*'] },
];
