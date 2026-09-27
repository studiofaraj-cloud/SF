/** The studio's contact details, in one place. */
export const CONTACT = {
  email: 'info@studiofaraj.it',
  phone: '+393202223322',
  phoneDisplay: '+39 320 222 3322',
  /** WhatsApp number in the international format wa.me expects (no + or spaces). */
  whatsapp: '393202223322',
} as const;

/** A chat with the studio on WhatsApp, with `text` already typed in. */
export function whatsappUrl(text?: string) {
  return `https://wa.me/${CONTACT.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

// Google Business Profile listing. The keyless embed is pinned by `cid`, which
// keeps pointing at the listing even if its name or the search results change;
// `q=place_id:…` does not work there (it searches for the word "place").
export const MAPS_CID = '5165210571911986297';
const PLACE_ID = 'ChIJV_YxeITzBAERefznEKaDrkc';
const MAPS_QUERY = encodeURIComponent('Studio Faraj, Via Ludovico Ariosto 42, 35128 Padova');
export const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${MAPS_QUERY}&destination_place_id=${PLACE_ID}`;
export const OPEN_IN_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}&query_place_id=${PLACE_ID}`;
