import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { KlarnaPlugin } from '../types'

const storageTarget = 'kco/merchant-data'

const plugin: KlarnaPlugin = {
  name: 'merchantData',
  onConfirmation: ({ result, dispatch }) => {
    if (result.merchantData) {
      if (!localStorage.getItem(storageTarget)) {
        EventBus.$emit('kco-merchant-data', {
          merchantData: JSON.parse(result.merchantData),
          result
        })
        localStorage.setItem(storageTarget, 'sent')
      }
      dispatch('kco/resetMerchantData')
    }
  }
}

export default plugin
