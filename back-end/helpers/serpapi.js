import { getJson } from 'serpapi';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.SERPAPI_KEY;

export async function reverseImageSearch(imageUrl) {
  return new Promise((resolve, reject) => {
    getJson({ engine: 'google_lens', url: imageUrl, api_key: API_KEY }, (json) => {
      resolve(json.visual_matches || []);
    });
  });
}