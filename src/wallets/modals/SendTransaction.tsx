import React, {useState, FunctionComponent} from 'react'
import {ModalProps} from 'antd/lib/modal'
import {wrapWithModal} from '../../common/MantisModal'
import {Wei, etherValue} from '../../common/units'
import {DialogTextSwitch} from '../../common/dialog/DialogTextSwitch'
import {
  FeeEstimates,
  getNextNonce,
  TRANSFER_GAS_LIMIT,
  MIN_GAS_PRICE,
} from '../../common/wallet-state'
import './SendTransaction.scss'
import {
  SendBasicTransaction,
  SendAdvancedTransaction,
  ConfirmBasicTransaction,
  ConfirmAdvancedTransaction,
} from '../sendTransaction'
import {Transaction} from '../history'

enum TransactionType {
  basic = 'BASIC',
  advanced = 'ADVANCED',
}

interface BasicTransactionParams {
  amount: string
  fee: string
  recipient: string
}

interface AdvancedTransactionParams {
  amount: string
  gasLimit: string
  gasPrice: string
  recipient: string
  data: string
  nonce: string
}

interface TransactionParams {
  [TransactionType.basic]: BasicTransactionParams
  [TransactionType.advanced]: AdvancedTransactionParams
}

interface SendTransactionFlowProps {
  availableAmount: Wei
  estimateTransactionFee: () => Promise<FeeEstimates>
  transactions: readonly Transaction[]
  onCancel: () => void
}

export const _SendTransactionFlow: FunctionComponent<SendTransactionFlowProps & ModalProps> = ({
  availableAmount,
  onCancel,
  estimateTransactionFee,
  transactions,
}: SendTransactionFlowProps & ModalProps) => {
  const defaultState: TransactionParams = {
    [TransactionType.basic]: {
      amount: '0',
      fee: '',
      recipient: '',
    },
    [TransactionType.advanced]: {
      amount: '',
      gasLimit: String(TRANSFER_GAS_LIMIT),
      gasPrice: etherValue(MIN_GAS_PRICE).toFixed(),
      recipient: '',
      data: '',
      nonce: getNextNonce(transactions).toString(),
    },
  }

  const [transactionParams, setTransactionParams] = useState<TransactionParams>(defaultState)

  const [step, setStep] = useState<'send' | 'confirm'>('send')
  const [transactionType, _setTransactionType] = useState<TransactionType>(TransactionType.basic)

  const resetState = (): void => {
    setTransactionParams(defaultState)
  }

  const setTransactionType = (type: TransactionType): void => {
    _setTransactionType(type)
    resetState()
  }

  const setBasicTransactionParams = (basicParams: Partial<BasicTransactionParams>): void => {
    setTransactionParams((oldParams) => ({
      [TransactionType.basic]: {...oldParams[TransactionType.basic], ...basicParams},
      [TransactionType.advanced]: oldParams[TransactionType.advanced],
    }))
  }

  const setAdvancedTransactionParams = (
    advancedParams: Partial<AdvancedTransactionParams>,
  ): void => {
    setTransactionParams((oldParams) => ({
      [TransactionType.basic]: oldParams[TransactionType.basic],
      [TransactionType.advanced]: {...oldParams[TransactionType.advanced], ...advancedParams},
    }))
  }

  if (step === 'confirm') {
    return transactionType === TransactionType.basic ? (
      <ConfirmBasicTransaction
        transactionParams={transactionParams[transactionType]}
        onClose={onCancel}
        onCancel={() => setStep('send')}
      />
    ) : (
      <ConfirmAdvancedTransaction
        transactionParams={transactionParams[transactionType]}
        onClose={onCancel}
        onCancel={() => setStep('send')}
      />
    )
  } else {
    return (
      <>
        <DialogTextSwitch
          left={{label: 'Transfer', type: TransactionType.basic}}
          right={{label: 'Advanced', type: TransactionType.advanced}}
          onChange={setTransactionType}
        />
        {transactionType === 'BASIC' ? (
          <SendBasicTransaction
            transactionParams={transactionParams[TransactionType.basic]}
            setTransactionParams={setBasicTransactionParams}
            onSend={() => setStep('confirm')}
            availableAmount={availableAmount}
            estimateTransactionFee={estimateTransactionFee}
            onCancel={onCancel}
          />
        ) : (
          <SendAdvancedTransaction
            transactionParams={transactionParams[TransactionType.advanced]}
            setTransactionParams={setAdvancedTransactionParams}
            onSend={() => setStep('confirm')}
            estimateTransactionFee={estimateTransactionFee}
            onCancel={onCancel}
          />
        )}
      </>
    )
  }
}

export const SendTransactionFlow = wrapWithModal(_SendTransactionFlow, 'SendTransactionModal')
