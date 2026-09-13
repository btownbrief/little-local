import {solveShelves} from './shelf-rules.js';
self.onmessage=({data})=>{try {self.postMessage({id:data.id,move:solveShelves(data.shelves,{width:55,depth:180,maxNodes:85000})?.[0]||null});} catch {self.postMessage({id:data.id,move:null});}};
