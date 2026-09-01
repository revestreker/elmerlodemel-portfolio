/* The four categories: slug, title, blurb, cover image.
   Plain data — edit this file to change the site.

   It's a .js file rather than .json on purpose: a JSON file has to be fetched,
   and fetch() is blocked when the page is opened straight off the disk
   (file://). Loading the data as a script means the site works both from a
   local double-click and from a real server.
*/
window.CATEGORIES = [
  {
    "slug": "character-design",
    "title": "Character Design",
    "blurb": "Silhouettes, line-ups, turnarounds and expression sheets.",
    "cover": "assets/img/character-design/mini-mic/MikeMightFight%202.jpg"
  },
  {
    "slug": "backgrounds",
    "title": "Backgrounds",
    "blurb": "Location design, colour scripts and look development.",
    "cover": "assets/img/concept-world/2.5D%20scene/locations_v005.jpg"
  },
  {
    "slug": "storyboards",
    "title": "Storyboards",
    "blurb": "Thumbnail passes, sequence boards and shot planning.",
    "cover": "assets/img/storyboards/service-bus/thumbnail01-79f6af.jpg"
  },
  {
    "slug": "other",
    "title": "Other",
    "blurb": "Games, music visuals and frames from finished films.",
    "cover": "assets/img/other/service-bus-game/still-02.jpg"
  }
];
