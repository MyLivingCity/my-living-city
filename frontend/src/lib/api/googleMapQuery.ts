import axios from 'axios';
import { API_BASE_URL } from '../constants';

//const GoogleLocationSearchURLPrefix='https://maps.googleapis.com/maps/api/place/textsearch/json?query=';
//const GoogleLocationDetialSearchURLPrefix = 'https://maps.googleapis.com/maps/api/place/details/json?placeid=';

export const searchForLocation = async (coords: any) =>{
    //variables for location information
    let country=null;
    let province=null;
    let city=null;
    let city2=null;
    // let cities: string[] = [];
    //if lat or lon is not valid
    if(!coords.lat||!coords.lon){
        throw new Error('lat or lon variable is missing');
    }
    //const parsedPayload = {'lat':lat,'lon':lon};
    //Google place search api call
    const searchRes = await axios({
        method: 'post',
        url: `${API_BASE_URL}/location/searchLocation`,
        data: coords,
        headers: {'Access-Control-Allow-Origin': '*'},
        withCredentials:false
    });
    if(!searchRes){
        console.log('no data!');
    }else{
        console.log(searchRes.data);
    }
    //Extract place id from location search response
    const placeId = searchRes.data.placeId;
    if(placeId){
        //Google locaiton details query call
        const detailRes = await axios({
            method: 'get',
            url: `${API_BASE_URL}/location/locationDetails/${placeId}`,
            headers: {'Access-Control-Allow-Origin': '*'},
            withCredentials: false
        });
       
        const {country,province,city, city2} = detailRes.data;
        if(country.length===0|| (city.length === 0 && city2.length === 0)||province.length===0){
            throw new Error("Location search doesn't give enough information");
        }
        return{country, province, city, city2};
    }

    return {country,province,city, city2};
    
};