import axios from "axios";
import { GOOGLE_MAP_API_KEY } from "../constants";

const GoogleLocationSearchURLPrefix='https://maps.googleapis.com/maps/api/place/textsearch/json?query=';
const GoogleLocationDetialSearchURLPrefix = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=';

export const searchForLoaction = async (lat:number,lon:number) =>{
    //variables for location information
    let country='';
    let province='';
    let city='';
    //if lat or lon is not valid
    if(lat>90||lon>90||lat<-90||lon<-90){
        throw new Error("lat or lon variable contains invalid values");
    }
    //Google place search api call
    const searchRes = await axios.get(GoogleLocationSearchURLPrefix+lat+','+lon+'&key='+GOOGLE_MAP_API_KEY);
    //Extract place id from location search response
    const placeId = searchRes.data.results[0]?.place_id;

    if(placeId){
        //Google locaiton details query call
        const detailRes = await axios.get(GoogleLocationDetialSearchURLPrefix+placeId+'$key='+GOOGLE_MAP_API_KEY);

        const data = detailRes.data;
        if(data.result.address_components){
            const addressComponents = data.result.address_components;
            addressComponents.forEach((component: any) => {
                if(component.types[0]=="locality"){
                    city = component.long_name;
                }else if(component.types[0]=="administrative_area_level_1"){
                    province = component.short_name;
                }else if(component.types[0]=="country"){
                    country = component.long_name;
                }
            });
        }
    }

    if(country.length==0||city.length==0||province.length==0){
        throw new Error("Location search doesn't give enough information")
    }

    return {country,province,city};
    
}