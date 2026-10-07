# Safer Parks Front End

This repository contains the code for the front end of the Safer Parks dashboard.

Note that this will not work locally without a server, e.g. the index.html will not correctly load the datafiles.

- Includes message of the day option
- All regions accessible via one front-end site
- Park features and features near parks share one toggle and are grouped into the ordered categories defined in `js/park-feature-categories.js`; only features within the selected park's 800 m expanded bounding box are shown.
    - Can update the bounding box logic etc. to make it tidier in next version.
- Park size is pre-calculated when an authority's parks load: up to 5,000 m² is a pocket park, over 5,000 m² through 100,000 m² is medium, and over 100,000 m² is large. The initial park overview tooltip displays this test label, will use this later for bufferring.
- Park boundary is automatically always on top; have added a white border to the green line to make it more visible.