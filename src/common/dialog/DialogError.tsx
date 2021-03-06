import React, {PropsWithChildren} from 'react'
import {Link} from '../Link'
import {Trans} from '../Trans'
import './DialogError.scss'

interface DialogErrorProps {
  helpURL?: string | null
}

export const DialogError = ({
  children,
  helpURL = null,
}: PropsWithChildren<DialogErrorProps>): JSX.Element => (
  <div className="DialogError">
    {children}
    {helpURL && (
      <Link href={helpURL} className="help">
        <Trans k={['common', 'link', 'learnMore']} />
      </Link>
    )}
  </div>
)
