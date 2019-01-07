import React from 'react'
import { graphql } from 'gatsby'
import { Bar } from 'react-chartjs-2'

import Header from '../components/header.js'
import Layout from '../components/layout.js'
import ChartHeader from '../components/chartHeader.js'

import chartStyles from '../components/charts.module.css'

const IndexPage = ({data}) => {

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
      </section>
    </Layout>
  )
}

export default IndexPage

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
