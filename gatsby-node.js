require('dotenv').config()

exports.sourceNodes = async ({
  actions,
  createNodeId,
  createContentDigest,
}) => {
  const { createNode } = actions

  const axios = require('axios')
  const contentful = require('contentful')
  const client = contentful.createClient({
    space: `${process.env.CTF_SPACE_ID}`,
    accessToken: `${process.env.CTF_ACCESS_TOKEN}`,
  })

  //Get meetups stored in Contentful
  const getContentfulEvents = async (entryType, eventType) => {
    const events = await client.getEntries({
      content_type: entryType,
      'fields.type': eventType,
    })

    events.items.forEach(
      event =>
        !event.fields.meetupUrl &&
        console.log(`
          Missing meetup URL in contentful for ${event.fields.name}`)
    )

    return events
  }

  //Get videos stored in youtube
  const getPlaylist = async (playlistId, nextPage, videos = []) => {
    let url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&key=${
      process.env.YOUTUBE_KEY
    }&maxResults=5&part=snippet${nextPage ? `&pageToken=${nextPage}` : ''}`

    const result = await axios.get(url)
    const { items, nextPageToken } = result.data
    const currentVideos = [...videos, ...items]
    if (nextPageToken) {
      return await getPlaylist(playlistId, nextPageToken, currentVideos)
    }

    return currentVideos
  }

  const getVideos = async _ => {
    let videos = await getPlaylist(
      'PLAaQpb7XfX3A-zw_mtqIUfY9kqRN_cAAq',
      null,
      []
    )
    let ids = videos.map(video => video.snippet.resourceId.videoId)

    const fetchVideos = async (ids, index = 0, videoData = []) => {
      let idSection = ids.slice(index, index + 40)
      let url = `https://www.googleapis.com/youtube/v3/videos?id=${idSection}&key=${
        process.env.YOUTUBE_KEY
      }&maxResults=5&part=snippet,contentDetails,statistics`
      const result = await axios.get(url)
      let currentVideoData = [...videoData, ...result.data.items]

      if (ids.length > index + 40) {
        index += 40
        return await fetchVideos(ids, index, currentVideoData)
      }
      return currentVideoData
    }

    const videoData = await fetchVideos(ids)

    return videoData
  }

  //Get meetup data stored in meetup.com
  const getMeetupEvents = async _ => {
    const result = await axios.get(
      `https://api.meetup.com/self/events?key=${
        process.env.MEETUP_KEY
      }&order=time`
    )
    const contentfulMeetups = result.data.filter(event =>
      event.group.name.includes('Contentful')
    )

    return contentfulMeetups
  }

  //Get meetup group data stored in meetup pro
  const getMeetupGroups = async _ => {
    let url = `https://api.meetup.com/pro/contentful-developers-meetups/groups?key=${
      process.env.MEETUP_KEY
    }`
    const result = await axios.get(url)

    return result
  }

  //Get meetup members data stored in meetup pro
  const getUsableNextLink = ({ link }) => {
    let usableLink
    let rel
    let test = link.split(',')
    if (test.length > 1) {
      usableLink = test[1]
        .split('<')[1]
        .split('>')[0]
        .toString()
      rel = test[1].split('rel=')[1].split('"')[1]
    } else {
      usableLink = link
        .split('<')[1]
        .split('>')[0]
        .toString()
      rel = link.split('rel=')[1].split('"')[1]
    }

    return [usableLink, rel]
  }

  const getMeetupMembers = async ({ url, currentList = [] }) => {
    const result = await axios.get(url)
    const link = result.headers.link
    const linkInformation = getUsableNextLink({ link: link })
    const members = [...currentList, ...result.data]

    if (linkInformation[1] != 'prev') {
      return await getMeetupMembers({
        url: `${linkInformation[0]}&key=${process.env.MEETUP_KEY}`,
        currentList: members,
      })
    }

    return members
  }

  // Combine event, video, and group data
  const combineData = async _ => {
    let youtubeVideos,
      contentfulEvents,
      meetupEvents,
      meetupGroups,
      meetupMembers
    ;[
      youtubeVideos,
      contentfulEvents,
      meetupEvents,
      meetupGroups,
      meetupMembers,
    ] = await Promise.all([
      getVideos(),
      getContentfulEvents('event', 'Contentful Meetup'),
      getMeetupEvents(),
      getMeetupGroups(),
      getMeetupMembers({
        url: `https://api.meetup.com/pro/contentful-developers-meetups/members?key=${
          process.env.MEETUP_KEY
        }`,
      }),
    ])

    const fullEventData = contentfulEvents.items.map(event => {
      return {
        name: event.fields.name,
        city: event.fields.locationCity.split(',')[0],
        url: event.fields.meetupUrl,
        host: event.fields.location,
        date: event.fields.startTime,
        updated: event.sys.updatedAt,
        speakers: event.fields.speakers,
        planningNotes: event.fields.planningNotes,
        associatedVideos: event.fields.videoUrls
          ? event.fields.videoUrls.map(videoUrl => {
              return youtubeVideos.find(video => {
                return video.id === videoUrl
              })
            })
          : [],
        eventDetails: meetupEvents.find(object => {
          let meetupUrl = event.fields.meetupUrl
          return object.link === meetupUrl
        }),
      }
    })

    // fullEventData.forEach(event => console.log(event.eventDetails.time))

    const communityData = meetupGroups.data.map(dataSet => {
      let events = fullEventData.filter(meetup => {
        let city = meetup.city
        city === 'Brooklyn' ? (city = 'New York') : (city = city)
        return city === dataSet.city
      })
      let members = meetupMembers.filter(member => {
        let groupId = member.chapters[0].id
        return groupId === dataSet.id
      })
      return {
        name: dataSet.name,
        city: dataSet.city,
        member_count: dataSet.member_count,
        repeat_rsvpers: dataSet.repeat_rsvpers,
        average_rsvps: dataSet.rsvps_per_event,
        members: members,
        events: events.sort((a, b) => {
          return (
            new Date(a.eventDetails.local_date) -
            new Date(b.eventDetails.local_date)
          )
        }),
      }
    })

    return communityData
  }

  const communityData = await combineData()

  communityData.forEach(dataSet => {
    let nodeMeta = {
      id: createNodeId(dataSet.name),
      parent: null,
      children: [],
      internal: {
        type: `communityData`,
        contentDigest: createContentDigest(dataSet),
      },
    }

    let node = Object.assign({}, dataSet, nodeMeta)

    return createNode(node)
  })
}
