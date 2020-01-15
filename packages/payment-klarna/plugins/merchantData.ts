import EventBus from '@vue-storefront/core/compatibility/plugins/event-bus'
import { KlarnaPlugin } from '../types/KlarnaState'

const storageTarget = 'kco/merchant-data'

const plugin: KlarnaPlugin = {
  name: 'merchantData',
  onConfirmation: ({result, dispatch}) => {
    if (result.merchant_data) {
      if (!localStorage.getItem(storageTarget)) {
        EventBus.$emit('kco-merchant-data', {
          merchantData: JSON.parse(result.merchant_data),
          result
        })
        localStorage.setItem(storageTarget, 'sent')
      }
      dispatch('kco/resetMerchantData')
    }
  }
}

export default plugin
