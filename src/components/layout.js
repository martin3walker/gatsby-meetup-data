import React from 'react'
import layoutStyles from '../components/layout.module.css'

const Layout = ({children}) => (
  <div className = {layoutStyles.grid}>
    {children}
  </div>
)

export default Layout
