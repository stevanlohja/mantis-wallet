import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import {render, waitFor} from '@testing-library/react'
import {createWithProviders} from '../common/test-helpers'
import {asEther} from '../common/units'
import {BalanceDisplay} from './BalanceDisplay'

it('shows properly formatted balance', async () => {
  const availableBalance = asEther(12345)

  const {queryByText} = render(<BalanceDisplay availableBalance={availableBalance} />, {
    wrapper: createWithProviders(),
  })

  await waitFor(() => expect(queryByText('12345.00')).toBeInTheDocument(), {timeout: 2500})
})
