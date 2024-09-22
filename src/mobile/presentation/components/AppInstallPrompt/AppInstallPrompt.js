import React, { useCallback, useEffect, useRef } from 'react'
import AnimatedButton from '@oracly/pm-react-components/app/mobile/components/common/AnimatedButton'
import cn from 'clsx'

import { useTranslation } from '@hooks'

import { connect } from '@state'
import { getShowInstallPrompt } from '@state/getters'

import { SHOW_INSTALL_PROMPT } from '@actions'

import Button from '@components/common/Button'
import MobileAppIcon from '@components/SVG/MobileAppIcon'
import ShareIcon from '@components/SVG/ShareIcon'
import HelpIconBottom from '@components/SVG/HelpIconBottom'
import HelpIconTop from '@components/SVG/HelpIconTop'
import CloseIcon from '@components/SVG/RoundListClose'

import { isios, isinstandalonemode, isAddressBarAtBottom } from '@utils'

import css from './AppInstallPrompt.module.scss'

const AppInstallPrompt = (props) => {
  const showInstallPrompt = props.showInstallPrompt
  const installationPrompt = useRef()
  const { t } = useTranslation()

  const beforeinstallprompt = (event) => {
    event.preventDefault()
    installationPrompt.current = event
  }

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', beforeinstallprompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeinstallprompt)
    }
  }, [])

  const install = useCallback(() => {
    if (installationPrompt.current) {
      installationPrompt.current.prompt()
    }
  }, [installationPrompt.current])

  useEffect(() => {
    if (isinstandalonemode) {
      props.SHOW_INSTALL_PROMPT({ showInstallPrompt: false })
    }
  }, [])

  const close = () => props.SHOW_INSTALL_PROMPT({ showInstallPrompt: false })
  if (!showInstallPrompt || isinstandalonemode) return null

  if (isios) {
    if (isAddressBarAtBottom()) {
      return (
        <div className={cn(css.containerIOS, css.bottom)}>
          <Button className={css.close} onClick={close}>
            <CloseIcon />
          </Button>

          <div className={css.appInfo}>
            <MobileAppIcon />
            <div className={css.text}>
              <div className={css.title}>{t('Oracly')}</div>
              <div className={css.subtitle}>{t('Mobile app')}</div>
            </div>
          </div>
          <div className={css.delimiter} />
          <div className={css.hint}>
            <div className={css.hintText}>
              {t('Tap the')} <ShareIcon /> {t('icon button below,')}
            </div>
            <div>{t('then \'Add to home screen\'.')}</div>
            <HelpIconBottom />
          </div>
        </div>
      )
    }

    return (
      <div className={cn(css.containerIOS, css.top)}>
        <div className={css.hint}>
          <div className={css.hintIcon}>
            <HelpIconTop  />
          </div>
          <div className={css.hintText}>
            {t('Tap the')} <ShareIcon /> {t('icon button,')}
          </div>
          <div>{t('then \'Add to home screen\'.')}</div>
        </div>
        <div className={css.delimiter} />
        <div className={css.appInfo}>
          <MobileAppIcon />
          <div className={css.text}>
            <div className={css.title}>{t('Oracly')}</div>
            <div className={css.subtitle}>{t('Mobile app')}</div>
          </div>
        </div>
        <Button className={css.closeButton} onClick={close}>
          {t('Close')}
        </Button>
      </div>
    )
  }

  return (
    <div className={css.containerAndroid}>
      <div className={css.left}>
        <MobileAppIcon />
        <div className={css.text}>
          <div className={css.title}>{t('Oracly')}</div>
          <div className={css.subtitle}>{t('Mobile app')}</div>
        </div>
      </div>
      <div className={css.right}>
        <AnimatedButton onClick={install} className={css.btn}>
          {t('Install')}
        </AnimatedButton>
        <Button className={css.close} onClick={close}>
          <CloseIcon />
        </Button>
      </div>
    </div>
  )
}

export default connect(
  (state) => ({ showInstallPrompt: getShowInstallPrompt(state) }),
  ({ command }) => [command(SHOW_INSTALL_PROMPT)]
)(React.memo(AppInstallPrompt))
