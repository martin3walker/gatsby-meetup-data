import React from 'react'
import { graphql } from 'gatsby'
import { Bar } from 'react-chartjs-2'

import Header from '../components/header.js'
import Layout from '../components/layout.js'
import ChartHeader from '../components/chartHeader.js'

import chartStyles from '../components/charts.module.css'



const OverviewCharts = ({ data }) => {

//community overview chart
  const communityOverviewChart = {
    labels:
      data.allCommunityData.edges.map(edge => edge.node.city),
    datasets: [
      {
        data: data.allCommunityData.edges.map(edge => edge.node.member_count),
        borderWidth: 2,
        border: 'rgba(49, 139, 197, 1)',
        backgroundColor: 'rgba(49, 139, 197, .4)',
        hoverBackgroundColor:'rgba(49, 139, 197, .8)',
        label: 'Member Count'
      },
      {
        data: data.allCommunityData.edges.map(edge => edge.node.repeat_rsvpers),
        borderWidth: 2,
        border: 'rgba(41, 182, 116, 1)',
        backgroundColor: 'rgba(41, 182, 116, .4)',
        hoverBackgroundColor:'rgba(41, 182, 116, .8)',
        label: 'Repeat Rsvps'
      },
      {
        data: data.allCommunityData.edges.map(edge => Math.round(edge.node.average_rsvps)),
        borderWidth: 2,
        border: 'rgba(212, 70, 95, 1)',
        backgroundColor: 'rgba(212, 70, 95, .4)',
        hoverBackgroundColor:'rgba(212, 70, 95, .8)',
        label: 'Average Rsvps'
      },
    ],
    options: {
      legend: {
        position: 'top',
        labels: {
          fontSize: 16,
          padding: 20,
        }
      },
      scales: {
        yAxes:[{
          labelString: 'Members'
        }],
        xAxes: [{
          labelString: 'Communities'
        }]
      }
    }
  };

  return (
    <Layout>
      <Header></Header>
      <section className = {chartStyles.sectionContainer}>
        <div className = {chartStyles.chartContainer}>
          <ChartHeader data =
            {
              [
                'Active Communities Overview',
                '(Click the legend above the graph to remove categories)'
              ]
            }
          />
          <Bar
            data = {communityOverviewChart}
            width = {100}
            height = {50}
            legend = {communityOverviewChart.options.legend}
          />
        </div>
      </section>
    </Layout>
  )
}



export default OverviewCharts

export const query = graphql`
  query {
    allCommunityData {
     edges {
       node {
        id,
        name,
        city,
        repeat_rsvpers,
        member_count,
        average_rsvps
        events {
          url
          name
          city
          eventDetails {
            local_date
            yes_rsvp_count
            time
          }
        }
       }
      }
    }
  }
`
