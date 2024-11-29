import express from 'ultimate-express';
import * as dialectService from '../services/dialect';
import { loadGeoJSON, } from '../utils';
import path from 'path';
import { LANGUAGE } from '../utils/constant';

const router = express.Router();


router.get('/', async (req: express.Request, res: express.Response) => {

  const dialects = dialectService.queryDialects();
  // const dialectGeojson = await loadGeoJSON(path.join(__dirname, '../database/方言.geojson'))
  // const dialects = dialectGeojson.features.map(feature => feature.properties[LANGUAGE]) 

  res.send({
    success: true,
    data: dialects
  }) 
});
router.get('/geo', async (req: express.Request, res: express.Response) => {

  const dialectGeojson = await loadGeoJSON(path.join(__dirname, '../database/方言.geojson')) 
  res.send({
    success: true,
    data: dialectGeojson
  })
});

export default router;