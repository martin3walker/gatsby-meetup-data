import React from 'react'
import { graphql } from 'gatsby'
import { Bar } from 'react-chartjs-2'

import Header from '../components/header.js'
import Layout from '../components/layout.js'
import ChartHeader from '../components/chartHeader.js'

import chartStyles from '../components/charts.module.css'

const CommunityCharts = ({ data }) => {
  return (
    <Layout>
      <Header />
      <section className={chartStyles.sectionContainer}>
        {data.allCommunityData.edges
          .map((edge, index) => {
            return {
              data: {
                labels: edge.node.events.map((event, index) => {
                  let label = [
                    `Meetup ${index + 1}`,
                    event.eventDetails.local_date,
                  ]
                  return label
                }),
                datasets: [
                  {
                    data: edge.node.events.map(
                      event => event.eventDetails.yes_rsvp_count
                    ),
                    borderWidth: 2,
                    border: 'rgba(41, 182, 116, 1)',
                    backgroundColor: 'rgba(41, 182, 116, .4)',
                    hoverBackgroundColor: 'rgba(41, 182, 116, .8)',
                    label: 'Meetup Attendees',
                  },
                ],
              },
              options: {
                scales: {
                  yAxes: [
                    {
                      ticks: {
                        beginAtZero: true,
                      },
                    },
                  ],
                },
                title: {
                  text: edge.node.city,
                  display: false,
                  fontFamily: 'Helvetica',
                  fontColor: '#000',
                  fontSize: 32,
                  padding: 25,
                },
                hover: {
                  onHover: (event, element) => {
                    event.target.style.cursor = element[0]
                      ? 'pointer'
                      : 'default'
                    console.log(element)
                  },
                },
                maintainAspectRatio: false,
                responsive: true,
              },
              city: edge.node.city,
            }
          })
          .map(community => {
            return (
              <div className={chartStyles.chartContainer}>
                <ChartHeader
                  data={[
                    community.city,
                    "(Click an event's bar to open its meetup page in a new tab)",
                  ]}
                />
                <Bar
                  data={community.data}
                  options={community.options}
                  getElementAtEvent={elem => {
                    let targetData = data.allCommunityData.edges.find(edge => {
                      return (
                        edge.node.city === elem[0]._chart.options.title.text
                      )
                    })
                    let chartElementIndex = elem[0]._index
                    let targetUrl =
                      targetData.node.events[chartElementIndex].url
                    window.open(targetUrl, '_blank')
                  }}
                />
              </div>
            )
          })}
      </section>
    </Layout>
  )
}

export default CommunityCharts

export const query = graphql`
  query {
    allCommunityData {
      edges {
        node {
          id
          name
          city
          repeat_rsvpers
          member_count
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
