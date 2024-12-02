import express from 'ultimate-express';
import * as dialectService from '../services/dialect';
import { loadGeoJSON, } from '../utils';
import path from 'path';
import { LANGUAGE } from '../utils/constant';

const router = express.Router();


router.get('/', async (req: express.Request, res: express.Response) => {

  const dialectInfos = dialectService.queryDialectInfos();

  res.send({
    success: true,
    data: dialectInfos
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