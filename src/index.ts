import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import request from "request";
import ytdl from "ytdl-core";

dotenv.config();

if (!process.env.PORT) {
   process.exit(1);
}

const app = express();

/**Bonne pratiques express */
app.use(helmet());
app.use(cors());
app.use(express.json());

// Si tu veux instancier une vue en ejs (debug)
//app.set("view engine", "ejs");

/**
 * @param uri URL de la video
 * @param filename Nom du nouveau fichier
 * @param callback Fonction appelée à la fin du telechargement
 */
const download = (uri: string, filename: string, callback: any) =>{
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    // Téléchargement du média
    request(uri).pipe(fs.createWriteStream(`./output/${filename}`)).on('close', callback);
  });
};

app.get("/", (req: any, res: any) => {
    // Retourne une vue
	//return res.render("index");
});


// POST /download?url=<youtube_url>
app.get('/download', async (req: any, res: any) => {
    // Recupere les infos de la vidéo
    const info = await ytdl.getInfo(req.query.url);
   
    // Qualités voulues (Exemple: si tu veux du 480p, tu l'ajoutes dans le tableau)
    const qualities = ["1080p60", "720p"]

    let codec: any = null;
    // Cherche l'url de la video avec codec audio et video
    for (const quality of qualities) {
        codec = info.formats.find((x: any) =>x.audioCodec &&  x.qualityLabel == quality);
        if (codec) break;
    }

    if (codec) {
        // on retire les caractères spéciaux
        let title = info.videoDetails.title.replace(/[^a-zA-Z ]/g, "");

        // on lance le telechargement
        download(codec.url, `${title}.mp4`, () => {
            console.log(`${title} downloaded !!`);
        });
    } 
    console.log('Done, check result');

    res.send(200);
});


// OUR ROUTES WILL GO HERE
app.listen(3000, () => {
	console.log("Server is running on http://localhost:3000");
});