const fs = require('fs');
const path = require('path');
const https = require('https');

const photos = [
  {
    id: "uri-1",
    filename: "vestigios-pirineos.jpg",
    url: "https://d1dpu3msttfsqg.cloudfront.net/59f15120-3290-11ed-a4fa-b7562009a0eb/45a04b1f-77cc-478d-8b23-7ad2985326df",
    title: "Vestigios de los Pirineos",
    slug: "vestigios-de-los-pirineos",
    category: "Pirineos",
    description: "Naturaleza, texturas y quietud en las laderas de Canfranc.",
    camera: "Sony a6400",
    lens: "E 18-50mm F2.8 DC DN",
    focal_length: "35mm",
    aperture: "f/5.6",
    shutter_speed: "1/250s",
    iso: "100",
    location: "Canfranc, Pirineos",
    featured: true,
    order_index: 0,
  },
  {
    id: "uri-2",
    filename: "grass-green-cloudy-white.jpg",
    url: "https://d1dpu3msttfsqg.cloudfront.net/59f15120-3290-11ed-a4fa-b7562009a0eb/ef3a0b0d-e805-4eb4-a482-bfed3a452182",
    title: "Grass Green on Cloudy White",
    slug: "grass-green-cloudy-white",
    category: "Pirineos",
    description: "Contrastes de verde y niebla sobre los valles altos de montaña.",
    camera: "Sony a6400",
    lens: "E 18-50mm F2.8 DC DN",
    focal_length: "24mm",
    aperture: "f/4.0",
    shutter_speed: "1/500s",
    iso: "100",
    location: "Encamp, Pirineos",
    featured: true,
    order_index: 1,
  },
  {
    id: "uri-3",
    filename: "wildness-warcry.jpg",
    url: "https://d1dpu3msttfsqg.cloudfront.net/59f15120-3290-11ed-a4fa-b7562009a0eb/88701a84-3e6f-47e6-ac0f-581f3f0605b7",
    title: "Wildness Warcry",
    slug: "wildness-warcry",
    category: "Pirineos",
    description: "Atmósfera salvaje y picos nevados recortados contra el cielo pirenaico.",
    camera: "Sony a6400",
    lens: "E 70-350mm F4.5-6.3 G OSS",
    focal_length: "135mm",
    aperture: "f/8.0",
    shutter_speed: "1/800s",
    iso: "160",
    location: "Pirineo Aragonés",
    featured: true,
    order_index: 2,
  },
  {
    id: "uri-4",
    filename: "homo-canfranicus.jpg",
    url: "https://d1dpu3msttfsqg.cloudfront.net/59f15120-3290-11ed-a4fa-b7562009a0eb/b67b9f22-b2f0-4ec7-9ea4-b1a0b43e3a39",
    title: "Homo Canfranicus",
    slug: "homo-canfranicus",
    category: "Pirineos",
    description: "Composición de viajes y huellas humanas entre búnkeres e historia alpina.",
    camera: "Sony a6400",
    lens: "E 18-50mm F2.8 DC DN",
    focal_length: "28mm",
    aperture: "f/2.8",
    shutter_speed: "1/160s",
    iso: "200",
    location: "Canfranc, Huesca",
    featured: true,
    order_index: 3,
  },
  {
    id: "uri-5",
    filename: "albaicin-outdoors.jpg",
    url: "https://d1dpu3msttfsqg.cloudfront.net/59f15120-3290-11ed-a4fa-b7562009a0eb/b26f884f-55c5-4a4e-adf6-b4590f76fd6d",
    title: "Albaicín Outdoors",
    slug: "albaicin-outdoors",
    category: "Urbano & Viajes",
    description: "Geometría de tejados blancos y la silueta de la Alhambra al atardecer.",
    camera: "Sony a6400",
    lens: "E 30mm F1.4 DC DN",
    focal_length: "30mm",
    aperture: "f/5.6",
    shutter_speed: "1/320s",
    iso: "100",
    location: "Granada, España",
    featured: true,
    order_index: 4,
  },
  {
    id: "uri-6",
    filename: "lost-in-translation.jpg",
    url: "https://d1dpu3msttfsqg.cloudfront.net/59f15120-3290-11ed-a4fa-b7562009a0eb/7347bceb-c6c9-46b5-bc17-b338093cd056",
    title: "Lost in Translation",
    slug: "lost-in-translation",
    category: "Street & Luz",
    description: "Luces, movimiento y sombras urbanas en tránsito.",
    camera: "Sony a6400",
    lens: "E 30mm F1.4 DC DN",
    focal_length: "30mm",
    aperture: "f/1.4",
    shutter_speed: "1/125s",
    iso: "640",
    location: "Zaragoza, España",
    featured: false,
    order_index: 5,
  },
  {
    id: "uri-7",
    filename: "llanero-bosquimano.jpg",
    url: "https://d1dpu3msttfsqg.cloudfront.net/59f15120-3290-11ed-a4fa-b7562009a0eb/8b9ed01c-958f-40cd-a325-80df0da80753",
    title: "Llanero Bosquimano",
    slug: "llanero-bosquimano",
    category: "Pirineos",
    description: "Niebla entre los troncos centenarios y el silencio del bosque pirenaico.",
    camera: "Sony a6400",
    lens: "E 18-50mm F2.8 DC DN",
    focal_length: "50mm",
    aperture: "f/4.0",
    shutter_speed: "1/200s",
    iso: "200",
    location: "Valle de Canfranc",
    featured: false,
    order_index: 6,
  },
  {
    id: "uri-8",
    filename: "fondo-canfranero.jpg",
    url: "https://d1dpu3msttfsqg.cloudfront.net/59f15120-3290-11ed-a4fa-b7562009a0eb/a03fdc2b-5c49-4cf2-90bd-b0ca8f2c9a0d",
    title: "Fondo Canfranero",
    slug: "fondo-canfranero",
    category: "Pirineos",
    description: "Profundidad de campo y verdes intensos en el corazón del Pirineo.",
    camera: "Sony a6400",
    lens: "E 18-50mm F2.8 DC DN",
    focal_length: "35mm",
    aperture: "f/2.8",
    shutter_speed: "1/400s",
    iso: "100",
    location: "Canfranc, Huesca",
    featured: false,
    order_index: 7,
  }
];

const targetDir = path.join(__dirname, '../public/photos');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function download(photo) {
  return new Promise((resolve, reject) => {
    const dest = path.join(targetDir, photo.filename);
    const file = fs.createWriteStream(dest);
    https.get(photo.url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${photo.url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log(`Downloaded ${photo.filename}`);
          resolve();
        });
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log('Downloading real photos to public/photos/...');
  for (const photo of photos) {
    try {
      await download(photo);
    } catch (e) {
      console.error(e.message);
    }
  }
  console.log('Done downloading!');
}

run();

