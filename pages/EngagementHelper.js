// A function to conver ISO string like 2022-10-17T00:00:00.000Z to date and month like 17 Oct"
const convertISODateToDateAndMonth = (date) => {
  const numericDate = date.getDate();
  const numericMonth = date.getMonth() + 1;

  const getAbbreviatedMonth = (month) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months[month - 1];
  };

  const abbreviatedMonth = getAbbreviatedMonth(numericMonth);
  const result = `${numericDate} ${abbreviatedMonth}`;

  return result;
};

const engagementMessageOverTimeChartOptions = (messageCountList, channels) => {
  const channelExistenceMap = {};
  const channelDateMap = {};
  let minDateString, maxDateString;
  let datesGenerated = false;
  const chartCategories = [];
  const chartSeries = [];

  // looping through each messageCount
  messageCountList.forEach(({ count, channelId, timeBucket }, index) => {
    // initializing the earliest and latest dates in the list
    if (!index) {
      minDateString = timeBucket;
      maxDateString = timeBucket;
    } else {
      if (timeBucket < minDateString) {
        minDateString = timeBucket;
      } else if (timeBucket > maxDateString) {
        maxDateString = timeBucket;
      }
    }

    // checking and storing if a specific channel exist in channels array or not
    // so that we don't have to run find function on array time and again
    let doesChannelExist;
    if (channelExistenceMap[channelId]) {
      if (channelExistenceMap[channelId] === "false") {
        doesChannelExist = false;
      } else {
        doesChannelExist = true;
      }
    } else {
      doesChannelExist = channels.find(({ id }) => channelId === id);
      channelExistenceMap[channelId] = doesChannelExist ? true : "false";
    }

    // storing the dates and number of messages of a specific channel
    // the channelDateMap looks something like this
    // channelDateMap = {
    //         channelId:{ dateOfMessage:numberOfMessage,date2:number2},
    //         channelId2:{date3:number3}
    // }
    if (doesChannelExist) {
      if (channelDateMap[channelId]) {
        if (channelDateMap[channelId][timeBucket]) {
          channelDateMap[channelId][timeBucket] += parseInt(count);
        } else {
          channelDateMap[channelId][timeBucket] = parseInt(count);
        }
      } else {
        channelDateMap[channelId] = { [timeBucket]: parseInt(count) };
      }
    }
  });

  const minDate = new Date(minDateString);
  const maxDate = new Date(maxDateString);

  // looping through each channel in channelDateMap and building the categories and series object as required to the charting library
  for (let channelId in channelDateMap) {
    const noOfDates = Object.keys(channelDateMap[channelId]).length;
    if (noOfDates > 1) {
      const newSeriesObject = {
        name: channels.find(({ id }) => channelId === id).name,
        connectNulls: true,
        data: [],
      };

      for (
        let startDate = minDate;
        startDate <= maxDate;
        startDate.setDate(startDate.getDate() + 1)
      ) {
        if (!datesGenerated) {
          chartCategories.push(convertISODateToDateAndMonth(startDate));
        }

        newSeriesObject.data.push(
          channelDateMap[channelId][startDate.toISOString()] || null
        );
      }

      datesGenerated = true;
      chartSeries.push(newSeriesObject);
    }
  }

  return {
    title: {
      text: "Channel Messages",
    },
    chart: {
      type: "spline",
    },
    xAxis: {
      categories: chartCategories,
    },
    yAxis: {
      title: {
        text: "Message recieved",
      },
    },
    series: chartSeries,
  };
};

module.exports = { engagementMessageOverTimeChartOptions };
