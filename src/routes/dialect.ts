import express from 'ultimate-express';
import * as dialectService from '../services/dialect';
import { loadGeoJSON, } from '../utils';
import path from 'path';
import { JC, LANGUAGE, YDYS } from '../utils/constant';

const router = express.Router();


router.get('/', async (req: express.Request, res: express.Response) => {

  res.send({
    success: true,
    data: req.app.locals.dialectInfos
  }) 
});
router.get('/geo', async (req: express.Request, res: express.Response) => {

  const dialectGeojson = await loadGeoJSON(path.join(__dirname, '../database/方言.geojson')) 
  res.send({
    success: true,
    data: dialectGeojson
  })
});
router.get('/geo/tree', async (req: express.Request, res: express.Response) => {
  function transformGeoJsonToTree(geoJson) {
    const tree = {};
  
    function addDialectNode(dialectPath, language, node) {
      if (dialectPath.length === 0) return;
  
      const currentLevel = dialectPath.shift();
      if (!node[currentLevel]) {
        node[currentLevel] = { label: currentLevel, value: currentLevel, dialects: [] };
      }
  
      // Add the language to the current level's dialects array if it's not already there.
      if (!node[currentLevel].dialects.includes(language)) {
        node[currentLevel].dialects.push(language);
      }
  
      // Recursively process the remaining dialectPath
      if (dialectPath.length > 0) {
        if (!node[currentLevel].children) {
          node[currentLevel].children = {};
        }
        addDialectNode(dialectPath, language, node[currentLevel].children);
      }
    }
  
    geoJson.features.forEach(feature => {
      const dialectLevels = feature.properties['地圖集二分區'].split('-');
      const language = feature.properties['語言'];
      addDialectNode(dialectLevels, language, tree);
    });
  
    // Convert the object to an array and clean up empty children.
    function cleanUpEmptyChildren(node) {
      if (node.children) {
        // Clean up each child recursively.
        node.children = Object.values(node.children).map(cleanUpEmptyChildren);
  
        // Remove the children property if it's empty.
        if (node.children.length === 0) {
          delete node.children;
        }
      }
      return node;
    }
  
    // Convert the tree object into an array and clean up any empty children.
    const result = Object.values(tree).map(cleanUpEmptyChildren);
  
    // Sort the dialects in each node for consistency (optional).
    result.forEach(function sortDialectsRecursively(node) {
      if (node.dialects) {
        node.dialects.sort();
      }
      if (node.children) {
        node.children.forEach(sortDialectsRecursively);
      }
    });
  
    return result;
  }
   
  
  const dialectGeojson = await loadGeoJSON(path.join(__dirname, '../database/方言.geojson')) 
  // 使用方法：
  const transformedData = transformGeoJsonToTree(dialectGeojson); 
  res.send({
    success: true,
    data: transformedData
  })
});

export default router;