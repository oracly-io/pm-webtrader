import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { isFunction } from 'lodash'

import SearchIcon from '@components/SVG/Search'
import { useTranslate } from '@lib/i18n-utils'

import css from './SearchBar.module.scss'

const SearchBar = (props) => {
  const t = useTranslate()

  const onChange = useCallback(e => {
    if (isFunction(props.onSearch)) props.onSearch(e.target.value)
  }, [props.onSearch])

  return (
    <div className={css.searchbar}>
      <label className={css.icon} htmlFor="search">
        <SearchIcon />
      </label>
      <input
        type="text"
        id="search"
        placeholder={t('Search')}
        className={css.value}
        onChange={onChange}
      />

    </div>
  )
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired
}

export default React.memo(SearchBar)
