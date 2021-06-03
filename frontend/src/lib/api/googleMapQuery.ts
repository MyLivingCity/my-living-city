import axios from "axios";
import { GOOGLE_MAP_API_KEY } from "../constants";

const GoogleLocationSearchURLPrefix='https://maps.googleapis.com/maps/api/place/textsearch/json?query=';

export const searchForLoaction = async (lat:number,lon:number) =>{

    if(lat>90||lon>90||lat<-90||lon<-90){
        throw new Error("lat or lon variable contains invalid values");
    }

    const res = await axios.get(GoogleLocationSearchURLPrefix+lat+','+lon+'&key='+GOOGLE_MAP_API_KEY);

    return res.data
    
}