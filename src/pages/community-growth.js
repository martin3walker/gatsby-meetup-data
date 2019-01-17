import React from 'react'
import { graphql } from 'gatsby'
import { Line } from 'react-chartjs-2'

import Header from '../components/header.js'
import Layout from '../components/layout.js'
import ChartHeader from '../components/chartHeader.js'

import chartStyles from '../components/charts.module.css'

const CommunityGrowthCharts = ({ data }) => {
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  const today = new Date().getTime()

  const createMiliMonths = ({ startDate, months }) => {
    const monthlyMiliseconds = 2592000000
    months = months.reverse()
    return months.map(month => {
      return startDate - month * monthlyMiliseconds
    })
  }
  const createChartLabels = ({ miliMonths }) => {
    return miliMonths.map(month => new Date(month).toDateString().slice(4, 17))
  }

  const miliMonths = createMiliMonths({ startDate: today, months: months })
  const chartLabels = createChartLabels({ miliMonths: miliMonths })

  const createGrowthData = ({ communityMembers, miliMonths }) => {
    return miliMonths.map(month => {
      let list = communityMembers.filter(member => member.join_time < month)
      return list.length
    })
  }

  const growthCharts = data.allCommunityData.edges.map(edge => {
    return {
      city: edge.node.city,
      data: {
        labels: chartLabels,
        datasets: [
          {
            data: createGrowthData({
              communityMembers: edge.node.members,
              miliMonths: miliMonths,
            }),
            borderWidth: 2,
            label: 'Community Members',
            borderColor: 'rgba(212, 70, 95, .8)',
            backgroundColor: 'rgba(212, 70, 95, .2)',
            pointBackgroundColor: 'rgba(212, 70, 95, .8)',
          },
        ],
      },
      options: {},
    }
  })
  return (
    <Layout>
      <Header />
      <section className={chartStyles.sectionContainer}>
        {growthCharts.map(chart => {
          return (
            <div className={chartStyles.chartContainer}>
              <ChartHeader data={[chart.city]} />
              <Line data={chart.data} options={chart.options} />
            </div>
          )
        })}
      </section>
    </Layout>
  )
}

export default CommunityGrowthCharts

export const query = graphql`
  query {
    allCommunityData {
      edges {
        node {
          city
          members {
            join_time
          }
        }
      }
    }
  }
`
