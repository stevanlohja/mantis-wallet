import React, {useState} from 'react'
import classnames from 'classnames'
import {Button} from 'antd'
import {RightOutlined} from '@ant-design/icons'
import BigNumber from 'bignumber.js'
import {Trans} from '../common/Trans'
import {ShortNumber} from '../common/ShortNumber'
import {Account, LoadedState} from '../common/wallet-state'
import {bigSum, fillActionHandlers} from '../common/util'
import {HideTokenModal} from './modals/HideTokenModal'
import {CopyableLongText} from '../common/CopyableLongText'
import {InfoIcon} from '../common/InfoIcon'
import {SendTokenModal} from './modals/SendTokenModal'
import {TokensData, Token} from './tokens-state'
import {ReceiveTokenModal} from './modals/ReceiveTokenModal'
import './TokenList.scss'

interface TokenListProps {
  tokens: Token[]
  accounts: Account[]
  onRemoveToken: (tokenAddress: string) => void
  sendToken: TokensData['sendToken']
  estimateCallFee: LoadedState['estimateCallFee']
  sendDisabled?: boolean
}

interface DisplayTokenProps {
  token: Token
  accounts: Account[]
  onHideToken: (token: Token) => void
  sendToken: TokensData['sendToken']
  estimateCallFee: LoadedState['estimateCallFee']
  sendDisabled: boolean
}

interface AccountsProps {
  token: Token
  accounts: Account[]
  hideAccounts: () => void
  setAccountToSendFrom: (account: Account) => void
  sendDisabled: boolean
}

const Accounts = ({
  token,
  accounts,
  hideAccounts,
  setAccountToSendFrom,
  sendDisabled,
}: AccountsProps): JSX.Element => {
  return (
    <div className="accounts">
      <div className="accounts-header">
        <div>
          <Trans k={['tokens', 'label', 'address']} />
        </div>
        <div>
          <Trans k={['tokens', 'label', 'balance']} />
        </div>
        <div></div>
      </div>
      {accounts.map((account) => (
        <div className="accounts-row" key={`${token.address} ${account.address}`}>
          <div>
            <CopyableLongText content={account.address} showQrCode />
          </div>
          <div>
            <ShortNumber
              big={account.tokens[token.address] ?? new BigNumber(0)}
              decimals={token.decimals}
            />
          </div>
          <div className="actions">
            <Button
              className="action"
              type="primary"
              onClick={() => setAccountToSendFrom(account)}
              disabled={sendDisabled}
            >
              <Trans k={['tokens', 'button', 'sendToken']} />
            </Button>
          </div>
        </div>
      ))}
      <div className="accounts-footer">
        <span className="accounts-collapse" {...fillActionHandlers(hideAccounts)}>
          <Trans k={['tokens', 'button', 'collapseAccounts']} />
        </span>
      </div>
    </div>
  )
}

const DisplayToken = ({
  token,
  accounts,
  onHideToken,
  sendToken,
  estimateCallFee,
  sendDisabled,
}: DisplayTokenProps): JSX.Element => {
  const [detailsShown, setDetailsShown] = useState(false)
  const [accountToSendFrom, setAccountToSendFrom] = useState<Account>()
  const [showReceiveToken, setShowReceiveToken] = useState(false)

  const nonEmptyAccounts = accounts.filter(
    (ta) => ta.tokens[token.address] && !ta.tokens[token.address]?.isZero(),
  )

  const availableBalance = bigSum(
    nonEmptyAccounts.map((ta) => ta.tokens[token.address] ?? new BigNumber(0)),
  )

  return (
    <div className="token">
      <div className={classnames('summary', {detailsShown})}>
        <div className="symbol">
          <span
            className="collapse-icon"
            {...fillActionHandlers(() => setDetailsShown(!detailsShown))}
          >
            <RightOutlined />
          </span>
          {token.symbol}
        </div>
        <div>{token.name}</div>
        <div>
          <span className="amount">
            <ShortNumber big={availableBalance} decimals={token.decimals} />
          </span>
        </div>
        <div className="actions">
          <Button
            className="action"
            type="primary"
            disabled={nonEmptyAccounts.length === 0 || sendDisabled}
            onClick={() => setAccountToSendFrom(nonEmptyAccounts[0])}
          >
            <Trans k={['tokens', 'button', 'sendToken']} />
          </Button>
          <Button type="primary" className="action" onClick={() => setShowReceiveToken(true)}>
            <Trans k={['tokens', 'button', 'receiveToken']} />
          </Button>
          <Button className="action" onClick={() => onHideToken(token)}>
            <Trans k={['tokens', 'button', 'hideToken']} />
          </Button>
        </div>
      </div>
      {detailsShown && (
        <div className="details">
          <div className="details-info">
            <div>
              <InfoIcon
                content={<Trans k={['tokens', 'message', 'contractAddressInfo']} />}
                placement="topLeft"
              />{' '}
              <Trans k={['tokens', 'label', 'smartContractAddress']} />:
            </div>
            <div>
              <CopyableLongText content={token.address} />
            </div>
          </div>
          {nonEmptyAccounts.length > 0 && (
            <Accounts
              token={token}
              accounts={nonEmptyAccounts}
              hideAccounts={() => setDetailsShown(false)}
              setAccountToSendFrom={setAccountToSendFrom}
              sendDisabled={sendDisabled}
            />
          )}
        </div>
      )}
      {accountToSendFrom && (
        <SendTokenModal
          visible
          accounts={nonEmptyAccounts}
          defaultAccount={accountToSendFrom}
          token={token}
          estimateCallFee={estimateCallFee}
          onSendToken={async (
            token: Token,
            senderAddress: string,
            recipientAddress: string,
            amount: BigNumber,
            fee: BigNumber,
          ): Promise<void> => {
            await sendToken(token, senderAddress, recipientAddress, amount, fee)
            setAccountToSendFrom(undefined)
          }}
          onCancel={() => setAccountToSendFrom(undefined)}
        />
      )}
      <ReceiveTokenModal
        visible={showReceiveToken}
        onCancel={() => setShowReceiveToken(false)}
        token={token}
        accounts={accounts}
      />
    </div>
  )
}

export const TokenList = ({
  tokens,
  sendToken,
  estimateCallFee,
  accounts,
  onRemoveToken,
  sendDisabled = false,
}: TokenListProps): JSX.Element => {
  const [tokenToHide, setTokenToHide] = useState<Token>()

  return (
    <div className="TokenList">
      {tokens.length === 0 && (
        <div className="no-tokens">
          <Trans k={['tokens', 'message', 'noTokensToShow']} />
        </div>
      )}
      <div className="list">
        {tokens.length > 0 &&
          tokens.map((token) => (
            <DisplayToken
              key={token.address}
              token={token}
              accounts={accounts}
              onHideToken={setTokenToHide}
              estimateCallFee={estimateCallFee}
              sendToken={sendToken}
              sendDisabled={sendDisabled}
            />
          ))}
      </div>
      {tokenToHide !== undefined && (
        <HideTokenModal
          visible
          token={tokenToHide}
          onHideToken={(token: Token) => {
            onRemoveToken(token.address)
            setTokenToHide(undefined)
          }}
          onCancel={() => setTokenToHide(undefined)}
        />
      )}
    </div>
  )
}
