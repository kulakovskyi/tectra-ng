import { Rule } from '@angular-devkit/schematics';
import { declareKitPackages } from '../../ng-add/index';

export function migrateDeclareKitPackages(): Rule {
  return declareKitPackages();
}
