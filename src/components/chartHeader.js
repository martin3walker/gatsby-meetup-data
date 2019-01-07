import React from 'react'
import chartStyles from '../components/charts.module.css'

const ChartHeader = ({data}) => (
  <div className = {chartStyles.headerContainer}>
    {
      data.map(string => <p> {string} </p>)
    }
  </div>
)

export default ChartHeader
