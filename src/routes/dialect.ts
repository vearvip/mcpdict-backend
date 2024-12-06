import express from 'ultimate-express';
import * as dialectService from '../services/dialect';
import { loadGeoJSON, } from '../utils';
import path from 'path';
import { JC, LANGUAGE, YDYS } from '../utils/constant';

const router = express.Router();


router.get('/', async (req: express.Request, res: express.Response) => {
  // let dialectInfos 
  // if (req.session.dialectInfos) {
  //   dialectInfos = req.session.dialectInfos
  // } else {
  //   dialectInfos = dialectService.queryDialectInfos().filter(ele => ele[YDYS]); 
  //   req.session.dialectInfos = dialectInfos
  //   req.session.dialectNames = dialectInfos.map(ele => ele[JC])
  // } 

  res.send({
    success: true,
    data: req.session.dialectInfos
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