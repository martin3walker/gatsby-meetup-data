import React from 'react'
import planningStyles from '../components/planning.module.css'

class PlanningModule extends React.Component {
  render() {
    return (
      <div class={planningStyles.moduleContainer}>{this.props.children}</div>
    )
  }
}

export default PlanningModule
