exports.sourceNodes =  async ({ actions, createNodeId, createContentDigest }) => {
  const { createNode } = actions

  const axios = require("axios");
  const contentful = require("contentful");
  const client = contentful.createClient({
    space: "fo9twyrwpveg",
    accessToken:
      "353a78b3e8194b600f196ce5792e0f086a91e236fe9ff04e8097b26a9064330f"
  });

  //Get meetups stored in Contentful
  const getContentfulEvents = async (entryType, eventType) => {
    const events = await client.getEntries({
      content_type: entryType,
      "fields.type": eventType
    });
    return events;
  };

  //Get videos stored in youtube
  const getPlaylist = async (playlistId, nextPage, videos = []) => {
    let url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&key=AIzaSyBQ6ra4mODnP97LHnOgfn6VJSSI74qf5RQ&maxResults=5&part=snippet${
      nextPage ? `&pageToken=${nextPage}` : ""
    }`;

    const result = await axios.get(url);
    const { items, nextPageToken } = result.data;
    const currentVideos = [...videos, ...items];
    if (nextPageToken) {
      return await getPlaylist(playlistId, nextPageToken, currentVideos);
    }
    return currentVideos;
  };

  const getVideos = async _ => {
    let videos = await getPlaylist(
      "PLAaQpb7XfX3A-zw_mtqIUfY9kqRN_cAAq",
      null,
      []
    );
    let ids = videos.map(video => video.snippet.resourceId.videoId);
    let url = `https://www.googleapis.com/youtube/v3/videos?id=${ids}&key=AIzaSyBQ6ra4mODnP97LHnOgfn6VJSSI74qf5RQ&maxResults=5&part=snippet,contentDetails,statistics`;
    const result = await axios.get(url);
    return result.data.items;
  };

  //Get meetup data stored in meetup.com
  const getMeetupEvents = async _ => {
    const result = await axios.get(
      "https://api.meetup.com/self/events?key=223151318612e4556a60227a3c125d&order=time"
    );
    const contentfulMeetups = result.data.filter(event =>
      event.group.name.includes("Contentful")
    );
    return contentfulMeetups;
  };

  //Get meetup group data stored in meetup pro
  const getMeetupGroups = async events => {
    let url =
      "https://api.meetup.com/pro/contentful-developers-meetups/groups?key=223151318612e4556a60227a3c125d";
    const result = await axios.get(url);

    return result;
  };

  // Combine event, video, and group data
  const combineData = async _ => {
    let youtubeVideos, contentfulEvents, meetupEvents, meetupGroups;

    [
      youtubeVideos,
      contentfulEvents,
      meetupEvents,
      meetupGroups
    ] = await Promise.all([
      getVideos(),
      getContentfulEvents("event", "Contentful Meetup"),
      getMeetupEvents(),
      getMeetupGroups()
    ]);


    const fullEventData = contentfulEvents.items.map(event => {
      return {
        name: event.fields.name,
        city: event.fields.locationCity.split(",")[0],
        url: event.fields.meetupUrl,
        associatedVideos: event.fields.videoUrls
          ? event.fields.videoUrls.map(videoUrl => {
              return youtubeVideos.find(video => {
                let url = videoUrl;
                return video.id === videoUrl;
              });
            })
          : [],
        eventDetails: meetupEvents.find(object => {
          let meetupUrl = event.fields.meetupUrl;
          return object.link === meetupUrl;
        })
      };
    });

    const data = meetupGroups.data.map(dataSet => {
      let events = fullEventData.filter(meetup => {
        let city = meetup.city;
        city === 'Brooklyn' ? city = 'New York' : city = city;
        return city === dataSet.city
      })
      return {
        name: dataSet.name,
        city: dataSet.city,
        member_count: dataSet.member_count,
        repeat_rsvpers: dataSet.repeat_rsvpers,
        average_rsvps: dataSet.rsvps_per_event,
        events: events.sort((a,b) => {
          return new Date(a.eventDetails.local_date) - new Date(b.eventDetails.local_date)
        })
      };
    });
    return data;
  };

  const communityData = await combineData();

  communityData.forEach(dataSet => {
    let nodeMeta = {
      id: createNodeId(dataSet.name),
      parent: null,
      children: [],
      internal: {
        type: `communityData`,
        contentDigest: createContentDigest(dataSet)
      }
    };

    let node = Object.assign({}, dataSet, nodeMeta);

    return createNode(node);
  })

}
