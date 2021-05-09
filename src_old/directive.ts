export { Directive };

import { BaseUpdater } from "./updater";

interface Directive {
  values: unknown;
  base: BaseUpdater;
}
