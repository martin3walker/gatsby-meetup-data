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

//upcoming events chart

  const upcomingEvents =
    data.allCommunityData.edges.flatMap(edge => {
      let events = edge.node.events;
      let upcomingEvents = events.filter(event => {
        return event.eventDetails.time > Date.now();
      })
    return upcomingEvents;
    }).sort((a,b) => {
      return new Date(a.eventDetails.local_date) - new Date(b.eventDetails.local_date)
    })

  const upcomingEventsChart = {
    labels: upcomingEvents.map(event => {
      let eventLabel = [
      event.city,
      event.eventDetails.local_date
      ];
      return eventLabel;
    }),
    datasets: [
      {
        data: upcomingEvents.map(event => event.eventDetails.yes_rsvp_count),
        borderWidth: 2,
        border: 'rgba(49, 139, 197, 1)',
        backgroundColor: 'rgba(49, 139, 197, .4)',
        hoverBackgroundColor:'rgba(49, 139, 197, .8)',
        label: 'RSVPs'
      }
    ],
    options: {
      legend: {
        position: 'top',
        labels: {
          fontSize: 16,
          padding: 20,
        }
      },
      hover: {
        onHover: (event, element) => {
          event.target.style.cursor = element[0] ? 'pointer' : 'default'
          console.log(element)
        }
      }
    }
  };

  return (
    <Layout>
      <Header></Header>
      <section className = {chartStyles.sectionContainer}>
        <div className = {chartStyles.chartContainer}>
          <ChartHeader
            data = {
              [
                'Upcoming Events',
                '(Click an event\'s bar to open its meetup page in a new tab)'
              ]
            }
          />
          <Bar
            data = {upcomingEventsChart}
            width = {100}
            height = {50}
            options = {upcomingEventsChart.options}
            getElementAtEvent = {
              elem => {
                let index = elem[0]._index
                let targetUrl = upcomingEvents[index].url
                window.open(targetUrl, '_blank')
              }
            }
          />
        </div>

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
