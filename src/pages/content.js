import React, { Component } from 'react'
import { graphql } from 'gatsby'
import { HorizontalBar } from 'react-chartjs-2'

import Header from '../components/header.js'
import Layout from '../components/layout.js'
import ChartHeader from '../components/chartHeader.js'

import chartStyles from '../components/charts.module.css'

import '../../node_modules/core-js/fn/array/flat-map'

class ContentOverview extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      videoIds: null,
    }
  }

  componentDidMount() {
    const { data } = this.props

    let rawVideos = () => {
      let toMap = []
      data.allCommunityData.edges.forEach(edge => {
        edge.node.events.forEach(event => {
          toMap.push(event.associatedVideos)
        })
      })
      return toMap
    }

    const videos = rawVideos()
      .flatMap(item => item)
      .map(video => {
        return {
          title: video.snippet.title,
          views: video.statistics.viewCount,
          date: video.snippet.publishedAt.split('T')[0],
          id: video.id,
        }
      })
      .sort((a, b) => {
        return b.views - a.views
      })

    this.setState({
      videoIds: videos.map(video => video.id),
    })
  }

  render() {
    const { data } = this.props

    let videoCount = 0
    data.allCommunityData.edges.forEach(edge => {
      return edge.node.events.forEach(event => {
        videoCount += event.associatedVideos.length
      })
    })

    let rawVideos = () => {
      let toMap = []
      data.allCommunityData.edges.forEach(edge => {
        edge.node.events.forEach(event => {
          toMap.push(event.associatedVideos)
        })
      })
      return toMap
    }

    const videos = rawVideos()
      .flatMap(item => item)
      .map(video => {
        return {
          title: video.snippet.title,
          views: video.statistics.viewCount,
          date: video.snippet.publishedAt.split('T')[0],
          id: video.id,
        }
      })
      .sort((a, b) => {
        return b.views - a.views
      })

    const videoChart = {
      data: {
        labels: videos.map(video => {
          let videoLabel = [video.title, video.date]
          return videoLabel
        }),
        datasets: [
          {
            data: videos.map(video => video.views),
            borderWidth: 2,
            border: 'rgba(49, 139, 197, 1)',
            backgroundColor: 'rgba(49, 139, 197, .4)',
            hoverBackgroundColor: 'rgba(49, 139, 197, .8)',
            label: 'Views',
          },
        ],
      },
      options: {
        hover: {
          onHover: (event, element) => {
            event.target.style.cursor = element[0] ? 'pointer' : 'default'
            console.log(element)
          },
        },
        maintainAspectRatio: false,
        responsive: true,
      },
    }

    const views = () => {
      let allVideoViews = 0
      videos.forEach(video => {
        allVideoViews += Number(video.views)
      })
      return allVideoViews
    }

    return (
      <Layout>
        <Header />
        <section className={chartStyles.sectionContainer}>
          <ChartHeader
            data={[
              'Meetup Videos',
              `Total videos produced: ${videoCount}`,
              `Total views: ${views()}`,
              `(Click a bar to open its corresponding video in a new tab / hover for details)`,
            ]}
          />
          <div
            className={chartStyles.chartContainer}
            style={{ height: `300vh` }}
          >
            <HorizontalBar
              data={videoChart.data}
              options={videoChart.options}
              width={100}
              height={100}
              getElementAtEvent={elem => {
                console.log(elem)
                window.open(
                  `https://www.youtube.com/watch?v=${
                    this.state.videoIds[elem[0]._index]
                  }`,
                  '_blank'
                )
              }}
            />
          </div>
        </section>
      </Layout>
    )
  }
}

export default ContentOverview

export const query = graphql`
  query {
    allCommunityData {
      edges {
        node {
          name
          city
          events {
            name
            city
            associatedVideos {
              id
              snippet {
                title
                publishedAt
              }
              statistics {
                viewCount
              }
            }
          }
        }
      }
    }
  }
`
