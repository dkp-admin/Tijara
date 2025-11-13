import { registerWebModule, NativeModule } from 'expo';

import { TijarahUtilsModuleEvents } from './TijarahUtils.types';

class TijarahUtilsModule extends NativeModule<TijarahUtilsModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(TijarahUtilsModule);
