const apiKey = 'AIzaSyABCcZGZWDpupI-IS4m-bgDNXatdyF54Y8';
const placeId = 'ChIJV_YxeITzBAERefznEKaDrkc';
const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=it`;

async function testFetch() {
  try {
    const res = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews.rating,reviews.text,reviews.authorAttribution,reviews.relativePublishTimeDescription,reviews.publishTime'
      }
    });
    const data = await res.json();
    console.log('STATUS:', res.status);
    console.log('RESPONSE:', JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}

testFetch();
