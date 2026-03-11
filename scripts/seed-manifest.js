// Seed script — outputs the initial manifest.json matching the current hardcoded gallery data.
// Usage: node scripts/seed-manifest.js > manifest.json
// Then upload manifest.json to the root of the nicer-images R2 bucket.

const R2 = "https://images.nicertatscru.com";

const manifest = {
  collections: [
    {
      id: "murals",
      name: "Murals",
      images: [
        { src: "/gallery/big-pun-memorial-wall.jpg", title: "Big Pun Memorial Wall" },
        { src: "/gallery/Houston-Bowery-Wall.jpg", title: "Houston Bowery Wall" },
        { src: "/gallery/BLM-Foley-Square.jpg", title: "BLM Foley Square" },
        { src: "/gallery/Nicer-v.jpg", title: "Nicer Character Piece" },
        { src: "/gallery/i-love-the-bronx.jpg", title: "I Love The Bronx" },
        { src: "/gallery/Graffiti_Hall_of_Fame.jpg", title: "Graffiti Hall of Fame" },
        { src: "/gallery/Wheels-Academy.jpg", title: "WHEELS Academy Mural" },
      ],
    },
    {
      id: "morocco-paintings",
      name: "Morocco Paintings",
      images: [
        { src: `${R2}/morocco-paintings/Conflict.jpg`, title: "Conflict" },
        { src: `${R2}/morocco-paintings/The-Hand.jpg`, title: "The Hand" },
        { src: `${R2}/morocco-paintings/The-Third-Eye.jpg`, title: "The Third Eye" },
        { src: `${R2}/morocco-paintings/What-makes-the-world-go-round.jpg`, title: "What Makes the World Go Round" },
      ],
    },
    {
      id: "like-a-child-at-play",
      name: "Like a Child at Play",
      images: [
        { src: `${R2}/like-a-child-at-play/Paintings-inventory-Like-a-child-at-play-show-page-1.jpg`, title: "Like a Child at Play — I" },
        { src: `${R2}/like-a-child-at-play/Paintings-inventory-sheet-like-a-child-at-play-show-page-2.jpg`, title: "Like a Child at Play — II" },
      ],
    },
    {
      id: "naughty-but-nicer",
      name: "Naughty but Nicer",
      images: [
        { src: `${R2}/naughty-but-nicer/Blue%20with%20Red%20Tag.jpg`, title: "Blue with Red Tag" },
        { src: `${R2}/naughty-but-nicer/Drip-Cover.jpg`, title: "Drip Cover" },
        { src: `${R2}/naughty-but-nicer/Get-Milked.jpg`, title: "Get Milked" },
        { src: `${R2}/naughty-but-nicer/IMG_2492.JPG`, title: "Untitled Study I" },
        { src: `${R2}/naughty-but-nicer/IMG_2500.JPG`, title: "Untitled Study II" },
        { src: `${R2}/naughty-but-nicer/IMG_3424.JPG`, title: "Untitled Study III" },
        { src: `${R2}/naughty-but-nicer/Paintings-inventory-sheet-page-3.jpg`, title: "Collection Overview" },
        { src: `${R2}/naughty-but-nicer/Untitled-1.jpg`, title: "Naughty but Nicer I" },
        { src: `${R2}/naughty-but-nicer/Untitled-2.jpg`, title: "Naughty but Nicer II" },
        { src: `${R2}/naughty-but-nicer/Untitled-3.jpg`, title: "Naughty but Nicer III" },
      ],
    },
  ],
};

console.log(JSON.stringify(manifest, null, 2));
